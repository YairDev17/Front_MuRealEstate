import type { TipoDocumento } from './modulos'

export type TipoOperacion = 'venta' | 'renta'

export type EstadoPropiedad = 'listada' | 'por-listar' | 'en-revision'

/** Propiedad tal como se muestra al usuario final (catálogo público). */
export interface Propiedad {
  id: number
  titulo: string
  ubicacion: string
  colonia: string
  ciudad?: string
  tipoInmueble?: string
  precio: string
  precioNum: number
  tipo: TipoOperacion
  habitaciones: number
  banos: number
  m2: number
  imagen: string
  imagenes: string[]
  destacada?: boolean
  descripcion: string
  caracteristicas: string[]
  bienes?: string[]
  antiguedad: string
  estacionamientos: number
}

/** Propiedad vista desde el panel de administración. */
export interface PropiedadAdmin {
  id: number
  clave?: string
  titulo: string
  colonia: string
  ciudad?: string
  precio: string
  tipo: TipoOperacion
  habitaciones: number
  banos: number
  m2: number
  imagen: string
  imagenes?: string[]
  estado: EstadoPropiedad
  /** Estado exacto de la API (borrador, en_revision, publicada, oculta, rechazada). */
  estadoApi?: string
  origen?: 'interna' | 'particular'
  motivoRechazo?: string
  agente: string
  fechaIngreso: string
  visitas?: number
  descripcion?: string
  caracteristicas?: string[]
  bienes?: string[]
  estacionamientos?: number
}

/** Datos del formulario "Publicar propiedad" (usuario) y "Nueva propiedad" (admin). */
export interface PropiedadFormData {
  nombre: string
  operacion: string
  tipoInmueble: string
  precio: string
  descripcion: string
  calle: string
  colonia: string
  ciudad: string
  habitaciones: number | ''
  banos: number | ''
  estacionamientos: number | ''
  m2: string
  antiguedad: string
  caracteristicas: string[]
  bienes: string[]
  /** Archivos seleccionados por el usuario; se envían como multipart/form-data. */
  imagenes: File[]
  /** Documentos legales para la bóveda de expedientes (opcional). */
  documentos?: { tipo: TipoDocumento; archivo: File }[]
}

export interface ContactoPublicacion {
  nombre: string
  telefono: string
  correo: string
}
