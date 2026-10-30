/**
 * Servicios del panel de administración.
 *
 * En modo mock cada recurso vive en memoria (se reinicia al recargar),
 * así las acciones del panel (aprobar, asignar, editar…) se reflejan en la UI.
 */
import { propiedadesAdmin } from '@/mocks/propiedadesAdmin'
import { postulaciones } from '@/mocks/admin/postulaciones'
import { actividades } from '@/mocks/admin/actividades'
import { usuarios } from '@/mocks/admin/usuarios'
import { solicitudes } from '@/mocks/admin/solicitudes'
import { avisos } from '@/mocks/admin/avisos'
import { visitas } from '@/mocks/admin/visitas'
import { PERMISOS_POR_ROL } from '@/constants/permisos'
import type { EstadoPropiedad, PropiedadAdmin, PropiedadFormData } from '@/types/propiedad'
import type {
  AccionTipo,
  Actividad,
  Aviso,
  EstadoSolicitud,
  Postulacion,
  RolAdmin,
  Solicitud,
  TipoAviso,
  UsuarioAdmin,
  Visita,
} from '@/types/admin'
import { fechaCorta, haceCuanto } from '@/utils/formato'
import {
  etiquetaDeTipo,
  fotos,
  formatearPrecio,
  type EstadoPublicacionApi,
  type MedioApi,
  type Pagina,
  type PropiedadPanelApi,
} from './api/propiedades'
import { ApiError, http, mockDelay, USE_MOCKS } from './http'
import { camposPropiedadApi, montoApi } from './publicaciones.service'

// ── Helpers para el modo mock ─────────────────────────────────────────────────

export function mockTable<T extends { id: number }>(seed: T[]) {
  const rows: T[] = structuredClone(seed)
  const find = (id: number) => {
    const row = rows.find((r) => r.id === id)
    if (!row) throw new ApiError(404, 'Registro no encontrado')
    return row
  }
  return {
    list: () => mockDelay(rows, 250),
    get: (id: number) => mockDelay(find(id), 200),
    create: (data: Omit<T, 'id'>) => {
      const row = { ...data, id: Math.max(0, ...rows.map((r) => r.id)) + 1 } as T
      rows.unshift(row)
      return mockDelay(row, 300)
    },
    update: (id: number, patch: Partial<T>) => mockDelay(Object.assign(find(id), patch), 250),
    remove: (id: number) => {
      rows.splice(rows.indexOf(find(id)), 1)
      return mockDelay(undefined, 200)
    },
  }
}

/**
 * Crea un CRUD REST estándar (`GET/POST /recurso`, `GET/PATCH/DELETE /recurso/:id`).
 * Con `enApi = false` el recurso sigue en memoria aunque haya API: es para los módulos
 * que todavía no tienen endpoints.
 */
export function resource<T extends { id: number }>(path: string, seed: T[], enApi = true) {
  const mock = mockTable(seed)
  const local = USE_MOCKS || !enApi
  return {
    listar: (): Promise<T[]> => (local ? mock.list() : http(path)),
    obtener: (id: number): Promise<T> => (local ? mock.get(id) : http(`${path}/${id}`)),
    crear: (data: Omit<T, 'id'>): Promise<T> =>
      local ? mock.create(data) : http(path, { method: 'POST', body: data }),
    actualizar: (id: number, patch: Partial<T>): Promise<T> =>
      local ? mock.update(id, patch) : http(`${path}/${id}`, { method: 'PATCH', body: patch }),
    eliminar: (id: number): Promise<void> =>
      local ? mock.remove(id) : http(`${path}/${id}`, { method: 'DELETE' }),
  }
}

/** Pide todas las páginas de un listado paginado de la API (máximo 100 por página). */
async function todasLasPaginas<T>(
  path: string,
  query: Record<string, string | number | boolean> = {},
) {
  const elementos: T[] = []
  for (let desplazamiento = 0; ; desplazamiento += 100) {
    const pagina = await http<Pagina<T>>(path, { query: { ...query, limite: 100, desplazamiento } })
    elementos.push(...pagina.elementos)
    if (elementos.length >= pagina.total || !pagina.elementos.length) return elementos
  }
}

