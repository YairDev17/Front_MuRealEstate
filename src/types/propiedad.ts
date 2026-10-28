export type TipoOperacion = 'venta' | 'renta'

export type EstadoPropiedad = 'listada' | 'por-listar' | 'en-revision'

/** Propiedad tal como se muestra al usuario final (catálogo público). */
export interface Propiedad {
  id: number
  titulo: string
  ubicacion: string
  colonia: string
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
  antiguedad: string
  estacionamientos: number
}

/** Propiedad vista desde el panel de administración. */
export interface PropiedadAdmin {
  id: number
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
  agente: string
  fechaIngreso: string
  visitas?: number
  descripcion?: string
  caracteristicas?: string[]
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
}

export interface ContactoPublicacion {
  nombre: string
  telefono: string
  correo: string
}
