import { Clock, Eye, ListChecks } from 'lucide-vue-next'
import type { EstadoPropiedad } from '@/types/propiedad'

export const ESTADO_PROPIEDAD = {
  listada: {
    label: 'Listadas',
    singular: 'Listada',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    icon: ListChecks,
    headerBorder: 'border-emerald-400/30',
    color: '#34d399',
  },
  'por-listar': {
    label: 'Por Listar',
    singular: 'Por Listar',
    dot: 'bg-amber-400',
    badge: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    icon: Clock,
    headerBorder: 'border-amber-400/30',
    color: '#fbbf24',
  },
  'en-revision': {
    label: 'En Revisión',
    singular: 'En Revisión',
    dot: 'bg-sky-400',
    badge: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
    icon: Eye,
    headerBorder: 'border-sky-400/30',
    color: '#38bdf8',
  },
} satisfies Record<EstadoPropiedad, unknown>

export const iniciales = (nombre: string) =>
  nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
