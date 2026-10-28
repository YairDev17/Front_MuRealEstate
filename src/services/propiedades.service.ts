import { propiedades } from '@/mocks/propiedades'
import type { Propiedad, TipoOperacion } from '@/types/propiedad'
import { ApiError, http, mockDelay, USE_MOCKS } from './http'

export interface FiltrosPropiedades {
  q?: string
  tipo?: TipoOperacion
  tipoInmueble?: string
  servicio?: string
}

// TODO(back): ajustar las rutas a los endpoints reales.
export const propiedadesService = {
  listar(filtros: FiltrosPropiedades = {}): Promise<Propiedad[]> {
    if (USE_MOCKS) {
      const q = filtros.q?.trim().toLowerCase()
      const result = propiedades.filter(
        (p) =>
          (!filtros.tipo || p.tipo === filtros.tipo) &&
          (!q || [p.titulo, p.colonia, p.ubicacion].some((s) => s.toLowerCase().includes(q))),
      )
      return mockDelay(result, 300)
    }
    return http('/propiedades', { query: { ...filtros } })
  },

  obtener(id: number): Promise<Propiedad> {
    if (USE_MOCKS) {
      const p = propiedades.find((x) => x.id === id)
      return p ? mockDelay(p, 200) : Promise.reject(new ApiError(404, 'Propiedad no encontrada'))
    }
    return http(`/propiedades/${id}`)
  },
}