const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })

// ── Personal (para asignar y mostrar nombres) ────────────────────────────────

interface PersonalApi {
  id: number
  nombre: string
  rol: string
}

let personalCache: Promise<PersonalApi[]> | null = null

export const adminPersonalService = {
  listar(): Promise<PersonalApi[]> {
    if (USE_MOCKS)
      return mockDelay(
        ['Luis Cano', 'Ana Villanueva', 'Patricia Soto', 'Carlos Medina'].map((nombre, i) => ({
          id: i + 1,
          nombre,
          rol: 'asesor',
        })),
        100,
      )
    personalCache ??= http<PersonalApi[]>('/usuarios/personal').catch((e) => {
      personalCache = null
      throw e
    })
    return personalCache
  },
  invalidar() {
    personalCache = null
  },
}

async function nombresPersonal(): Promise<Map<number, string>> {
  try {
    return new Map((await adminPersonalService.listar()).map((p) => [p.id, p.nombre]))
  } catch {
    return new Map()
  }
}

function idUsuarioActual(): number | null {
  try {
    return (
      (JSON.parse(localStorage.getItem('mu_usuario') ?? 'null') as { id?: number } | null)?.id ??
      null
    )
  } catch {
    return null
  }
}

// ── Propiedades del panel ────────────────────────────────────────────────────

const ETIQUETA_ESTADO: Record<EstadoPropiedad, string> = {
  listada: 'Listada',
  'por-listar': 'Por listar',
  'en-revision': 'En revisión',
}

/** La API tiene cinco estados de publicación; el tablero agrupa en tres columnas. */
const ESTADO_TABLERO: Record<EstadoPublicacionApi, EstadoPropiedad> = {
  publicada: 'listada',
  en_revision: 'en-revision',
  borrador: 'por-listar',
  oculta: 'por-listar',
  rechazada: 'por-listar',
}

const ETIQUETA_ESTADO_API: Record<EstadoPublicacionApi, string> = {
  borrador: 'Borrador',
  en_revision: 'En revisión',
  publicada: 'Publicada',
  oculta: 'Oculta',
  rechazada: 'Rechazada',
}

/** Transiciones de la API sin pasar por «rechazada», que exige un motivo. */
const TRANSICIONES: Record<EstadoPublicacionApi, EstadoPublicacionApi[]> = {
  borrador: ['en_revision'],
  en_revision: ['publicada'],
  publicada: ['oculta'],
  oculta: ['publicada'],
  rechazada: ['borrador'],
}
const DESTINOS: Record<EstadoPropiedad, EstadoPublicacionApi[]> = {
  listada: ['publicada'],
  'en-revision': ['en_revision'],
  'por-listar': ['borrador', 'oculta'],
}

/** Pasos de publicación para llevar una propiedad a la columna elegida (búsqueda en anchura). */
function rutaDeEstados(desde: EstadoPublicacionApi, hacia: EstadoPropiedad) {
  const cola: EstadoPublicacionApi[][] = [[desde]]
  const vistos = new Set([desde])
  while (cola.length) {
    const camino = cola.shift()!
    const actual = camino[camino.length - 1]!
    if (DESTINOS[hacia].includes(actual)) return camino.slice(1)
    for (const sig of TRANSICIONES[actual]) {
      if (!vistos.has(sig)) {
        vistos.add(sig)
        cola.push([...camino, sig])
      }
    }
  }
  return null
}

function aPropiedadAdmin(p: PropiedadPanelApi, nombres: Map<number, string>): PropiedadAdmin {
  const f = fotos(p.medios)
  return {
    id: p.id,
    clave: p.clave ?? undefined,
    titulo: p.titulo,
    colonia: p.ubicacion.zona ?? 'Sin zona',
    ciudad: p.ubicacion.ciudad ?? undefined,
    precio: formatearPrecio(p.precio_publico, p.operacion),
    tipo: p.operacion,
    habitaciones: p.recamaras ?? 0,
    banos: Number(p.banos ?? 0),
    m2: Number(p.superficie_m2 ?? 0),
    imagen: f.portada,
    imagenes: f.todas,
    estado: ESTADO_TABLERO[p.estado_publicacion],
    estadoApi: p.estado_publicacion,
    origen: p.origen,
    motivoRechazo: p.motivo_rechazo ?? undefined,
    agente: (p.asesor_id && nombres.get(p.asesor_id)) || 'Sin asesor',
    fechaIngreso: fechaCorta(p.creado_en),
    descripcion: p.descripcion ?? '',
    caracteristicas: p.amenidades,
    bienes: p.bienes,
    estacionamientos: p.estacionamientos ?? 0,
  }
}

