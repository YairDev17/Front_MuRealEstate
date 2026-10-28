<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Bath, Bed, Heart, MapPin, Maximize2 } from 'lucide-vue-next'
import type { Propiedad } from '@/types/propiedad'
import { useFavoritosStore } from '@/stores/favoritos'
import { SERIF } from '@/config'

const props = defineProps<{ p: Propiedad }>()
const router = useRouter()
const favoritos = useFavoritosStore()
</script>

<template>
  <div
    class="group bg-white rounded-md overflow-hidden border border-[#1a1714]/8 hover:border-[#1a1714]/20 hover:shadow-md transition-all duration-300 cursor-pointer"
    @click="router.push(`/property/${props.p.id}`)"
  >
    <div class="relative overflow-hidden aspect-[4/3]">
      <img
        :src="p.imagen"
        :alt="p.titulo"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div class="absolute top-2.5 left-2.5">
        <span
          class="inline-block bg-[#1a1714]/80 backdrop-blur-sm text-[#f5f2ee] text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-sm"
        >
          {{ p.tipo === 'venta' ? 'En Venta' : 'En Renta' }}
        </span>
      </div>
      <button
        class="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all duration-150"
        @click.stop="favoritos.toggle(p.id)"
      >
        <Heart :size="12" :class="favoritos.esFavorito(p.id) ? 'fill-red-400 text-red-400' : 'text-[#7a7067]'" />
      </button>
    </div>
    <div class="p-4">
      <p class="text-[#a89f95] text-xs flex items-center gap-1 mb-1 truncate"><MapPin :size="10" />{{ p.ubicacion }}</p>
      <h3 class="text-[#1a1714] text-base leading-snug mb-3 line-clamp-1" :style="SERIF">{{ p.titulo }}</h3>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 text-[#7a7067] text-xs">
          <span class="flex items-center gap-1"><Bed :size="11" />{{ p.habitaciones }}</span>
          <span class="flex items-center gap-1"><Bath :size="11" />{{ p.banos }}</span>
          <span class="flex items-center gap-1"><Maximize2 :size="11" />{{ p.m2 }}m²</span>
        </div>
        <p class="text-[#1a1714] text-sm font-semibold" :style="SERIF">{{ p.precio }}</p>
      </div>
    </div>
  </div>
</template>
