import { ref } from 'vue'

/** Último error sin manejar (p. ej. una acción del panel que la API rechazó). */
export const errorGlobal = ref('')
let temporizador: ReturnType<typeof setTimeout> | undefined

export function mostrarError(e: unknown) {
  errorGlobal.value = e instanceof Error ? e.message : 'Ocurrió un error inesperado.'
  clearTimeout(temporizador)
  temporizador = setTimeout(() => (errorGlobal.value = ''), 6000)
}
