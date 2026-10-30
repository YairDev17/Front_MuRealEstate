import { ref } from 'vue'
import { adminPersonalService } from '@/services/admin.service'

/** Nombres del personal que puede atender solicitudes (para asignar y enviar avisos). */
export function usePersonal() {
  const nombres = ref<string[]>([])
  adminPersonalService
    .listar()
    .then((p) => (nombres.value = p.map((x) => x.nombre)))
    .catch(() => (nombres.value = []))
  return { nombres }
}
