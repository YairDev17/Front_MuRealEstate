/** `admin` = personal con acceso al panel (administrador o asesor); `usuario` = cuenta del sitio. */
export type Rol = 'usuario' | 'admin'

export interface Usuario {
  id: number
  nombre: string
  apellido: string
  correo: string
  telefono?: string
  rol: Rol
  /** Rol tal como lo define la API: administrador, asesor, cliente o propietario. */
  rolApi?: string
  permisos?: string[]
  emailVerificado?: boolean
}

export interface LoginPayload {
  correo: string
  password: string
}

export interface LoginResponse {
  token: string
  usuario: Usuario
}

export interface RegistroPayload {
  nombre: string
  apellido: string
  correo: string
  telefono: string
  password: string
  interesadoEnPublicar: boolean
}

export interface VerificarCorreoPayload {
  correo: string
  codigo: string
}

export interface RestablecerPasswordPayload extends VerificarCorreoPayload {
  password: string
}