async function obtenerPanel(id: number) {
  return http<PropiedadPanelApi>(`/propiedades/${id}`)
}

async function cambiarPublicacion(id: number, estado: EstadoPublicacionApi, motivo?: string) {
  return http<PropiedadPanelApi>(`/propiedades/${id}/publicacion`, {
    method: 'PATCH',
    body: { estado, motivo: motivo ?? null },
  })
}

/** Recorre los pasos necesarios; la API valida cada uno (p. ej. zona y precio para publicar). */
async function llevarA(p: PropiedadPanelApi, estado: EstadoPropiedad) {
  const pasos = rutaDeEstados(p.estado_publicacion, estado)
  if (!pasos)
    throw new ApiError(
      422,
      p.estado_publicacion === 'en_revision'
        ? 'Una propiedad en revisión solo puede publicarse o rechazarse con motivo.'
        : `No se puede pasar de «${ETIQUETA_ESTADO_API[p.estado_publicacion]}» a «${ETIQUETA_ESTADO[estado]}».`,
    )
  for (const paso of pasos) p = await cambiarPublicacion(p.id, paso)
  return p
}

const propiedadesBase = resource<PropiedadAdmin>('/admin/propiedades', propiedadesAdmin)

export const adminPropiedadesService = {
  /** Portafolio: todo menos lo que ofrecieron particulares y sigue en moderación. */
  async listar(): Promise<PropiedadAdmin[]> {
    if (USE_MOCKS) return propiedadesBase.listar()
    const [filas, nombres] = await Promise.all([
      todasLasPaginas<PropiedadPanelApi>('/propiedades'),
      nombresPersonal(),
    ])
    return filas
      .filter(
        (p) =>
          p.origen === 'interna' || !['en_revision', 'rechazada'].includes(p.estado_publicacion),
      )
      .map((p) => aPropiedadAdmin(p, nombres))
  },

  async obtener(id: number): Promise<PropiedadAdmin> {
    if (USE_MOCKS) return propiedadesBase.obtener(id)
    const [p, nombres] = await Promise.all([obtenerPanel(id), nombresPersonal()])
    return aPropiedadAdmin(p, nombres)
  },

  async cambiarEstado(id: number, estado: EstadoPropiedad): Promise<PropiedadAdmin> {
    if (!USE_MOCKS) {
      const [p, nombres] = await Promise.all([obtenerPanel(id), nombresPersonal()])
      return aPropiedadAdmin(await llevarA(p, estado), nombres)
    }
    const antes = await propiedadesBase.obtener(id)
    const p = await propiedadesBase.actualizar(id, { estado })
    if (antes.estado !== estado) {
      registrarActividad({
        propiedad: p.titulo,
        colonia: p.colonia,
        accion: 'estado',
        detalle: 'Cambio de estado',
        estadoAnterior: ETIQUETA_ESTADO[antes.estado],
        estadoNuevo: ETIQUETA_ESTADO[estado],
      })
    }
    return p
  },

  /**
   * Alta desde el formulario "Nueva propiedad". Con la API son varios pasos:
   * crear, subir fotos, guardar la dirección exacta (dato interno) y llevarla al estado elegido.
   */
  async crearDesdeFormulario(
    data: PropiedadFormData,
    extra: { agente: string; estado: EstadoPropiedad },
  ): Promise<PropiedadAdmin> {
    if (!USE_MOCKS) {
      const campos = await camposPropiedadApi(data)
      let p = await http<PropiedadPanelApi>('/propiedades', {
        method: 'POST',
        body: { ...campos, precio_publico: montoApi(data.precio), asesor_id: idUsuarioActual() },
      })
      if (data.imagenes.length) {
        const fd = new FormData()
        data.imagenes.forEach((f) => fd.append('archivos', f))
        await http<MedioApi[]>(`/propiedades/${p.id}/medios`, { method: 'POST', body: fd })
      }
      const direccion = [data.calle, data.colonia, data.ciudad].filter((x) => x.trim()).join(', ')
      if (data.calle.trim()) {
        // Solo quien puede editar datos internos guarda la dirección exacta.
        await http(`/propiedades/${p.id}/interno`, {
          method: 'PUT',
          body: { direccion_exacta: direccion },
        }).catch(() => undefined)
      }
      p = await llevarA(await obtenerPanel(p.id), extra.estado)
      return aPropiedadAdmin(p, await nombresPersonal())
    }
    const imagenes = data.imagenes.map((f) => URL.createObjectURL(f))
    return propiedadesBase.crear({
      titulo: data.nombre,
      colonia: data.colonia,
      ciudad: data.ciudad,
      precio: data.precio ? `$${data.precio}${data.operacion === 'renta' ? ' / mes' : ''}` : '',
      tipo: data.operacion === 'renta' ? 'renta' : 'venta',
      habitaciones: Number(data.habitaciones || 0),
      banos: Number(data.banos || 0),
      m2: Number(data.m2 || 0),
      imagen: imagenes[0] ?? '',
      imagenes,
      estado: extra.estado,
      agente: extra.agente,
      fechaIngreso: new Date().toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      descripcion: data.descripcion,
      caracteristicas: data.caracteristicas,
      estacionamientos: Number(data.estacionamientos || 0),
    })
  },
}

