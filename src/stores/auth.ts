import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { authService } from '@/services/auth.service'
import { TOKEN_KEY } from '@/services/http'
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

  function logout() {
    token.value = null
    usuario.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return {
    token,
    usuario,
    isAuthenticated,
    isAdmin,
    iniciales,
    nombreCorto,
    login,
    loginAdmin,
    logout,
  }
})
