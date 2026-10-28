// ── Postulaciones (propiedades enviadas por usuarios) ──
export type EstadoPostulacion = 'pendiente' | 'aprobada' | 'rechazada'

export interface Postulacion {
  id: number
  titulo: string
  tipo: 'venta' | 'renta'
  tipoInmueble: string
  colonia: string
  ciudad: string
  precio: string
  habitaciones: number
  banos: number
  m2: number
  imagen: string
  contacto: string
  telefono: string
  correo: string
  fechaEnvio: string
  estado: EstadoPostulacion
}

// ── Historial de actividad ──
export type AccionTipo = 'creacion' | 'edicion' | 'estado' | 'precio' | 'imagenes' | 'eliminacion' | 'bienes' | 'ubicacion'

export interface Actividad {
  id: number
  fecha: string
  hora: string
  propiedad: string
  colonia: string
  agente: string
  accion: AccionTipo
  detalle: string
  estadoAnterior?: string
  estadoNuevo?: string
}

// ── Usuarios y roles del panel ──
export type RolAdmin = 'super_admin' | 'admin' | 'agente' | 'visor'
export type EstadoUsuario = 'activo' | 'inactivo' | 'suspendido'

export interface UsuarioAdmin {
  id: number
  nombre: string
  correo: string
  rol: RolAdmin
  estado: EstadoUsuario
  ultimoAcceso: string
  fechaCreacion: string
  permisos: string[]
}

// ── Centro de solicitudes ──
export type TipoSolicitud = 'contacto' | 'visita'
export type EstadoSolicitud = 'nueva' | 'asignada' | 'atendida' | 'cancelada'
export type TipoAviso = 'urgente' | 'informativo' | 'recordatorio'

export interface Solicitud {
  id: number
  tipo: TipoSolicitud
  nombre: string
  telefono: string
  correo: string
  propiedad: string
  ubicacion: string
  mensaje: string
  fecha: string
  hora: string
  estado: EstadoSolicitud
  asignadoA: string | null
  notas: string
}

export interface Aviso {
  id: number
  tipo: TipoAviso
  titulo: string
  cuerpo: string
  autor: string
  fecha: string
  leido: boolean
  destinatario: string
}

// ── Agenda de visitas ──
export type EstadoVisita = 'programada' | 'confirmada' | 'completada' | 'cancelada'

export interface Visita {
  id: number
  propiedad: string
  tipoInmueble: string
  direccion: string
  imagen: string
  interesado: string
  telefonoInteresado: string
  correoInteresado: string
  asesor: string
  /** YYYY-MM-DD */
  fecha: string
  /** HH:MM */
  hora: string
  /** minutos */
  duracion: number
  estado: EstadoVisita
  notas: string
}