// ── Postulaciones (propiedades que ofrecen los dueños) ───────────────────────

interface DatosInternosApi {
  precio_real: string | null
  direccion_exacta: string | null
  propietario: { nombre: string; telefono: string | null; email: string | null } | null
}

const internos = (id: number) =>
  http<DatosInternosApi>(`/propiedades/${id}/interno`).catch(() => null)

function aPostulacion(p: PropiedadPanelApi, i: DatosInternosApi | null): Postulacion {
  const estado: Postulacion['estado'] =
    p.estado_publicacion === 'en_revision'
      ? 'pendiente'
      : p.estado_publicacion === 'rechazada'
        ? 'rechazada'
        : 'aprobada'
  return {
    id: p.id,
    titulo: p.titulo,
    tipo: p.operacion,
    tipoInmueble: etiquetaDeTipo(p.tipo),
    colonia: p.ubicacion.zona ?? 'Sin zona',
    ciudad: p.ubicacion.ciudad ?? '',
    // Lo que pide el dueño es dato interno; si aún no hay precio público se muestra ese.
    // La tarjeta agrega el signo de pesos y «/ mes», así que aquí va solo la cifra.
    precio: Number(p.precio_publico ?? i?.precio_real ?? 0).toLocaleString('es-MX', {
      maximumFractionDigits: 0,
    }),
    habitaciones: p.recamaras ?? 0,
    banos: Number(p.banos ?? 0),
    m2: Number(p.superficie_m2 ?? 0),
    imagen: fotos(p.medios).portada,
    contacto: i?.propietario?.nombre ?? 'Propietario',
    telefono: i?.propietario?.telefono ?? '',
    correo: i?.propietario?.email ?? '',
    fechaEnvio: fechaCorta(p.creado_en),
    estado,
    observaciones: p.motivo_rechazo ?? undefined,
  }
}

const postulacionesBase = resource<Postulacion>('/admin/postulaciones', postulaciones)

