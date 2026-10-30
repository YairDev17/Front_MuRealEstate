import { http, mockDelay, USE_MOCKS } from './http'

export interface MensajeContacto {
  nombre: string
  correo: string
  telefono?: string
  mensaje: string
  propiedadId?: number
  /** `visita` pide agendar un recorrido; requiere propiedad. */
  tipo?: 'contacto' | 'visita'
}

export const contactoService = {
  /** Llega al centro de solicitudes del panel (`POST /publico/solicitudes`). */
  enviar(payload: MensajeContacto): Promise<unknown> {
    if (USE_MOCKS) return mockDelay({ ok: true }, 500)
    return http('/publico/solicitudes', {
      method: 'POST',
      body: {
        tipo: payload.tipo ?? 'contacto',
        propiedad_id: payload.propiedadId ?? null,
        nombre: payload.nombre,
        telefono: payload.telefono || null,
        email: payload.correo || null,
        mensaje: payload.mensaje || null,
      },
    })
  },
}
