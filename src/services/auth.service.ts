import type {
  LoginPayload,
  LoginResponse,
  RegistroPayload,
  Usuario,
  VerificarCorreoPayload,
} from '@/types/auth'
import { http, mockDelay, USE_MOCKS } from './http'

// TODO(back): ajustar las rutas a los endpoints reales.
export const authService = {
  login(payload: LoginPayload): Promise<LoginResponse> {
    if (USE_MOCKS) {
      return mockDelay(
        {
          token: 'mock-token-usuario',
          usuario: { id: 1, nombre: 'María', apellido: 'Alvarado', correo: payload.correo, rol: 'usuario' },
        },
        1200,
      )
    }
    return http('/auth/login', { method: 'POST', body: payload })
  },

  loginAdmin(payload: LoginPayload): Promise<LoginResponse> {
    if (USE_MOCKS) {
      return mockDelay(
        {
          token: 'mock-token-admin',
          usuario: { id: 100, nombre: 'Admin', apellido: 'MU', correo: payload.correo, rol: 'admin' },
        },
        1200,
      )
    }
    return http('/auth/admin/login', { method: 'POST', body: payload })
  },

  registro(payload: RegistroPayload): Promise<{ ok: true }> {
    if (USE_MOCKS) return mockDelay({ ok: true }, 1400)
    return http('/auth/registro', { method: 'POST', body: payload })
  },

  /** En modo mock cualquier código de 6 dígitos es válido. */
  verificarCorreo(payload: VerificarCorreoPayload): Promise<{ ok: true }> {
    if (USE_MOCKS) return mockDelay({ ok: true }, 1200)
    return http('/auth/verificar-correo', { method: 'POST', body: payload })
  },

  reenviarCodigo(correo: string): Promise<{ ok: true }> {
    if (USE_MOCKS) return mockDelay({ ok: true }, 300)
    return http('/auth/reenviar-codigo', { method: 'POST', body: { correo } })
  },

  me(): Promise<Usuario> {
    return http('/auth/me')
  },
}