export const adminPostulacionesService = {
  async listar(): Promise<Postulacion[]> {
    if (USE_MOCKS) return postulacionesBase.listar()
    const filas = await todasLasPaginas<PropiedadPanelApi>('/propiedades', { origen: 'particular' })
    const datos = await Promise.all(filas.map((p) => internos(p.id)))
    return filas.map((p, i) => aPostulacion(p, datos[i] ?? null))
  },
  async aprobar(id: number): Promise<Postulacion> {
    if (!USE_MOCKS) {
      let p = await obtenerPanel(id)
      const i = await internos(id)
      // Para publicar hace falta precio público: si no lo hay, se usa el que pidió el dueño.
      if (!p.precio_publico && i?.precio_real)
        p = await http<PropiedadPanelApi>(`/propiedades/${id}`, {
          method: 'PATCH',
          body: { precio_publico: i.precio_real },
        })
      return aPostulacion(await cambiarPublicacion(id, 'publicada'), i)
    }
    const p = await postulacionesBase.actualizar(id, {
      estado: 'aprobada',
      observaciones: undefined,
    })
    registrarActividad({
      propiedad: p.titulo,
      colonia: p.colonia,
      accion: 'moderacion',
      detalle: 'Postulación aprobada para el portafolio',
    })
    return p
  },
  async rechazar(id: number, observaciones: string): Promise<Postulacion> {
    if (!USE_MOCKS)
      return aPostulacion(
        await cambiarPublicacion(id, 'rechazada', observaciones),
        await internos(id),
      )
    const p = await postulacionesBase.actualizar(id, { estado: 'rechazada', observaciones })
    registrarActividad({
      propiedad: p.titulo,
      colonia: p.colonia,
      accion: 'moderacion',
      detalle: `Postulación rechazada: ${observaciones}`,
    })
    return p
  },
}

// ── Historial de actividad (bitácora de auditoría) ───────────────────────────

interface RegistroAuditoriaApi {
  id: number
  usuario_id: number | null
  usuario_nombre: string | null
  entidad: string
  entidad_id: number
  entidad_titulo: string | null
  entidad_zona: string | null
  accion: string
  campo: string | null
  valor_anterior: string | null
  valor_nuevo: string | null
  fecha: string
}

const ETIQUETA_CAMPO: Record<string, string> = {
  titulo: 'Título',
  descripcion: 'Descripción',
  precio_publico: 'Precio público',
  zona_id: 'Zona',
  recamaras: 'Recámaras',
  banos: 'Baños',
  estacionamientos: 'Estacionamientos',
  superficie_m2: 'Superficie',
  disponibilidad: 'Disponibilidad',
  asesor_id: 'Asesor',
  destacada: 'Destacada',
  antiguedad_anios: 'Antigüedad',
  medios: 'Fotos',
}

function accionDe(r: RegistroAuditoriaApi): AccionTipo {
  if (r.accion === 'crear') return 'creacion'
  if (r.accion === 'desactivar') return 'eliminacion'
  if (r.accion === 'rechazar') return 'moderacion'
  if (r.accion === 'publicar') return 'estado'
  if (r.campo === 'precio_publico') return 'precio'
  if (r.campo === 'medios') return 'imagenes'
  if (r.campo === 'zona_id') return 'ubicacion'
  return 'edicion'
}

function aActividad(r: RegistroAuditoriaApi): Actividad {
  const estadoApi = (v: string | null) =>
    v ? (ETIQUETA_ESTADO_API[v as EstadoPublicacionApi] ?? v) : undefined
  const accion = accionDe(r)
  const campo = r.campo ? (ETIQUETA_CAMPO[r.campo] ?? r.campo) : ''
  const detalle =
    accion === 'creacion'
      ? 'Propiedad registrada'
      : accion === 'eliminacion'
        ? 'Propiedad dada de baja'
        : accion === 'moderacion'
          ? `Rechazada: ${r.valor_nuevo ?? ''}`
          : accion === 'estado'
            ? 'Cambio de estado de publicación'
            : `${campo}: ${r.valor_anterior ?? '—'} → ${r.valor_nuevo ?? '—'}`
  return {
    id: r.id,
    fecha: fechaCorta(r.fecha),
    hora: hora(r.fecha),
    propiedad: r.entidad_titulo ?? `Propiedad #${r.entidad_id}`,
    colonia: r.entidad_zona ?? '',
    agente: r.usuario_nombre ?? 'Sistema',
    accion,
    detalle,
    ...(accion === 'estado'
      ? { estadoAnterior: estadoApi(r.valor_anterior), estadoNuevo: estadoApi(r.valor_nuevo) }
      : {}),
  }
}

const actividadBase = resource<Actividad>('/admin/actividad', actividades)

