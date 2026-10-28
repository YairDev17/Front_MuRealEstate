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
import type { EstadoPropiedad, PropiedadAdmin, PropiedadFormData } from '@/types/propiedad'
import type { Actividad, Aviso, Postulacion, Solicitud, UsuarioAdmin, Visita } from '@/types/admin'
import { ApiError, http, mockDelay, USE_MOCKS } from './http'
import { toFormData } from './publicaciones.service'

// ── Helpers para el modo mock ─────────────────────────────────────────────────

function mockTable<T extends { id: number }>(seed: T[]) {
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

/** Crea un CRUD REST estándar (`GET/POST /recurso`, `GET/PATCH/DELETE /recurso/:id`). */
function resource<T extends { id: number }>(path: string, seed: T[]) {
  const mock = mockTable(seed)
  return {
    listar: (): Promise<T[]> => (USE_MOCKS ? mock.list() : http(path)),
    obtener: (id: number): Promise<T> => (USE_MOCKS ? mock.get(id) : http(`${path}/${id}`)),
    crear: (data: Omit<T, 'id'>): Promise<T> =>
      USE_MOCKS ? mock.create(data) : http(path, { method: 'POST', body: data }),
    actualizar: (id: number, patch: Partial<T>): Promise<T> =>
      USE_MOCKS ? mock.update(id, patch) : http(`${path}/${id}`, { method: 'PATCH', body: patch }),
    eliminar: (id: number): Promise<void> =>
      USE_MOCKS ? mock.remove(id) : http(`${path}/${id}`, { method: 'DELETE' }),
  }
}

// ── Recursos ─────────────────────────────────────────────────────────────────
// TODO(back): ajustar las rutas a los endpoints reales.

const propiedadesBase = resource<PropiedadAdmin>('/admin/propiedades', propiedadesAdmin)

export const adminPropiedadesService = {
  ...propiedadesBase,
  cambiarEstado: (id: number, estado: EstadoPropiedad) =>
    propiedadesBase.actualizar(id, { estado }),
  /** Alta desde el formulario "Nueva propiedad" (multipart con fotos). */
  crearDesdeFormulario(
    data: PropiedadFormData,
    extra: { agente: string; estado: EstadoPropiedad },
  ): Promise<PropiedadAdmin> {
    if (!USE_MOCKS)
      return http('/admin/propiedades', { method: 'POST', body: toFormData(data, extra) })
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

const postulacionesBase = resource<Postulacion>('/admin/postulaciones', postulaciones)

export const adminPostulacionesService = {
  listar: postulacionesBase.listar,
  aprobar: (id: number): Promise<Postulacion> =>
    USE_MOCKS
      ? postulacionesBase.actualizar(id, { estado: 'aprobada' })
      : http(`/admin/postulaciones/${id}/aprobar`, { method: 'POST' }),
  rechazar: (id: number): Promise<Postulacion> =>
    USE_MOCKS
      ? postulacionesBase.actualizar(id, { estado: 'rechazada' })
      : http(`/admin/postulaciones/${id}/rechazar`, { method: 'POST' }),
}

export const adminActividadService = {
  listar: resource<Actividad>('/admin/actividad', actividades).listar,
}

export const adminUsuariosService = resource<UsuarioAdmin>('/admin/usuarios', usuarios)

export const adminSolicitudesService = resource<Solicitud>('/admin/solicitudes', solicitudes)

export const adminAvisosService = resource<Aviso>('/admin/avisos', avisos)

export const adminVisitasService = resource<Visita>('/admin/visitas', visitas)
