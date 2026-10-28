import { http, mockDelay, USE_MOCKS } from './http'

export interface MensajeContacto {
  nombre: string
  correo: string
  telefono?: string
  mensaje: string
  propiedadId?: number
}

// TODO(back): ajustar la ruta al endpoint real.
export const contactoService = {
  enviar(payload: MensajeContacto): Promise<{ ok: true }> {
    if (USE_MOCKS) return mockDelay({ ok: true }, 500)
    return http('/contacto', { method: 'POST', body: payload })
  },
}
