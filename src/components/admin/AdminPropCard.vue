<script setup lang="ts">
import { computed } from 'vue'
import { Bath, Bed, Eye, MapPin, Maximize2, MoreHorizontal } from 'lucide-vue-next'
import type { PropiedadAdmin } from '@/types/propiedad'
import { ESTADO_PROPIEDAD, iniciales } from './estadoPropiedad'
import { SERIF } from '@/config'

const props = defineProps<{ p: PropiedadAdmin }>()
const cfg = computed(() => ESTADO_PROPIEDAD[props.p.estado])
</script>

<template>
  <div
    class="bg-white/4 border border-white/8 rounded-xl overflow-hidden hover:border-white/20 hover:bg-white/6 transition-all duration-200 group cursor-pointer"
  >
    <div class="relative h-36 overflow-hidden bg-white/5">
      <img
        :src="p.imagen"
        :alt="p.titulo"
        class="w-full h-full object-cover opacity-80 group-hover:opacity-95 group-hover:scale-105 transition-all duration-400"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div class="absolute top-2.5 left-2.5">
        <span
          :class="[
            'inline-flex items-center gap-1.5 border text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full',
            cfg.badge,
          ]"
        >
          <span :class="['w-1.5 h-1.5 rounded-full', cfg.dot]" />
          {{ cfg.label }}
        </span>
      </div>
      <div class="absolute top-2.5 right-2.5">
        <span class="inline-block bg-black/50 backdrop-blur-sm text-white/70 text-[10px] px-2 py-1 rounded-full uppercase tracking-wider">
          {{ p.tipo === 'venta' ? 'Venta' : 'Renta' }}
        </span>
      </div>
      <div class="absolute bottom-2.5 left-2.5 right-2.5">
        <p class="text-white text-sm font-medium leading-tight line-clamp-1" :style="SERIF">{{ p.titulo }}</p>
      </div>
    </div>

    <div class="p-3.5">
      <p class="text-white/40 text-xs flex items-center gap-1 mb-3 truncate"><MapPin :size="10" /> {{ p.colonia }}</p>
      <div class="flex items-center gap-3 text-white/30 text-xs mb-3">
        <span class="flex items-center gap-1"><Bed :size="10" /> {{ p.habitaciones }}</span>
        <span class="flex items-center gap-1"><Bath :size="10" /> {{ p.banos }}</span>
        <span class="flex items-center gap-1"><Maximize2 :size="10" /> {{ p.m2 }}m²</span>
      </div>
      <div class="flex items-center justify-between">
        <p class="text-white text-sm font-semibold" :style="SERIF">{{ p.precio }}</p>
        <button
          class="p-1 rounded-md text-white/20 hover:text-white/50 hover:bg-white/5 transition-all duration-150"
          @click.stop
        >
          <MoreHorizontal :size="14" />
        </button>
      </div>
      <div class="mt-3 pt-3 border-t border-white/6 flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <div class="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] text-white/50 font-medium">
            {{ iniciales(p.agente) }}
          </div>
          <span class="text-white/30 text-xs">{{ p.agente }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="p.visitas !== undefined" class="text-white/25 text-xs flex items-center gap-1">
            <Eye :size="9" /> {{ p.visitas }}
          </span>
          <span class="text-white/20 text-[10px]">{{ p.fechaIngreso }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
