import type {
  LoginPayload,
  LoginResponse,
  RegistroPayload,
  RestablecerPasswordPayload,
  Usuario,
  VerificarCorreoPayload,
} from '@/types/auth'
import { ApiError, http, mockDelay, USE_MOCKS } from './http'

/** Perfil que devuelve `GET /auth/me`. */
interface PerfilApi {
  id: number
  nombre: string
  email: string
  rol: string
  telefono: string | null
  email_verificado: boolean
  permisos: string[]
}

interface MensajeApi {
  mensaje: string
}

const ROLES_PERSONAL = ['administrador', 'asesor']

/** La API guarda el nombre completo; el front lo separa para iniciales y saludos. */
export function perfilAUsuario(p: PerfilApi): Usuario {
  const [nombre = '', ...resto] = p.nombre.trim().split(/\s+/)
  return {
    id: p.id,
    nombre,
    apellido: resto.join(' '),
    correo: p.email,
    telefono: p.telefono ?? undefined,
    rol: ROLES_PERSONAL.includes(p.rol) ? 'admin' : 'usuario',
    rolApi: p.rol,
    permisos: p.permisos,
    emailVerificado: p.email_verificado,
  }
}

/** Login OAuth2 de FastAPI (formulario con `username`) y luego el perfil con el token nuevo. */
async function iniciarSesion({ correo, password }: LoginPayload): Promise<LoginResponse> {
  const form = new URLSearchParams({ username: correo, password })
  const { access_token } = await http<{ access_token: string }>('/auth/login', {
    method: 'POST',
    body: form,
  })
  const perfil = await http<PerfilApi>('/auth/me', {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  return { token: access_token, usuario: perfilAUsuario(perfil) }
}

export const authService = {
  login(payload: LoginPayload): Promise<LoginResponse> {
    if (USE_MOCKS) {
      return mockDelay(
        {
          token: 'mock-token-usuario',
          usuario: {
            id: 1,
            nombre: 'María',
            apellido: 'Alvarado',
            correo: payload.correo,
            rol: 'usuario',
          },
        },
        1200,
      )
    }
    return iniciarSesion(payload)
  },

  /** Mismo login que el sitio, pero solo deja pasar al personal. */
  async loginAdmin(payload: LoginPayload): Promise<LoginResponse> {
    if (USE_MOCKS) {
      return mockDelay(
        {
          token: 'mock-token-admin',
          usuario: {
            id: 100,
            nombre: 'Admin',
            apellido: 'MU',
            correo: payload.correo,
            rol: 'admin',
          },
        },
        1200,
      )
    }
    const res = await iniciarSesion(payload)
    if (res.usuario.rol !== 'admin')
      throw new ApiError(403, 'Esta cuenta no tiene acceso al panel administrativo.')
    return res
  },

  registro(payload: RegistroPayload): Promise<MensajeApi> {
    if (USE_MOCKS) return mockDelay({ mensaje: 'ok' }, 1400)
    return http('/auth/registro', {
      method: 'POST',
      body: {
        nombre: `${payload.nombre} ${payload.apellido}`.trim(),
        email: payload.correo,
        telefono: payload.telefono || null,
        password: payload.password,
        quiere_publicar: payload.interesadoEnPublicar,
      },
    })
  },

  /** En modo mock cualquier código de 6 dígitos es válido. */
  verificarCorreo({ correo, codigo }: VerificarCorreoPayload): Promise<MensajeApi> {
    if (USE_MOCKS) return mockDelay({ mensaje: 'ok' }, 1200)
    return http('/auth/verificar-correo', { method: 'POST', body: { email: correo, codigo } })
  },

  reenviarCodigo(correo: string): Promise<MensajeApi> {
    if (USE_MOCKS) return mockDelay({ mensaje: 'ok' }, 300)
    return http('/auth/reenviar-codigo', { method: 'POST', body: { email: correo } })
  },

  solicitarRestablecimiento(correo: string): Promise<MensajeApi> {
    if (USE_MOCKS) return mockDelay({ mensaje: 'ok' }, 600)
    return http('/auth/restablecer-password', { method: 'POST', body: { email: correo } })
  },

  restablecerPassword({
    correo,
    codigo,
    password,
  }: RestablecerPasswordPayload): Promise<MensajeApi> {
    if (USE_MOCKS) return mockDelay({ mensaje: 'ok' }, 900)
    return http('/auth/restablecer-password/confirmar', {
      method: 'POST',
      body: { email: correo, codigo, password },
    })
  },

  async me(): Promise<Usuario> {
    return perfilAUsuario(await http<PerfilApi>('/auth/me'))
  },
}
