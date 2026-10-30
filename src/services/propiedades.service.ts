import { propiedades } from '@/mocks/propiedades'
import type { Propiedad, TipoOperacion } from '@/types/propiedad'
import {
  aPropiedad,
  tipoDesdeEtiqueta,
  type Pagina,
  type PropiedadPublicaApi,
} from './api/propiedades'
import { ApiError, http, mockDelay, USE_MOCKS } from './http'

export interface FiltrosPropiedades {
  q?: string
  tipo?: TipoOperacion
  tipoInmueble?: string
  servicio?: string
  destacada?: boolean
}

/** El sitio muestra todo en una sola página; la API pagina, así que se pide un bloque grande. */
const LIMITE = 100

export const propiedadesService = {
  async listar(filtros: FiltrosPropiedades = {}): Promise<Propiedad[]> {
    if (USE_MOCKS) {
      const q = filtros.q?.trim().toLowerCase()
      const result = propiedades.filter(
        (p) =>
          (!filtros.tipo || p.tipo === filtros.tipo) &&
          (!filtros.destacada || p.destacada) &&
          (!q || [p.titulo, p.colonia, p.ubicacion].some((s) => s.toLowerCase().includes(q))),
      )
      return mockDelay(result, 300)
    }
    const q = filtros.q?.trim()
    const pagina = await http<Pagina<PropiedadPublicaApi>>('/publico/propiedades', {
      query: {
        q: q && q.length >= 2 ? q : undefined,
        operacion: filtros.tipo,
        tipo: filtros.tipoInmueble ? tipoDesdeEtiqueta(filtros.tipoInmueble) : undefined,
        destacada: filtros.destacada,
        limite: LIMITE,
      },
    })
    return pagina.elementos.map(aPropiedad)
  },

  async obtener(id: number): Promise<Propiedad> {
    if (USE_MOCKS) {
      const p = propiedades.find((x) => x.id === id)
      return p ? mockDelay(p, 200) : Promise.reject(new ApiError(404, 'Propiedad no encontrada'))
    }
    return aPropiedad(await http<PropiedadPublicaApi>(`/publico/propiedades/${id}`))
  },
}
