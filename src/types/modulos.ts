// Tipos de los módulos de moderación, expedientes, favoritos, notificaciones,
// reseñas, analítica, contratos y entrega de inmuebles.

// ── Notificaciones ──
export type TipoNotificacion = 'publicacion' | 'cita' | 'oferta' | 'favorito' | 'resena' | 'sistema'
export type DestinatarioNotificacion = 'usuario' | 'admin'

export interface Notificacion {
  id: number
  tipo: TipoNotificacion
  destinatario: DestinatarioNotificacion
  titulo: string
  mensaje: string
  /** ISO 8601 */
  fecha: string
  leida: boolean
  /** Ruta interna a la que lleva la notificación. */
  enlace?: string
  /** Si además se envió por correo electrónico. */
  porCorreo?: boolean
}

// ── Búsquedas guardadas ──
export interface FiltrosBusqueda {
  q?: string
  servicio?: string
  tipoInmueble?: string | null
}

export interface BusquedaGuardada {
  id: number
  nombre: string
  filtros: FiltrosBusqueda
  alertas: boolean
  /** ISO 8601 */
  creada: string
  /** Inmuebles nuevos o con cambios desde la última consulta. */
  nuevas: number
}

// ── Reseñas y calificaciones ──
export type EstadoResena = 'pendiente' | 'aprobada' | 'rechazada'

export interface Resena {
  id: number
  /** Sin propiedad: reseña del servicio en general. */
  propiedadId?: number
  propiedad?: string
  autor: string
  /** p. ej. «Compradora en Polanco» */
  perfil: string
  calificacion: 1 | 2 | 3 | 4 | 5
  comentario: string
  /** ISO 8601 */
  fecha: string
  estado: EstadoResena
  motivoRechazo?: string
}

// ── Bóveda digital de expedientes ──
export type TipoDocumento =
  'identificacion' | 'escrituras' | 'predial' | 'comprobante_domicilio' | 'otro'
export type EstadoDocumento = 'pendiente' | 'validado' | 'rechazado'

export interface DocumentoLegal {
  id: number
  tipo: TipoDocumento
  archivo: string
  /** bytes */
  tamano: number
  /** ISO 8601 */
  fechaCarga: string
  estado: EstadoDocumento
  observaciones?: string
  url?: string
}

export interface Expediente {
  id: number
  propiedad: string
  colonia: string
  propietario: string
  correoPropietario: string
  documentos: DocumentoLegal[]
}

// ── Plantillas de contratos ──
export type TipoContrato = 'compraventa' | 'arrendamiento' | 'intencion'

export interface PlantillaContrato {
  id: number
  nombre: string
  tipo: TipoContrato
  descripcion: string
  /** Texto con marcadores {{campo}} que se sustituyen al generar el borrador. */
  cuerpo: string
  /** ISO 8601 */
  actualizada: string
}

export interface DatosContrato {
  propiedad: string
  direccion: string
  precio: string
  propietario: string
  cliente: string
  fecha: string
  ciudad: string
}

// ── Entrega y recepción de inmuebles (check-in / check-out) ──
export type TipoActa = 'entrega' | 'recepcion'
export type EstadoElemento = 'bueno' | 'regular' | 'malo' | 'na'

export interface ElementoChecklist {
  categoria: string
  elemento: string
  estado: EstadoElemento
  nota: string
}

export interface ActaEntrega {
  id: number
  tipo: TipoActa
  propiedad: string
  /** YYYY-MM-DD */
  fecha: string
  asesor: string
  cliente: string
  llaves: number
  lecturas: { luz: string; agua: string; gas: string }
  elementos: ElementoChecklist[]
  observaciones: string
  /** Firmas como imagen PNG en data URL. */
  firmaCliente?: string
  firmaAsesor?: string
}

// ── Analítica ──
export type PeriodoAnalitica = 30 | 90 | 365

export interface Analitica {
  kpis: {
    visitasTotales: number
    tiempoAprobacionDias: number
    conversionCitasOfertas: number
    resenaPromedio: number
  }
  masVistas: { titulo: string; visitas: number }[]
  aprobacionPorMes: { mes: string; dias: number }[]
  embudo: { mes: string; citas: number; ofertas: number }[]
  asesores: { nombre: string; citas: number; ofertas: number; cierres: number }[]
}
