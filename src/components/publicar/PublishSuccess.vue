<script setup lang="ts">
import { CheckCircle2 } from 'lucide-vue-next'
import muIsotipo from '@/assets/images/IsotipoMUrealEstate-removebg-preview.png'
import { SERIF } from '@/config'

defineProps<{ nombre: string; colonia: string; ciudad: string }>()
defineEmits<{ volver: []; otra: [] }>()

const steps = [
  { label: 'Recibido', desc: 'Tu solicitud llegó a nuestro equipo.', done: true, active: false },
  { label: 'En revisión', desc: 'Verificamos los datos y fotografías.', done: true, active: true },
  { label: 'Contacto', desc: 'Te llamamos para confirmar detalles.', done: false, active: false },
  {
    label: 'Publicado',
    desc: 'La propiedad aparece en el portafolio.',
    done: false,
    active: false,
  },
]
</script>

<template>
  <div class="min-h-screen bg-[#f5f2ee] font-['DM_Sans',sans-serif]">
    <nav class="sticky top-0 z-40 bg-[#f5f2ee]/95 backdrop-blur-md border-b border-[#1a1714]/8">
      <div class="max-w-screen-xl mx-auto px-5 flex items-center" style="height: 60px">
        <img :src="muIsotipo" alt="MU Real Estate" class="h-24 w-auto object-contain" />
      </div>
    </nav>

    <div class="max-w-screen-xl mx-auto px-5 py-16 flex flex-col items-center">
      <div
        class="inline-flex items-center gap-2 bg-[#b8935a]/12 border border-[#b8935a]/30 rounded-full px-4 py-1.5 mb-8"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-[#b8935a] animate-pulse" />
        <span class="text-[#b8935a] text-xs font-medium tracking-wider uppercase">En revisión</span>
      </div>

      <div
        class="bg-white border border-[#1a1714]/8 rounded-xl max-w-lg w-full p-8 mb-8 text-center shadow-sm"
      >
        <div
          class="w-16 h-16 rounded-full bg-[#1c2b47] flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 :size="26" class="text-[#b8935a]" />
        </div>
        <h1 class="text-[#1a1714] text-3xl mb-2" :style="SERIF">¡Tu propiedad está en revisión!</h1>
        <p v-if="nombre || colonia" class="text-[#b8935a] text-sm mb-3 font-medium">
          {{ nombre || [colonia, ciudad].filter(Boolean).join(', ') }}
        </p>
        <p class="text-[#7a7067] text-sm leading-relaxed mb-6">
          Recibimos toda la información. Nuestro equipo la revisará y se pondrá en contacto contigo
          para confirmar los detalles antes de publicarla.
        </p>
        <div class="bg-[#f5f2ee] rounded-lg p-4 flex items-center justify-center gap-2 mb-2">
          <span class="text-[#a89f95] text-xs">Tiempo estimado de respuesta:</span>
          <span class="text-[#1c2b47] text-xs font-semibold">24 – 48 horas hábiles</span>
        </div>
      </div>

      <div class="bg-white border border-[#1a1714]/8 rounded-xl max-w-lg w-full px-8 py-6 mb-8">
        <p class="text-[#a89f95] text-[10px] tracking-widest uppercase font-medium mb-6">
          ¿Qué sigue?
        </p>
        <div class="flex flex-col gap-0">
          <div v-for="(s, i) in steps" :key="s.label" class="flex gap-4">
            <div class="flex flex-col items-center">
              <div
                :class="[
                  'w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all',
                  s.active
                    ? 'border-[#b8935a] bg-[#b8935a]'
                    : s.done
                      ? 'border-[#1c2b47] bg-[#1c2b47]'
                      : 'border-[#1a1714]/12 bg-white',
                ]"
              >
                <CheckCircle2 v-if="s.done || s.active" :size="12" class="text-white" />
                <span v-else class="text-[#a89f95] text-[10px] font-semibold">{{ i + 1 }}</span>
              </div>
              <div
                v-if="i < steps.length - 1"
                :class="['w-px flex-1 my-1', s.done ? 'bg-[#1c2b47]/20' : 'bg-[#1a1714]/8']"
                style="min-height: 24px"
              />
            </div>
            <div class="pb-5">
              <p
                :class="[
                  'text-sm font-medium leading-none mb-1',
                  s.active ? 'text-[#b8935a]' : s.done ? 'text-[#1c2b47]' : 'text-[#a89f95]',
                ]"
              >
                {{ s.label }}
                <span
                  v-if="s.active"
                  class="ml-2 text-[9px] bg-[#b8935a]/12 text-[#b8935a] border border-[#b8935a]/25 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold"
                >
                  Ahora
                </span>
              </p>
              <p class="text-[#a89f95] text-xs">{{ s.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
        <button
          class="flex-1 bg-[#1c2b47] text-[#f5f2ee] rounded-md py-3.5 text-sm font-medium hover:bg-[#243559] active:scale-[0.99] transition-all duration-200"
          @click="$emit('volver')"
        >
          Volver al inicio
        </button>
        <button
          class="flex-1 bg-transparent border border-[#1a1714]/15 text-[#7a7067] rounded-md py-3.5 text-sm hover:border-[#1a1714]/25 hover:text-[#1a1714] transition-all"
          @click="$emit('otra')"
        >
          Publicar otra propiedad
        </button>
      </div>
    </div>
  </div>
</template>
