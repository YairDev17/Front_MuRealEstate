<script setup lang="ts">
import { computed } from 'vue'
import { Bath, Bed, CheckCircle2, MapPin, Maximize2, XCircle } from 'lucide-vue-next'
import type { EstadoPostulacion, Postulacion } from '@/types/admin'
import { iniciales } from './estadoPropiedad'
import { SERIF } from '@/config'

const ESTADO: Record<EstadoPostulacion, { label: string; color: string; bg: string }> = {
  pendiente: { label: 'Pendiente', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
  aprobada: { label: 'Aprobada', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  rechazada: { label: 'Rechazada', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
}

const props = defineProps<{ p: Postulacion }>()
defineEmits<{ aprobar: []; rechazar: [] }>()
const cfg = computed(() => ESTADO[props.p.estado])
</script>

<template>
  <div class="bg-white/4 border border-white/8 rounded-xl overflow-hidden hover:border-white/14 transition-all duration-200 group">
    <div class="relative h-40 overflow-hidden bg-white/5">
      <img
        :src="p.imagen"
        :alt="p.titulo"
        class="w-full h-full object-cover opacity-80 group-hover:opacity-95 group-hover:scale-105 transition-all duration-400"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div class="absolute top-2.5 left-2.5 flex gap-1.5">
        <span
          :class="[
            'inline-flex items-center border text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full',
            cfg.bg,
            cfg.color,
          ]"
        >
          {{ cfg.label }}
        </span>
        <span class="inline-block bg-black/50 backdrop-blur-sm text-white/70 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
          {{ p.tipoInmueble }}
        </span>
      </div>
      <div class="absolute bottom-2.5 left-2.5 right-2.5">
        <p class="text-white text-sm font-medium leading-tight line-clamp-1" :style="SERIF">{{ p.titulo }}</p>
      </div>
    </div>

    <div class="p-4">
      <p class="text-white/40 text-xs flex items-center gap-1 mb-3 truncate">
        <MapPin :size="10" /> {{ p.colonia }}, {{ p.ciudad }}
      </p>
      <div class="flex items-center gap-3 text-white/30 text-xs mb-3">
        <span v-if="p.habitaciones > 0" class="flex items-center gap-1"><Bed :size="10" /> {{ p.habitaciones }}</span>
        <span v-if="p.banos > 0" class="flex items-center gap-1"><Bath :size="10" /> {{ p.banos }}</span>
        <span class="flex items-center gap-1"><Maximize2 :size="10" /> {{ p.m2 }}m²</span>
      </div>
      <div class="flex items-center justify-between mb-4">
        <p class="text-white text-sm font-semibold" :style="SERIF">
          ${{ p.precio }}<span v-if="p.tipo === 'renta'" class="text-white/30 text-xs font-normal"> / mes</span>
        </p>
        <span class="text-white/20 text-[10px]">{{ p.fechaEnvio }}</span>
      </div>

      <div class="bg-white/4 rounded-lg p-3 mb-4 flex items-start gap-2.5">
        <div class="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/50 font-medium shrink-0">
          {{ iniciales(p.contacto) }}
        </div>
        <div class="min-w-0">
          <p class="text-white/60 text-xs font-medium truncate">{{ p.contacto }}</p>
          <p class="text-white/30 text-[10px] truncate">{{ p.telefono }}</p>
          <p class="text-white/25 text-[10px] truncate">{{ p.correo }}</p>
        </div>
      </div>

      <div v-if="p.estado === 'pendiente'" class="flex gap-2">
        <button
          class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-medium hover:bg-emerald-400/20 transition-all"
          @click="$emit('aprobar')"
        >
          <CheckCircle2 :size="12" /> Aprobar
        </button>
        <button
          class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-medium hover:bg-red-400/20 transition-all"
          @click="$emit('rechazar')"
        >
          <XCircle :size="12" /> Rechazar
        </button>
      </div>
      <div v-else :class="['text-center py-2 rounded-lg border text-xs font-medium', cfg.bg, cfg.color]">
        {{ cfg.label }}
      </div>
    </div>
  </div>
</template>