export const adminActividadService = {
  async listar(): Promise<Actividad[]> {
    if (USE_MOCKS) return actividadBase.listar()
    const filas = await http<RegistroAuditoriaApi[]>('/auditoria', {
      query: { entidad: 'propiedades', limite: 200 },
    })
    return filas.map(aActividad)
  },
}

/**
 * Agrega un evento a la bitácora. Con la API, el backend registra los eventos
 * por su cuenta; aquí solo se simula para el modo mock.
 */
export function registrarActividad(
  evento: Pick<Actividad, 'propiedad' | 'colonia' | 'accion' | 'detalle'> & Partial<Actividad>,
) {
  if (!USE_MOCKS) return
  const ahora = new Date()
  const sesion = JSON.parse(localStorage.getItem('mu_usuario') ?? 'null') as {
    nombre?: string
    apellido?: string
  } | null
  void actividadBase.crear({
    fecha: ahora
      .toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
      .replace('.', ''),
    hora: ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }),
    agente: sesion?.nombre ? `${sesion.nombre} ${sesion.apellido ?? ''}`.trim() : 'Administrador',
    ...evento,
  })
}

// ── Usuarios del panel ───────────────────────────────────────────────────────

interface UsuarioApi {
  id: number
  nombre: string
  email: string
  rol: string
  activo: boolean
  ultimo_acceso: string | null
  creado_en: string
}

/** La API tiene dos roles de personal; Super Admin y Visor solo existen en el modo mock. */
const ROL_API: Partial<Record<RolAdmin, string>> = {
  super_admin: 'administrador',
  admin: 'administrador',
  agente: 'asesor',
}
const ROL_FRONT: Record<string, RolAdmin> = { administrador: 'admin', asesor: 'agente' }

function aUsuarioAdmin(u: UsuarioApi): UsuarioAdmin {
  const rol = ROL_FRONT[u.rol] ?? 'visor'
  return {
    id: u.id,
    nombre: u.nombre,
    correo: u.email,
    rol,
    estado: u.activo ? 'activo' : 'suspendido',
    ultimoAcceso: u.ultimo_acceso ? haceCuanto(u.ultimo_acceso) : 'Nunca',
    fechaCreacion: fechaCorta(u.creado_en),
    permisos: [...PERMISOS_POR_ROL[rol]],
  }
}

function rolApi(rol: RolAdmin) {
  const r = ROL_API[rol]
  if (!r)
    throw new ApiError(422, 'Ese rol todavía no existe en el sistema; usa Administrador o Agente.')
  return r
}

const usuariosBase = resource<UsuarioAdmin>('/admin/usuarios', usuarios)

export const adminUsuariosService = {
  async listar(): Promise<UsuarioAdmin[]> {
    if (USE_MOCKS) return usuariosBase.listar()
    const filas = await http<UsuarioApi[]>('/usuarios')
    return filas.filter((u) => u.rol in ROL_FRONT).map(aUsuarioAdmin)
  },
  async crear(u: Omit<UsuarioAdmin, 'id'>): Promise<UsuarioAdmin> {
    if (USE_MOCKS) return usuariosBase.crear(u)
    if (!u.password || u.password.length < 8)
      throw new ApiError(422, 'La contraseña inicial debe tener al menos 8 caracteres.')
    const creado = await http<UsuarioApi>('/usuarios', {
      method: 'POST',
      body: { nombre: u.nombre, email: u.correo, password: u.password, rol: rolApi(u.rol) },
    })
    adminPersonalService.invalidar()
    return aUsuarioAdmin(creado)
  },
  async actualizar(id: number, patch: Partial<UsuarioAdmin>): Promise<UsuarioAdmin> {
    if (USE_MOCKS) return usuariosBase.actualizar(id, patch)
    const actualizado = await http<UsuarioApi>(`/usuarios/${id}`, {
      method: 'PATCH',
      body: {
        nombre: patch.nombre,
        rol: patch.rol ? rolApi(patch.rol) : undefined,
        activo: patch.estado ? patch.estado === 'activo' : undefined,
        password: patch.password || undefined,
      },
    })
    adminPersonalService.invalidar()
    return aUsuarioAdmin(actualizado)
  },
  /** La API no borra usuarios: los desactiva para conservar su historial. */
  async eliminar(id: number): Promise<void> {
    if (USE_MOCKS) return usuariosBase.eliminar(id)
    await http(`/usuarios/${id}`, { method: 'PATCH', body: { activo: false } })
    adminPersonalService.invalidar()
  },
}

