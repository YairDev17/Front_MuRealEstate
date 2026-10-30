import { AMENIDADES, BIENES_CATEGORIAS } from '@/constants/catalogos'
import { http, mockDelay, USE_MOCKS } from './http'

export interface Ciudad {
  id: number
  nombre: string
  estado: string
}

export interface Zona {
  id: number
  ciudad_id: number
  nombre: string
}

export interface ItemCatalogo {
  id: number
  nombre: string
}

export interface CategoriaBienes {
  categoria: string
  bienes: ItemCatalogo[]
}

/** En modo mock los ids son posiciones de las listas de `constants/catalogos`. */
export const catalogosService = {
  ciudades(): Promise<Ciudad[]> {
    if (USE_MOCKS) return mockDelay([{ id: 1, nombre: 'CDMX', estado: 'CDMX' }], 100)
    return http('/publico/catalogos/ciudades')
  },
  zonas(): Promise<Zona[]> {
    if (USE_MOCKS) return mockDelay([], 100)
    return http('/publico/catalogos/zonas')
  },
  amenidades(): Promise<ItemCatalogo[]> {
    if (USE_MOCKS)
      return mockDelay(
        AMENIDADES.map((nombre, i) => ({ id: i + 1, nombre })),
        100,
      )
    return http('/publico/catalogos/amenidades')
  },
  bienes(): Promise<CategoriaBienes[]> {
    if (USE_MOCKS) {
      let id = 0
      return mockDelay(
        BIENES_CATEGORIAS.map((c) => ({
          categoria: c.label,
          bienes: c.items.map((nombre) => ({ id: ++id, nombre })),
        })),
        100,
      )
    }
    return http('/publico/catalogos/bienes')
  },
}
