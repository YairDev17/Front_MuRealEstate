import type { ContactoPublicacion, PropiedadFormData } from '@/types/propiedad'
import { http, mockDelay, USE_MOCKS } from './http'

/** Serializa el formulario a multipart para poder subir las fotos. */
export function toFormData(data: PropiedadFormData, extra: Record<string, unknown> = {}) {
  const fd = new FormData()
  const { imagenes, documentos = [], ...rest } = data
  fd.append('datos', JSON.stringify({ ...rest, ...extra }))
  imagenes.forEach((file) => fd.append('imagenes', file))
  documentos.forEach((d) => fd.append(`documentos_${d.tipo}`, d.archivo))
  return fd
}

// TODO(back): ajustar la ruta al endpoint real.
export const publicacionesService = {
  /** El usuario envía su propiedad para que el equipo la revise. */
  enviarARevision(data: PropiedadFormData, contacto: ContactoPublicacion): Promise<{ id: number }> {
    if (USE_MOCKS) return mockDelay({ id: Date.now() }, 800)
    return http('/publicaciones', { method: 'POST', body: toFormData(data, { contacto }) })
  },
}
