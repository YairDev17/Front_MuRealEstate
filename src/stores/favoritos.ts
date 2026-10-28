import { ref } from 'vue'
import { defineStore } from 'pinia'

const KEY = 'mu_favoritos'

// TODO(back): sincronizar con un endpoint de favoritos del usuario.
export const useFavoritosStore = defineStore('favoritos', () => {
  const ids = ref<number[]>(leer())

  function leer(): number[] {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '[]')
    } catch {
      return []
    }
  }

  const esFavorito = (id: number) => ids.value.includes(id)

  function toggle(id: number) {
    ids.value = esFavorito(id) ? ids.value.filter((x) => x !== id) : [...ids.value, id]
    localStorage.setItem(KEY, JSON.stringify(ids.value))
  }

  return { ids, esFavorito, toggle }
})