// ── Centro de solicitudes ────────────────────────────────────────────────────

interface SolicitudApi {
  id: number
  tipo: 'contacto' | 'visita' | 'vender_rentar'
  estado: 'nueva' | 'asignada' | 'atendida' | 'descartada'
  propiedad_id: number | null
  nombre: string
  telefono: string | null
  email: string | null
  mensaje: string | null
  asignado_a: number | null
  notas: string | null
  motivo_descarte: string | null
  creado_en: string
}

interface ReferenciaPropiedad {
  titulo: string
  ubicacion: string
}

const propiedadesCitadas = new Map<number, ReferenciaPropiedad>()

async function referenciar(ids: number[]) {
  const faltan = [...new Set(ids)].filter((id) => !propiedadesCitadas.has(id))
  await Promise.all(
    faltan.map(async (id) => {
      const p = await obtenerPanel(id).catch(() => null)
      propiedadesCitadas.set(id, {
        titulo: p?.titulo ?? `Propiedad #${id}`,
        ubicacion: p ? [p.ubicacion.zona, p.ubicacion.ciudad].filter(Boolean).join(', ') : '',
      })
    }),
  )
}

function aSolicitud(s: SolicitudApi, nombres: Map<number, string>): Solicitud {
  const ref = s.propiedad_id ? propiedadesCitadas.get(s.propiedad_id) : undefined
  return {
    id: s.id,
    tipo: s.tipo === 'visita' ? 'visita' : 'contacto',
    nombre: s.nombre,
    telefono: s.telefono ?? '',
    correo: s.email ?? '',
    propiedad: ref?.titulo ?? 'Contacto general',
    ubicacion: ref?.ubicacion ?? '',
    mensaje: s.mensaje ?? '',
    fecha: fechaCorta(s.creado_en),
    hora: hora(s.creado_en),
    estado: s.estado === 'descartada' ? 'cancelada' : s.estado,
    asignadoA: s.asignado_a ? (nombres.get(s.asignado_a) ?? `Usuario #${s.asignado_a}`) : null,
    notas: s.notas ?? '',
  }
}

const solicitudesBase = resource<Solicitud>('/admin/solicitudes', solicitudes)

export const adminSolicitudesService = {
  /** Las ofertas de dueños («vender_rentar») se revisan en Postulaciones, no aquí. */
  async listar(): Promise<Solicitud[]> {
    if (USE_MOCKS) return solicitudesBase.listar()
    const [filas, nombres] = await Promise.all([
      http<SolicitudApi[]>('/solicitudes', { query: { limite: 200 } }),
      nombresPersonal(),
    ])
    const visibles = filas.filter((s) => s.tipo !== 'vender_rentar')
    await referenciar(visibles.flatMap((s) => (s.propiedad_id ? [s.propiedad_id] : [])))
    return visibles.map((s) => aSolicitud(s, nombres))
  },

  /** Traduce el cambio pedido por la vista a la acción correspondiente de la API. */
  async actualizar(id: number, patch: Partial<Solicitud>): Promise<Solicitud> {
    if (USE_MOCKS) return solicitudesBase.actualizar(id, patch)
    const ruta = `/solicitudes/${id}`
    let s: SolicitudApi | undefined
    if (patch.asignadoA) {
      const asesor = (await adminPersonalService.listar()).find((p) => p.nombre === patch.asignadoA)
      if (!asesor) throw new ApiError(422, 'Ese asesor no está disponible.')
      s = await http(`${ruta}/asignacion`, { method: 'PATCH', body: { asesor_id: asesor.id } })
    } else if (patch.estado) {
      s = await cambiarEstadoSolicitud(ruta, patch.estado, patch.notas)
    }
    if (patch.notas !== undefined && !patch.estado)
      s = await http(`${ruta}/notas`, { method: 'PATCH', body: { notas: patch.notas } })
    s ??= await http<SolicitudApi>(ruta)
    if (s.propiedad_id) await referenciar([s.propiedad_id])
    return aSolicitud(s, await nombresPersonal())
  },
}

