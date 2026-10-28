import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { notificacionesService } from '@/services/modulos.service'
import type { DestinatarioNotificacion, Notificacion } from '@/types/modulos'

export const useNotificacionesStore = defineStore('notificaciones', () => {
  const items = ref<Notificacion[]>([])
  const destinatario = ref<DestinatarioNotificacion>('usuario')
  const cargando = ref(false)

  const noLeidas = computed(() => items.value.filter((n) => !n.leida).length)

  async function cargar(para: DestinatarioNotificacion) {
    destinatario.value = para
    cargando.value = true
    try {
      items.value = await notificacionesService.listar(para)
    } finally {
      cargando.value = false
    }
  }

  async function marcarLeida(n: Notificacion) {
    if (n.leida) return
    const act = await notificacionesService.marcarLeida(n.id)
    items.value = items.value.map((x) => (x.id === n.id ? act : x))
  }

  async function marcarTodas() {
    await notificacionesService.marcarTodas(destinatario.value)
    items.value = items.value.map((n) => ({ ...n, leida: true }))
  }

  return { items, noLeidas, cargando, cargar, marcarLeida, marcarTodas }
})
