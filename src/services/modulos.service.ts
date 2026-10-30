/**
 * Servicios de los módulos de notificaciones, búsquedas guardadas, reseñas,
 * bóveda de expedientes, contratos, entrega de inmuebles y analítica.
 *
 * Notificaciones ya usan la API (`/avisos`). Búsquedas guardadas, reseñas,
 * expedientes, contratos, entregas y analítica todavía no tienen endpoints:
 * siguen con los datos de `src/mocks` aunque `VITE_API_URL` tenga valor.
 */
import {
  actasEntrega,
  busquedasGuardadas,
  expedientes,
  notificaciones,
  plantillasContrato,
  resenas,
} from '@/mocks/modulos'
import { propiedadesAdmin } from '@/mocks/propiedadesAdmin'
import { postulaciones } from '@/mocks/admin/postulaciones'
import { visitas } from '@/mocks/admin/visitas'
import type {
  ActaEntrega,
  Analitica,
  BusquedaGuardada,
  DatosContrato,
  DestinatarioNotificacion,
  DocumentoLegal,
  Expediente,
  Notificacion,
  PeriodoAnalitica,
  PlantillaContrato,
  Resena,
  TipoDocumento,
} from '@/types/modulos'
import { http, mockDelay, USE_MOCKS } from './http'
import { mockTable, registrarActividad, resource, type AvisoApi } from './admin.service'

/** Cambiar a `true` módulo por módulo conforme la API tenga sus endpoints. */
const CON_API = false

// ── Notificaciones ──────────────────────────────────────────────────────────

const notifMock = mockTable(notificaciones)

const TIPO_NOTIFICACION: Record<string, Notificacion['tipo']> = {
  publicacion: 'publicacion',
  documento: 'publicacion',
  cita: 'cita',
  solicitud: 'oferta',
  favorito: 'favorito',
  busqueda: 'favorito',
  resena: 'resena',
}

/** Los enlaces de la API usan rutas genéricas; aquí se traducen a las rutas del front. */
function rutaFront(enlace: string | null, destinatario: DestinatarioNotificacion) {
  if (!enlace) return undefined
  if (enlace.startsWith('/propiedad/')) return enlace.replace('/propiedad/', '/property/')
  if (enlace.startsWith('/admin/solicitudes')) return '/admin/requests'
  if (enlace.startsWith('/admin/moderacion')) return '/admin/panel'
  if (enlace === '/mis-propiedades') return '/notificaciones'
  return destinatario === 'admin' || !enlace.startsWith('/admin') ? enlace : undefined
}

function aNotificacion(a: AvisoApi, destinatario: DestinatarioNotificacion): Notificacion {
  return {
    id: a.id,
    tipo: TIPO_NOTIFICACION[a.tipo] ?? 'sistema',
    destinatario,
    titulo: a.titulo,
    mensaje: a.mensaje ?? '',
    fecha: a.creado_en,
    leida: a.leido,
    enlace: rutaFront(a.enlace, destinatario),
    porCorreo: a.por_correo,
  }
}

export const notificacionesService = {
  /** Con la API, el token ya identifica de quién son los avisos. */
  async listar(destinatario: DestinatarioNotificacion): Promise<Notificacion[]> {
    if (!USE_MOCKS)
      return (await http<AvisoApi[]>('/avisos')).map((a) => aNotificacion(a, destinatario))
    const todas = await notifMock.list()
    return todas
      .filter((n) => n.destinatario === destinatario)
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
  },
  async marcarLeida(
    id: number,
    destinatario: DestinatarioNotificacion = 'usuario',
  ): Promise<Notificacion> {
    if (!USE_MOCKS)
      return aNotificacion(
        await http<AvisoApi>(`/avisos/${id}/leido`, { method: 'PATCH' }),
        destinatario,
      )
    return notifMock.update(id, { leida: true })
  },
  async marcarTodas(destinatario: DestinatarioNotificacion): Promise<void> {
    if (!USE_MOCKS) {
      await http('/avisos/leidos', { method: 'PATCH' })
      return
    }
    const todas = await notifMock.list()
    await Promise.all(
      todas
        .filter((n) => n.destinatario === destinatario && !n.leida)
        .map((n) => notifMock.update(n.id, { leida: true })),
    )
  },
}

// ── Búsquedas guardadas ─────────────────────────────────────────────────────

export const busquedasService = resource<BusquedaGuardada>(
  '/cuenta/busquedas',
  busquedasGuardadas,
  CON_API,
)

// ── Reseñas y calificaciones ────────────────────────────────────────────────

const resenasBase = resource<Resena>('/admin/resenas', resenas, CON_API)

