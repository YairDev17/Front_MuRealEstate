import { computed, ref } from 'vue'
import {
  catalogosService,
  type CategoriaBienes,
  type Ciudad,
  type ItemCatalogo,
  type Zona,
} from '@/services/catalogos.service'

// Se cargan una vez por sesión y se comparten entre formularios.
const ciudades = ref<Ciudad[]>([])
const zonas = ref<Zona[]>([])
const amenidades = ref<ItemCatalogo[]>([])
const bienes = ref<CategoriaBienes[]>([])
let carga: Promise<void> | null = null

function cargar() {
  carga ??= Promise.all([
    catalogosService.ciudades(),
    catalogosService.zonas(),
    catalogosService.amenidades(),
    catalogosService.bienes(),
  ])
    .then(([c, z, a, b]) => {
      ciudades.value = c
      zonas.value = z
      amenidades.value = a
      bienes.value = b
    })
    .catch((e) => {
      carga = null // permite reintentar
      throw e
    })
  return carga
}

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()

export function useCatalogos() {
  void cargar().catch(() => {})
  const todosLosBienes = computed(() => bienes.value.flatMap((c) => c.bienes))

  return {
    ciudades,
    zonas,
    amenidades,
    bienes,
    cargar,
    zonasDe: (ciudad: string) => {
      const c = ciudades.value.find((x) => normalizar(x.nombre) === normalizar(ciudad))
      return c ? zonas.value.filter((z) => z.ciudad_id === c.id) : []
    },
    /** Convierte la colonia y ciudad elegidas en el id de zona de la API. */
    zonaId: (colonia: string, ciudad: string) => {
      const c = ciudades.value.find((x) => normalizar(x.nombre) === normalizar(ciudad))
      return zonas.value.find(
        (z) => (!c || z.ciudad_id === c.id) && normalizar(z.nombre) === normalizar(colonia),
      )?.id
    },
    idsDe: (lista: ItemCatalogo[], nombres: string[]) =>
      lista.filter((x) => nombres.includes(x.nombre)).map((x) => x.id),
    idsDeBienes: (nombres: string[]) =>
      todosLosBienes.value.filter((x) => nombres.includes(x.nombre)).map((x) => x.id),
  }
}
