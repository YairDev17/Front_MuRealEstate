import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { authService } from '@/services/auth.service'
import { onSesionExpirada, TOKEN_KEY, USE_MOCKS } from '@/services/http'
import type { LoginPayload, Usuario } from '@/types/auth'

const USER_KEY = 'mu_usuario'

function leerUsuario(): Usuario | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as Usuario) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const usuario = ref<Usuario | null>(leerUsuario())

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => usuario.value?.rol === 'admin')
  /** Permisos que da la API (en modo mock el personal los tiene todos). */
  const puede = (permiso: string) =>
    USE_MOCKS ? isAdmin.value : (usuario.value?.permisos ?? []).includes(permiso)
  /** Cuenta del sitio (cliente o propietario): favoritos, avisos y propiedades propias. */
  const esCuenta = computed(() => isAuthenticated.value && !isAdmin.value)
  const iniciales = computed(() =>
    usuario.value
      ? `${usuario.value.nombre[0] ?? ''}${usuario.value.apellido[0] ?? ''}`.toUpperCase()
      : '',
  )
  const nombreCorto = computed(() =>
    usuario.value ? `${usuario.value.nombre} ${usuario.value.apellido[0] ?? ''}.` : '',
  )

  function setSesion(t: string, u: Usuario) {
    token.value = t
    usuario.value = u
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
  }

  async function login(payload: LoginPayload) {
    const res = await authService.login(payload)
    setSesion(res.token, res.usuario)
  }

  async function loginAdmin(payload: LoginPayload) {
    const res = await authService.loginAdmin(payload)
    setSesion(res.token, res.usuario)
  }

  /** Vuelve a leer el perfil (permisos, correo verificado) con el token guardado. */
  async function refrescarPerfil() {
    if (USE_MOCKS || !token.value) return
    try {
      const u = await authService.me()
      usuario.value = u
      localStorage.setItem(USER_KEY, JSON.stringify(u))
    } catch {
      // Un 401 ya cierra la sesión vía onSesionExpirada; otros errores se ignoran.
    }
  }

  function logout() {
    token.value = null
    usuario.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  onSesionExpirada(logout)

  return {
    token,
    usuario,
    isAuthenticated,
    isAdmin,
    iniciales,
    nombreCorto,
    puede,
    esCuenta,
    refrescarPerfil,
    login,
    loginAdmin,
    logout,
  }
})