export const resenasService = {
  /** Reseñas aprobadas: del servicio en general o de una propiedad. */
  async publicas(propiedadId?: number): Promise<Resena[]> {
    if (CON_API) return http('/resenas', { query: { propiedadId } })
    const todas = await resenasBase.listar()
    return todas.filter(
      (r) =>
        r.estado === 'aprobada' && (propiedadId ? r.propiedadId === propiedadId : !r.propiedadId),
    )
  },
  /** El cliente envía su reseña; queda pendiente de moderación. */
  enviar(
    data: Pick<
      Resena,
      'propiedadId' | 'propiedad' | 'autor' | 'perfil' | 'calificacion' | 'comentario'
    >,
  ): Promise<Resena> {
    if (CON_API) return http('/resenas', { method: 'POST', body: data })
    return resenasBase.crear({ ...data, fecha: new Date().toISOString(), estado: 'pendiente' })
  },
  listarTodas: resenasBase.listar,
  async aprobar(r: Resena): Promise<Resena> {
    if (CON_API) return http(`/admin/resenas/${r.id}/aprobar`, { method: 'POST' })
    const res = await resenasBase.actualizar(r.id, { estado: 'aprobada', motivoRechazo: undefined })
    registrarActividad({
      propiedad: r.propiedad ?? 'Servicio MU Real Estate',
      colonia: '—',
      accion: 'resena',
      detalle: `Reseña de ${r.autor} aprobada`,
    })
    return res
  },
  async rechazar(r: Resena, motivo: string): Promise<Resena> {
    if (CON_API)
      return http(`/admin/resenas/${r.id}/rechazar`, { method: 'POST', body: { motivo } })
    const res = await resenasBase.actualizar(r.id, { estado: 'rechazada', motivoRechazo: motivo })
    registrarActividad({
      propiedad: r.propiedad ?? 'Servicio MU Real Estate',
      colonia: '—',
      accion: 'resena',
      detalle: `Reseña de ${r.autor} rechazada: ${motivo}`,
    })
    return res
  },
}

// ── Bóveda digital de expedientes ───────────────────────────────────────────

const expedientesBase = resource<Expediente>('/admin/expedientes', expedientes, CON_API)
let siguienteDocId = 1000

export const ETIQUETA_DOCUMENTO: Record<TipoDocumento, string> = {
  identificacion: 'Identificación oficial',
  escrituras: 'Escrituras / título de propiedad',
  predial: 'Recibo de predial',
  comprobante_domicilio: 'Comprobante de domicilio',
  otro: 'Otro documento',
}

/** Documentos que se exigen para considerar completo un expediente. */
export const DOCUMENTOS_REQUERIDOS: TipoDocumento[] = ['identificacion', 'escrituras', 'predial']

async function actualizarDocumento(
  expId: number,
  docId: number,
  patch: Partial<DocumentoLegal>,
): Promise<Expediente> {
  const exp = await expedientesBase.obtener(expId)
  const documentos = exp.documentos.map((d) => (d.id === docId ? { ...d, ...patch } : d))
  return expedientesBase.actualizar(expId, { documentos })
}

export const expedientesService = {
  listar: expedientesBase.listar,
  obtener: expedientesBase.obtener,
  async cargar(expId: number, tipo: TipoDocumento, archivo: File): Promise<Expediente> {
    if (CON_API) {
      const fd = new FormData()
      fd.append('tipo', tipo)
      fd.append('archivo', archivo)
      return http(`/admin/expedientes/${expId}/documentos`, { method: 'POST', body: fd })
    }
    const exp = await expedientesBase.obtener(expId)
    const doc: DocumentoLegal = {
      id: siguienteDocId++,
      tipo,
      archivo: archivo.name,
      tamano: archivo.size,
      fechaCarga: new Date().toISOString(),
      estado: 'pendiente',
      url: URL.createObjectURL(archivo),
    }
    registrarActividad({
      propiedad: exp.propiedad,
      colonia: exp.colonia,
      accion: 'documento',
      detalle: `Documento cargado: ${ETIQUETA_DOCUMENTO[tipo]}`,
    })
    return expedientesBase.actualizar(expId, { documentos: [...exp.documentos, doc] })
  },
  async validar(exp: Expediente, doc: DocumentoLegal): Promise<Expediente> {
    if (CON_API)
      return http(`/admin/expedientes/${exp.id}/documentos/${doc.id}/validar`, { method: 'POST' })
    registrarActividad({
      propiedad: exp.propiedad,
      colonia: exp.colonia,
      accion: 'documento',
      detalle: `Documento validado: ${ETIQUETA_DOCUMENTO[doc.tipo]}`,
    })
    return actualizarDocumento(exp.id, doc.id, { estado: 'validado', observaciones: undefined })
  },
  async rechazar(exp: Expediente, doc: DocumentoLegal, observaciones: string): Promise<Expediente> {
    if (CON_API)
      return http(`/admin/expedientes/${exp.id}/documentos/${doc.id}/rechazar`, {
        method: 'POST',
        body: { observaciones },
      })
    registrarActividad({
      propiedad: exp.propiedad,
      colonia: exp.colonia,
      accion: 'documento',
      detalle: `Documento rechazado (${ETIQUETA_DOCUMENTO[doc.tipo]}): ${observaciones}`,
    })
    return actualizarDocumento(exp.id, doc.id, { estado: 'rechazado', observaciones })
  },
}

