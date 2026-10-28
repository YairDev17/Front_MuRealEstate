<script setup lang="ts">
import { reactive } from 'vue'
import { Check, X } from 'lucide-vue-next'
import { PERMISOS_CATALOGO, PERMISOS_POR_ROL } from '@/constants/permisos'
import type { RolAdmin, UsuarioAdmin } from '@/types/admin'
import { ESTADOS_USUARIO, ROLES, ROLES_KEYS } from './rolesConfig'
import { SERIF } from '@/config'

const props = defineProps<{ usuario: UsuarioAdmin | null; mode: 'edit' | 'create' }>()
const emit = defineEmits<{ close: []; save: [UsuarioAdmin | Omit<UsuarioAdmin, 'id'>] }>()

const blank: Omit<UsuarioAdmin, 'id'> = {
  nombre: '',
  correo: '',
  rol: 'visor',
  estado: 'activo',
  ultimoAcceso: '—',
  fechaCreacion: new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }),
  permisos: [...PERMISOS_POR_ROL.visor],
}
const form = reactive<UsuarioAdmin | Omit<UsuarioAdmin, 'id'>>(
  props.usuario ? { ...props.usuario, permisos: [...props.usuario.permisos] } : blank,
)

function handleRolChange(rol: RolAdmin) {
  form.rol = rol
  form.permisos = [...PERMISOS_POR_ROL[rol]]
}

function togglePermiso(id: string) {
  form.permisos = form.permisos.includes(id)
    ? form.permisos.filter((p) => p !== id)
    : [...form.permisos, id]
}

const grupos = [...new Set(PERMISOS_CATALOGO.map((p) => p.grupo))]
const inputCls =
  'w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all'

function guardar() {
  if (form.nombre && form.correo) emit('save', { ...form })
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <div
      class="bg-[#141413] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
    >
      <div class="flex items-center justify-between p-6 border-b border-white/6">
        <h2 class="text-white text-lg" :style="SERIF">
          {{ mode === 'create' ? 'Nuevo usuario' : 'Editar usuario' }}
        </h2>
        <button
          class="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
          @click="emit('close')"
        >
          <X :size="16" />
        </button>
      </div>

      <div class="p-6 space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-white/40 text-xs mb-1.5 tracking-wide">Nombre completo</label>
            <input v-model="form.nombre" :class="inputCls" placeholder="Nombre" />
          </div>
          <div>
            <label class="block text-white/40 text-xs mb-1.5 tracking-wide"
              >Correo electrónico</label
            >
            <input
              v-model="form.correo"
              type="email"
              :class="inputCls"
              placeholder="usuario@correo.com"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-white/40 text-xs mb-1.5 tracking-wide">Rol</label>
            <select
              :value="form.rol"
              :class="[inputCls, 'appearance-none']"
              @change="handleRolChange(($event.target as HTMLSelectElement).value as RolAdmin)"
            >
              <option v-for="r in ROLES_KEYS" :key="r" :value="r" class="bg-[#141413]">
                {{ ROLES[r].label }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-white/40 text-xs mb-1.5 tracking-wide">Estado</label>
            <select v-model="form.estado" :class="[inputCls, 'appearance-none']">
              <option v-for="(cfg, e) in ESTADOS_USUARIO" :key="e" :value="e" class="bg-[#141413]">
                {{ cfg.label }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <p class="text-white/40 text-xs mb-3 tracking-wide">Permisos individuales</p>
          <div class="space-y-4">
            <div v-for="grupo in grupos" :key="grupo">
              <p class="text-white/25 text-[10px] tracking-widest uppercase mb-2">{{ grupo }}</p>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="p in PERMISOS_CATALOGO.filter((x) => x.grupo === grupo)"
                  :key="p.id"
                  type="button"
                  :class="[
                    'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all text-left',
                    form.permisos.includes(p.id)
                      ? 'bg-[#b8935a]/10 border-[#b8935a]/30 text-[#b8935a]'
                      : 'bg-white/3 border-white/6 text-white/30 hover:border-white/12',
                  ]"
                  @click="togglePermiso(p.id)"
                >
                  <span
                    :class="[
                      'w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0',
                      form.permisos.includes(p.id)
                        ? 'bg-[#b8935a] border-[#b8935a]'
                        : 'border-white/15',
                    ]"
                  >
                    <Check v-if="form.permisos.includes(p.id)" :size="9" class="text-black" />
                  </span>
                  {{ p.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-2 p-6 pt-0">
        <button
          class="flex-1 py-2.5 rounded-lg border border-white/8 text-white/40 text-sm hover:bg-white/5 transition-all"
          @click="emit('close')"
        >
          Cancelar
        </button>
        <button
          class="flex-1 py-2.5 rounded-lg bg-white text-[#0d0d0c] text-sm font-medium hover:bg-white/90 transition-all"
          @click="guardar"
        >
          {{ mode === 'create' ? 'Crear usuario' : 'Guardar cambios' }}
        </button>
      </div>
    </div>
  </div>
</template>
