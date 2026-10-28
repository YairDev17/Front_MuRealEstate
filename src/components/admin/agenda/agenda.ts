import type { EstadoVisita } from '@/types/admin'

export const ESTADO_VISITA: Record<
  EstadoVisita,
  { label: string; color: string; bg: string; dot: string }
> = {
  programada: {
    label: 'Programada',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10 border-sky-400/20',
    dot: 'bg-sky-400',
  },
  confirmada: {
    label: 'Confirmada',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
    dot: 'bg-emerald-400',
  },
  completada: {
    label: 'Completada',
    color: 'text-white/40',
    bg: 'bg-white/5 border-white/10',
    dot: 'bg-white/30',
  },
  cancelada: {
    label: 'Cancelada',
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/20',
    dot: 'bg-red-400',
  },
}

export const ESTADOS_VISITA = Object.keys(ESTADO_VISITA) as EstadoVisita[]

export const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]
export const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// TODO(back): obtener asesores desde /admin/usuarios.
export const ASESORES = ['Carlos Cano', 'María López', 'Ana Torres']
export const DURACIONES = [30, 45, 60, 75, 90, 120]
export const TIPOS_INMUEBLE_VISITA = [
  'Casa',
  'Departamento',
  'Terreno',
  'Penthouse',
  'Local',
  'Oficina',
]

export function parseDate(d: string) {
  const [y = 0, m = 1, dd = 1] = d.split('-').map(Number)
  return new Date(y, m - 1, dd)
}

export function formatDateLabel(d: string) {
  const date = parseDate(d)
  return `${date.getDate()} ${MESES[date.getMonth()]?.slice(0, 3)} ${date.getFullYear()}`
}

export function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
