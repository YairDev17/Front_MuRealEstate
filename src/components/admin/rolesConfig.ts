import { Eye, Shield, ShieldCheck, UserCheck } from 'lucide-vue-next'
import type { EstadoUsuario, RolAdmin } from '@/types/admin'

export const ROLES = {
  super_admin: { label: 'Super Admin', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20', icon: Shield },
  admin: { label: 'Administrador', color: 'text-sky-400', bg: 'bg-sky-400/10 border-sky-400/20', icon: ShieldCheck },
  agente: { label: 'Agente', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: UserCheck },
  visor: { label: 'Visor', color: 'text-white/40', bg: 'bg-white/5 border-white/10', icon: Eye },
} satisfies Record<RolAdmin, unknown>

export const ESTADOS_USUARIO: Record<EstadoUsuario, { label: string; dot: string; text: string }> = {
  activo: { label: 'Activo', dot: 'bg-emerald-400', text: 'text-emerald-400' },
  inactivo: { label: 'Inactivo', dot: 'bg-white/20', text: 'text-white/30' },
  suspendido: { label: 'Suspendido', dot: 'bg-red-400', text: 'text-red-400' },
}

export const ROLES_KEYS = Object.keys(ROLES) as RolAdmin[]
