/**
 * Tipos de la API de propiedades y su traducción a los tipos que usan las vistas.
 * Las vistas no conocen los nombres de la API: todo pasa por estas funciones.
 */
import type { Propiedad, TipoOperacion } from '@/types/propiedad'

export type TipoPropiedadApi = 'casa' | 'departamento' | 'terreno' | 'lote' | 'comercial'
export type EstadoPublicacionApi = 'borrador' | 'en_revision' | 'publicada' | 'oculta' | 'rechazada'

export interface MedioApi {
  id: number
  tipo: 'foto' | 'video'
  url: string
  orden: number
  es_portada: boolean
}

export interface PropiedadPublicaApi {
  id: number
  clave: string | null
  titulo: string
  descripcion: string | null
  operacion: TipoOperacion
  tipo: TipoPropiedadApi
  ubicacion: { zona_id: number | null; zona: string | null; ciudad: string | null }
  recamaras: number | null
  banos: string | null
  estacionamientos: number | null
  superficie_m2: string | null
  antiguedad_anios: number | null
  precio_publico: string | null
  moneda: string
  disponibilidad: string
  destacada: boolean
  amenidades: string[]
  bienes: string[]
  medios: MedioApi[]
}

export interface PropiedadPanelApi extends PropiedadPublicaApi {
  estado_publicacion: EstadoPublicacionApi
  origen: 'interna' | 'particular'
  asesor_id: number | null
  activo: boolean
  motivo_rechazo: string | null
  revisado_por: number | null
  revisado_en: string | null
  publicada_en: string | null
  creado_en: string
  actualizado_en: string
}

export interface Pagina<T> {
  total: number
  limite: number
  desplazamiento: number
  elementos: T[]
}

/** Imagen neutra para propiedades que aún no tienen fotos. */
export const SIN_FOTO =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&h=600&fit=crop&auto=format'

/** Etiqueta en pantalla ↔ valor de la API. */
export const TIPOS_PROPIEDAD: { valor: TipoPropiedadApi; etiqueta: string }[] = [
  { valor: 'casa', etiqueta: 'Casa' },
  { valor: 'departamento', etiqueta: 'Departamento' },
  { valor: 'terreno', etiqueta: 'Terreno' },
  { valor: 'lote', etiqueta: 'Lote' },
  { valor: 'comercial', etiqueta: 'Comercial' },
]

export function tipoDesdeEtiqueta(etiqueta: string): TipoPropiedadApi | undefined {
  const t = etiqueta.trim().toLowerCase().replace(/s$/, '')
  return TIPOS_PROPIEDAD.find((x) => x.valor === t || x.etiqueta.toLowerCase() === t)?.valor
}

export function etiquetaDeTipo(tipo: TipoPropiedadApi) {
  return TIPOS_PROPIEDAD.find((x) => x.valor === tipo)?.etiqueta ?? tipo
}

export function formatearPrecio(valor: string | number | null, operacion: TipoOperacion) {
  if (valor === null || valor === '') return 'Precio a consultar'
  const texto = Number(valor).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  })
  return operacion === 'renta' ? `${texto} / mes` : texto
}

export function formatearAntiguedad(anios: number | null) {
  if (anios === null) return 'Sin dato'
  if (anios === 0) return 'Obra nueva'
  return `${anios} ${anios === 1 ? 'año' : 'años'}`
}

/** "5 años" → 5, "Obra nueva" → 0, texto vacío → null. */
export function antiguedadAAnios(texto: string): number | null {
  if (!texto.trim()) return null
  if (/nueva|estrenar/i.test(texto)) return 0
  const n = parseInt(texto.replace(/\D+/g, ' ').trim(), 10)
  return Number.isNaN(n) ? null : n
}

export function fotos(medios: MedioApi[]) {
  const ordenadas = [...medios].filter((m) => m.tipo === 'foto').sort((a, b) => a.orden - b.orden)
  const portada = ordenadas.find((m) => m.es_portada) ?? ordenadas[0]
  return {
    portada: portada?.url ?? SIN_FOTO,
    todas: ordenadas.length ? ordenadas.map((m) => m.url) : [SIN_FOTO],
  }
}

export function ubicacionTexto(u: PropiedadPublicaApi['ubicacion']) {
  return [u.zona, u.ciudad].filter(Boolean).join(', ') || 'Quintana Roo'
}

export function aPropiedad(p: PropiedadPublicaApi): Propiedad {
  const f = fotos(p.medios)
  return {
    id: p.id,
    titulo: p.titulo,
    ubicacion: ubicacionTexto(p.ubicacion),
    colonia: p.ubicacion.zona ?? '',
    ciudad: p.ubicacion.ciudad ?? '',
    precio: formatearPrecio(p.precio_publico, p.operacion),
    precioNum: Number(p.precio_publico ?? 0),
    tipo: p.operacion,
    tipoInmueble: etiquetaDeTipo(p.tipo),
    habitaciones: p.recamaras ?? 0,
    banos: Number(p.banos ?? 0),
    m2: Number(p.superficie_m2 ?? 0),
    imagen: f.portada,
    imagenes: f.todas,
    destacada: p.destacada,
    descripcion: p.descripcion ?? '',
    caracteristicas: p.amenidades,
    bienes: p.bienes,
    antiguedad: formatearAntiguedad(p.antiguedad_anios),
    estacionamientos: p.estacionamientos ?? 0,
  }
}
