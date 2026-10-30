import { useCatalogos } from '@/composables/useCatalogos'
import type { ContactoPublicacion, PropiedadFormData } from '@/types/propiedad'
import { antiguedadAAnios, tipoDesdeEtiqueta } from './api/propiedades'
import { ApiError, http, mockDelay, USE_MOCKS } from './http'

/** Serializa el formulario a multipart para poder subir las fotos. */
export function toFormData(data: PropiedadFormData, extra: Record<string, unknown> = {}) {
  const fd = new FormData()
  const { imagenes, documentos = [], ...rest } = data
  fd.append('datos', JSON.stringify({ ...rest, ...extra }))
  imagenes.forEach((file) => fd.append('imagenes', file))
  documentos.forEach((d) => fd.append(`documentos_${d.tipo}`, d.archivo))
  return fd
}

/** "$4,800,000" → "4800000". */
export const montoApi = (texto: string) => texto.replace(/[^\d.]/g, '') || null

const entero = (v: number | '') => (v === '' ? null : Number(v))

/**
 * Campos comunes de la propiedad tal como los espera la API, a partir del formulario.
 * Resuelve zona, amenidades y bienes con los catálogos de la API.
 */
export async function camposPropiedadApi(data: PropiedadFormData) {
  const catalogos = useCatalogos()
  await catalogos.cargar()
  const tipo = tipoDesdeEtiqueta(data.tipoInmueble)
  if (!tipo) throw new ApiError(422, 'Selecciona el tipo de inmueble.')
  if (data.operacion !== 'venta' && data.operacion !== 'renta')
    throw new ApiError(422, 'Solo se pueden publicar propiedades en venta o renta.')
  return {
    titulo: data.nombre.trim(),
    descripcion: data.descripcion.trim() || null,
    operacion: data.operacion,
    tipo,
    zona_id: catalogos.zonaId(data.colonia, data.ciudad) ?? null,
    recamaras: entero(data.habitaciones),
    banos: entero(data.banos),
    estacionamientos: entero(data.estacionamientos),
    superficie_m2: data.m2 ? Number(data.m2) : null,
    antiguedad_anios: antiguedadAAnios(data.antiguedad),
    amenidad_ids: catalogos.idsDe(catalogos.amenidades.value, data.caracteristicas),
    bien_ids: catalogos.idsDeBienes(data.bienes),
  }
}

export const publicacionesService = {
  /**
   * El dueño envía su propiedad para que el equipo la revise (`POST /cuenta/propiedades`).
   * Con la API, el contacto sale de su cuenta y el precio se guarda como dato interno.
   */
  async enviarARevision(
    data: PropiedadFormData,
    _contacto: ContactoPublicacion,
  ): Promise<{ id: number }> {
    if (USE_MOCKS) return mockDelay({ id: Date.now() }, 800)
    const campos = await camposPropiedadApi(data)
    const direccion = [data.calle, data.colonia, data.ciudad].filter((s) => s.trim()).join(', ')
    const fd = new FormData()
    fd.append(
      'datos',
      JSON.stringify({
        ...campos,
        direccion,
        precio_pedido: montoApi(data.precio),
      }),
    )
    data.imagenes.forEach((file) => fd.append('imagenes', file))
    return http('/cuenta/propiedades', { method: 'POST', body: fd })
  },
}
