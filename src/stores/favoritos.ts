import { ref } from 'vue'
import { defineStore } from 'pinia'
import { http, USE_MOCKS } from '@/services/http'
import { useAuthStore } from '@/stores/auth'
import type { PropiedadPublicaApi } from '@/services/api/propiedades'

const KEY = 'mu_favoritos'

/**
 * Favoritos del visitante. Sin sesión (o en modo mock) viven en el navegador;
 * con una cuenta del sitio se guardan en la API (`/cuenta/favoritos`) y, al iniciar
 * sesión, los del navegador se suben a la cuenta.
 */
export const useFavoritosStore = defineStore('favoritos', () => {
  const ids = ref<number[]>(leer())
  const auth = useAuthStore()
  let sincronizadoPara: number | null = null

  function leer(): number[] {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '[]')
    } catch {
      return []
    }
  }

  const guardarLocal = () => localStorage.setItem(KEY, JSON.stringify(ids.value))
  const enCuenta = () => !USE_MOCKS && auth.esCuenta

  /** Une los favoritos locales con los de la cuenta (una vez por usuario y sesión). */
  async function sincronizar() {
    const uid = auth.usuario?.id ?? null
    if (!enCuenta() || uid === null || sincronizadoPara === uid) return
    sincronizadoPara = uid
    const lista = await http<PropiedadPublicaApi[]>('/cuenta/favoritos/sincronizar', {
      method: 'POST',
      body: { propiedad_ids: ids.value },
    })
    ids.value = lista.map((p) => p.id)
    guardarLocal()
  }

  const esFavorito = (id: number) => ids.value.includes(id)

  async function toggle(id: number) {
    const quitar = esFavorito(id)
    ids.value = quitar ? ids.value.filter((x) => x !== id) : [...ids.value, id]
    guardarLocal()
    if (!enCuenta()) return
    try {
      await sincronizar()
      await http(`/cuenta/favoritos/${id}`, { method: quitar ? 'DELETE' : 'PUT' })
    } catch (e) {
      // Si la API lo rechaza, se deshace el cambio en pantalla.
      ids.value = quitar ? [...ids.value, id] : ids.value.filter((x) => x !== id)
      guardarLocal()
      throw e
    }
  }

  return { ids, esFavorito, toggle, sincronizar }
})