// ── Plantillas de contratos ─────────────────────────────────────────────────

export const plantillasService = resource<PlantillaContrato>(
  '/admin/contratos/plantillas',
  plantillasContrato,
  CON_API,
)

/** Sustituye los marcadores {{campo}} de la plantilla con los datos de la operación. */
export function rellenarPlantilla(cuerpo: string, datos: DatosContrato): string {
  return cuerpo.replace(
    /\{\{(\w+)\}\}/g,
    (_, k: string) => datos[k as keyof DatosContrato] || `[${k}]`,
  )
}

export function registrarContratoGenerado(plantilla: PlantillaContrato, datos: DatosContrato) {
  registrarActividad({
    propiedad: datos.propiedad,
    colonia: '—',
    accion: 'contrato',
    detalle: `Borrador generado: ${plantilla.nombre}`,
  })
}

// ── Entrega y recepción de inmuebles ────────────────────────────────────────

const actasBase = resource<ActaEntrega>('/admin/entregas', actasEntrega, CON_API)

export const actasService = {
  ...actasBase,
  async crear(data: Omit<ActaEntrega, 'id'>): Promise<ActaEntrega> {
    const acta = await actasBase.crear(data)
    registrarActividad({
      propiedad: data.propiedad,
      colonia: '—',
      accion: 'entrega',
      detalle: `Acta de ${data.tipo === 'entrega' ? 'entrega' : 'recepción'} firmada con ${data.cliente}`,
    })
    return acta
  },
}

// ── Analítica ───────────────────────────────────────────────────────────────

const MESES = ['May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct']

export const analiticaService = {
  async obtener(periodo: PeriodoAnalitica): Promise<Analitica> {
    if (CON_API) return http('/admin/analitica', { query: { periodo } })
    // Escala los datos de ejemplo según el periodo para que los filtros se noten.
    const f = periodo === 30 ? 1 : periodo === 90 ? 2.6 : 9.4
    const meses = periodo === 30 ? MESES.slice(-2) : periodo === 90 ? MESES.slice(-3) : MESES
    const masVistas = propiedadesAdmin
      .filter((p) => p.visitas !== undefined)
      .map((p) => ({ titulo: p.titulo, visitas: Math.round((p.visitas ?? 0) * f) }))
      .sort((a, b) => b.visitas - a.visitas)
      .slice(0, 6)
    const embudoBase = [
      { citas: 9, ofertas: 2 },
      { citas: 11, ofertas: 3 },
      { citas: 10, ofertas: 3 },
      { citas: 14, ofertas: 4 },
      { citas: 17, ofertas: 6 },
      { citas: 19, ofertas: 7 },
    ]
    const embudo = meses.map((mes) => ({ mes, ...embudoBase[MESES.indexOf(mes)]! }))
    const aprobacionPorMes = meses.map((mes, i) => ({
      mes,
      dias: [6.5, 5.8, 5.1, 4.2, 3.6, 2.9][MESES.indexOf(mes)] ?? 3 + i,
    }))
    const totalCitas = embudo.reduce((s, m) => s + m.citas, 0)
    const totalOfertas = embudo.reduce((s, m) => s + m.ofertas, 0)
    const aprobadas = postulaciones.filter((p) => p.estado !== 'pendiente').length
    const asesores = [...new Set(visitas.map((v) => v.asesor))].map((nombre, i) => {
      const citas = Math.round(visitas.filter((v) => v.asesor === nombre).length * f * 3)
      return {
        nombre,
        citas,
        ofertas: Math.round(citas * (0.42 - i * 0.07)),
        cierres: Math.max(1, Math.round(citas * (0.18 - i * 0.04))),
      }
    })
    return mockDelay(
      {
        kpis: {
          visitasTotales: masVistas.reduce((s, p) => s + p.visitas, 0),
          tiempoAprobacionDias: aprobacionPorMes.at(-1)?.dias ?? 0,
          conversionCitasOfertas: totalCitas ? Math.round((totalOfertas / totalCitas) * 100) : 0,
          resenaPromedio: aprobadas ? 4.8 : 0,
        },
        masVistas,
        aprobacionPorMes,
        embudo,
        asesores,
      },
      350,
    )
  },
}