function cambiarEstadoSolicitud(ruta: string, estado: EstadoSolicitud, notas?: string) {
  switch (estado) {
    case 'atendida':
      // Al atenderla, el solicitante queda registrado como prospecto del CRM.
      return http<SolicitudApi>(`${ruta}/atencion`, {
        method: 'PATCH',
        body: { crear_prospecto: true },
      })
    case 'cancelada':
      return http<SolicitudApi>(`${ruta}/descarte`, {
        method: 'PATCH',
        body: { motivo: notas?.trim() || 'Descartada desde el centro de solicitudes' },
      })
    case 'asignada':
      throw new ApiError(422, 'Para asignarla, elige un asesor.')
    default:
      throw new ApiError(422, 'Una solicitud no puede regresar a «Nueva».')
  }
}

// ── Avisos internos ──────────────────────────────────────────────────────────

export interface AvisoApi {
  id: number
  tipo: string
  titulo: string
  mensaje: string | null
  enlace: string | null
  autor_id: number | null
  por_correo: boolean
  leido: boolean
  creado_en: string
}

/** La API no tiene prioridad de aviso: se guarda como prefijo del título. */
const PREFIJO: Partial<Record<TipoAviso, string>> = {
  urgente: '[Urgente] ',
  recordatorio: '[Recordatorio] ',
}

function aAviso(a: AvisoApi, nombres: Map<number, string>): Aviso {
  const tipo = (Object.keys(PREFIJO) as TipoAviso[]).find((t) => a.titulo.startsWith(PREFIJO[t]!))
  return {
    id: a.id,
    tipo: tipo ?? 'informativo',
    titulo: tipo ? a.titulo.slice(PREFIJO[tipo]!.length) : a.titulo,
    cuerpo: a.mensaje ?? '',
    autor: a.autor_id ? (nombres.get(a.autor_id) ?? 'Equipo MU') : 'Sistema',
    fecha: haceCuanto(a.creado_en),
    leido: a.leido,
    destinatario: 'Tú',
  }
}

const avisosBase = resource<Aviso>('/admin/avisos', avisos)

export const adminAvisosService = {
  async listar(): Promise<Aviso[]> {
    if (USE_MOCKS) return avisosBase.listar()
    const [filas, nombres] = await Promise.all([http<AvisoApi[]>('/avisos'), nombresPersonal()])
    return filas.map((a) => aAviso(a, nombres))
  },
  /** «Todos» llega a administradores y asesores; un nombre, solo a esa persona. */
  async crear(aviso: Omit<Aviso, 'id'>): Promise<Aviso> {
    if (USE_MOCKS) return avisosBase.crear(aviso)
    const base = {
      tipo: 'interno',
      titulo: `${PREFIJO[aviso.tipo] ?? ''}${aviso.titulo}`,
      mensaje: aviso.cuerpo || null,
    }
    if (aviso.destinatario === 'Todos') {
      for (const rol of ['administrador', 'asesor'])
        await http('/avisos', { method: 'POST', body: { ...base, rol } }).catch((e) => {
          if (!(e instanceof ApiError && e.status === 422)) throw e // 422 = rol sin usuarios
        })
    } else {
      const destino = (await adminPersonalService.listar()).find(
        (p) => p.nombre === aviso.destinatario,
      )
      if (!destino) throw new ApiError(422, 'Ese destinatario no está disponible.')
      await http('/avisos', { method: 'POST', body: { ...base, usuario_id: destino.id } })
    }
    return { ...aviso, id: Date.now(), autor: 'Tú', fecha: 'ahora' }
  },
  async actualizar(id: number, patch: Partial<Aviso>): Promise<Aviso> {
    if (USE_MOCKS) return avisosBase.actualizar(id, patch)
    const a = await http<AvisoApi>(`/avisos/${id}/leido`, { method: 'PATCH' })
    return aAviso(a, await nombresPersonal())
  },
}

// La agenda usa prospectos y citas de la API, que el front aún no tiene: sigue en memoria.
export const adminVisitasService = resource<Visita>('/admin/visitas', visitas, false)
