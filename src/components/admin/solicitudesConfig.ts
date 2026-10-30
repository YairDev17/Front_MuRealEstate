import { AlertCircle, Bell, CheckCircle2, Clock, User, XCircle } from 'lucide-vue-next'
import type { EstadoSolicitud, TipoAviso } from '@/types/admin'

export const ESTADOS_SOL = {
  nueva: {
    label: 'Nueva',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/20',
    icon: AlertCircle,
    dot: 'bg-amber-400',
  },
  asignada: {
    label: 'Asignada',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10 border-sky-400/20',
    icon: User,
    dot: 'bg-sky-400',
  },
  atendida: {
    label: 'Atendida',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
    icon: CheckCircle2,
    dot: 'bg-emerald-400',
  },
  cancelada: {
    label: 'Cancelada',
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/20',
    icon: XCircle,
    dot: 'bg-red-400',
  },
} satisfies Record<EstadoSolicitud, unknown>

export const ESTADOS_SOL_KEYS = Object.keys(ESTADOS_SOL) as EstadoSolicitud[]

export const AVISOS_TIPO = {
  urgente: {
    label: 'Urgente',
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/20',
    icon: AlertCircle,
  },
  informativo: {
    label: 'Informativo',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10 border-sky-400/20',
    icon: Bell,
  },
  recordatorio: {
    label: 'Recordatorio',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/20',
    icon: Clock,
  },
} satisfies Record<TipoAviso, unknown>
