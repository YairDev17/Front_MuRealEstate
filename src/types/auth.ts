export type Rol = 'usuario' | 'admin'

export interface Usuario {
  id: number
  nombre: string
  apellido: string
  correo: string
  telefono?: string
  rol: Rol
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
  interesadoEnPublicar: boolean
}

export interface VerificarCorreoPayload {
  correo: string
  codigo: string
}
