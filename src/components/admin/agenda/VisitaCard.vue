<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  Home,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Trash2,
  User,
  XCircle,
} from 'lucide-vue-next'
import type { EstadoVisita, Visita } from '@/types/admin'
import { ESTADO_VISITA, formatDateLabel } from './agenda'
import { SERIF } from '@/config'

const props = defineProps<{ v: Visita }>()
const emit = defineEmits<{ edit: []; delete: []; status: [EstadoVisita] }>()

const cfg = computed(() => ESTADO_VISITA[props.v.estado])
const menu = ref(false)

function act(fn: () => void) {
  fn()
  menu.value = false
}
</script>

<template>
  <div
    class="bg-white/4 border border-white/8 rounded-xl overflow-hidden hover:border-white/14 transition-all duration-200 group relative"
  >
    <div class="flex gap-0">
      <div class="relative w-20 shrink-0 overflow-hidden">
        <img
          :src="v.imagen"
          :alt="v.propiedad"
          class="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-transparent to-[#0d0d0c]/60" />
      </div>

      <div class="flex-1 min-w-0 p-4">
        <div class="flex items-start justify-between gap-2 mb-2">
          <div class="min-w-0">
            <p class="text-white/70 text-sm font-medium truncate" :style="SERIF">
              {{ v.propiedad }}
            </p>
            <p class="text-white/25 text-[10px] flex items-center gap-1 truncate mt-0.5">
              <MapPin :size="9" /> {{ v.direccion }}
            </p>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <span
              :class="[
                'inline-flex items-center gap-1 border text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full',
                cfg.bg,
                cfg.color,
              ]"
            >
              <span :class="['w-1.5 h-1.5 rounded-full', cfg.dot]" />
              {{ cfg.label }}
            </span>
            <button
              class="p-1 rounded-md text-white/20 hover:text-white/50 hover:bg-white/5 transition-all"
              @click="menu = !menu"
            >
              <MoreHorizontal :size="13" />
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
          <div class="flex items-center gap-1.5 text-white/35 text-xs">
            <User :size="10" class="shrink-0" /><span class="truncate">{{ v.interesado }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-white/35 text-xs">
            <CalendarDays :size="10" class="shrink-0" /><span>{{ formatDateLabel(v.fecha) }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-[#b8935a]/60 text-xs">
            <Home :size="10" class="shrink-0" /><span class="truncate">{{ v.asesor }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-white/35 text-xs">
            <Clock :size="10" class="shrink-0" /><span>{{ v.hora }} · {{ v.duracion }} min</span>
          </div>
        </div>

        <p
          v-if="v.notas"
          class="text-white/25 text-[10px] leading-relaxed italic line-clamp-1 mb-2"
        >
          "{{ v.notas }}"
        </p>

        <div class="flex items-center gap-2 flex-wrap">
          <a
            :href="`tel:${v.telefonoInteresado}`"
            class="flex items-center gap-1 text-[10px] text-white/25 hover:text-[#b8935a]/70 transition-colors"
          >
            <Phone :size="9" /> {{ v.telefonoInteresado }}
          </a>
          <span class="text-white/10">·</span>
          <a
            :href="`mailto:${v.correoInteresado}`"
            class="flex items-center gap-1 text-[10px] text-white/25 hover:text-[#b8935a]/70 transition-colors truncate"
          >
            <Mail :size="9" /> {{ v.correoInteresado }}
          </a>
        </div>
      </div>
    </div>

    <div
      v-if="menu"
      class="absolute right-3 top-9 z-20 bg-[#1a1a19] border border-white/12 rounded-xl shadow-2xl py-1.5 w-48"
      @mouseleave="menu = false"
    >
      <button
        class="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-white/50 hover:text-white/80 hover:bg-white/5 transition-all"
        @click="act(() => emit('edit'))"
      >
        <Edit3 :size="11" /> Editar visita
      </button>
      <button
        v-if="v.estado === 'programada'"
        class="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-emerald-400/70 hover:text-emerald-400 hover:bg-white/5 transition-all"
        @click="act(() => emit('status', 'confirmada'))"
      >
        <CheckCircle2 :size="11" /> Marcar confirmada
      </button>
      <button
        v-if="v.estado === 'programada' || v.estado === 'confirmada'"
        class="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
        @click="act(() => emit('status', 'completada'))"
      >
        <Eye :size="11" /> Marcar completada
      </button>
      <button
        v-if="v.estado !== 'cancelada'"
        class="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-400/70 hover:text-red-400 hover:bg-white/5 transition-all"
        @click="act(() => emit('status', 'cancelada'))"
      >
        <XCircle :size="11" /> Cancelar visita
      </button>
      <div class="my-1 border-t border-white/6" />
      <button
        class="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all"
        @click="act(() => emit('delete'))"
      >
        <Trash2 :size="11" /> Eliminar
      </button>
    </div>
  </div>
</template>
