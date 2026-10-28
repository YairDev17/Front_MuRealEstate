<script setup lang="ts">
import { computed, ref } from 'vue'
import { CalendarCheck, PhoneCall, Send, X } from 'lucide-vue-next'
import type { EstadoSolicitud, Solicitud } from '@/types/admin'
import { AGENTES, ESTADOS_SOL, ESTADOS_SOL_KEYS } from './solicitudesConfig'

const props = defineProps<{ sol: Solicitud }>()
const emit = defineEmits<{
  close: []
  asignar: [agente: string]
  cambiarEstado: [estado: EstadoSolicitud]
  guardarNota: [nota: string]
}>()

const nota = ref(props.sol.notas)
const agente = ref(props.sol.asignadoA ?? '')
const cfg = computed(() => ESTADOS_SOL[props.sol.estado])

const datos = computed(() => [
  { label: 'Teléfono', value: props.sol.telefono },
  { label: 'Correo', value: props.sol.correo },
  { label: 'Propiedad', value: props.sol.propiedad },
  { label: 'Ubicación', value: props.sol.ubicacion },
  { label: 'Fecha', value: props.sol.fecha },
  { label: 'Hora', value: props.sol.hora },
])
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <div
      class="bg-[#141413] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
    >
      <div class="flex items-center justify-between p-6 border-b border-white/6">
        <div class="flex items-center gap-3">
          <div
            :class="[
              'w-8 h-8 rounded-xl border flex items-center justify-center',
              cfg.bg,
              cfg.color,
            ]"
          >
            <CalendarCheck v-if="sol.tipo === 'visita'" :size="14" />
            <PhoneCall v-else :size="14" />
          </div>
          <div>
            <p class="text-white/80 text-sm font-medium">{{ sol.nombre }}</p>
            <p class="text-white/30 text-xs">
              {{ sol.tipo === 'visita' ? 'Solicitud de visita' : 'Solicitud de contacto' }}
            </p>
          </div>
        </div>
        <button
          class="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
          @click="emit('close')"
        >
          <X :size="16" />
        </button>
      </div>

      <div class="p-6 space-y-5">
        <div class="grid grid-cols-2 gap-3">
          <div v-for="d in datos" :key="d.label">
            <p class="text-white/25 text-[10px] tracking-widest uppercase mb-1">{{ d.label }}</p>
            <p class="text-white/60 text-xs">{{ d.value }}</p>
          </div>
        </div>

        <div class="bg-white/4 border border-white/6 rounded-xl p-4">
          <p class="text-white/25 text-[10px] tracking-widest uppercase mb-2">Mensaje</p>
          <p class="text-white/50 text-sm leading-relaxed">"{{ sol.mensaje }}"</p>
        </div>

        <div>
          <p class="text-white/25 text-[10px] tracking-widest uppercase mb-2">Estado</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="e in ESTADOS_SOL_KEYS"
              :key="e"
              :class="[
                'inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all',
                sol.estado === e
                  ? [ESTADOS_SOL[e].bg, ESTADOS_SOL[e].color]
                  : 'border-white/8 text-white/25 hover:border-white/20',
              ]"
              @click="emit('cambiarEstado', e)"
            >
              <component :is="ESTADOS_SOL[e].icon" :size="11" /> {{ ESTADOS_SOL[e].label }}
            </button>
          </div>
        </div>

        <div>
          <p class="text-white/25 text-[10px] tracking-widest uppercase mb-2">Asignar a</p>
          <div class="flex gap-2">
            <select
              v-model="agente"
              class="flex-1 bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/20 transition-all appearance-none"
            >
              <option value="" class="bg-[#141413]">Sin asignar</option>
              <option v-for="a in AGENTES" :key="a" :value="a" class="bg-[#141413]">{{ a }}</option>
            </select>
            <button
              class="px-4 py-2 rounded-lg bg-white/8 border border-white/10 text-white/60 text-sm hover:bg-white/14 transition-all"
              @click="emit('asignar', agente)"
            >
              Asignar
            </button>
          </div>
        </div>

        <div>
          <p class="text-white/25 text-[10px] tracking-widest uppercase mb-2">Notas internas</p>
          <textarea
            v-model="nota"
            rows="3"
            placeholder="Agrega una nota de seguimiento..."
            class="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all resize-none"
          />
          <button
            class="mt-2 flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-all"
            @click="emit('guardarNota', nota)"
          >
            <Send :size="11" /> Guardar nota
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
