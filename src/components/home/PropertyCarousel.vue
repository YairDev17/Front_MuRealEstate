<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Bath, Bed, ChevronLeft, ChevronRight, Heart, MapPin, Maximize2 } from 'lucide-vue-next'
import type { Propiedad } from '@/types/propiedad'
import { useFavoritosStore } from '@/stores/favoritos'
import { SERIF } from '@/config'

const CARD_MS = 15000
const PHOTO_MS = 5000

const props = defineProps<{ items: Propiedad[] }>()
const router = useRouter()
const favoritos = useFavoritosStore()

const current = ref(0)
const photoIdx = ref(0)

const safeIndex = computed(() => (props.items.length > 0 ? current.value % props.items.length : 0))
const p = computed(() => props.items[safeIndex.value])
const photosOf = (item: Propiedad) => (item.imagenes?.length ? item.imagenes : [item.imagen])

function goTo(idx: number) {
  if (!props.items.length) return
  current.value = (idx + props.items.length) % props.items.length
  photoIdx.value = 0
}

watch(
  () => props.items.length,
  () => {
    current.value = 0
    photoIdx.value = 0
  },
)

// Cambia de propiedad cada 15 s
let cardTimer: ReturnType<typeof setTimeout> | undefined
watch(
  [safeIndex, () => props.items.length],
  () => {
    clearTimeout(cardTimer)
    if (props.items.length) cardTimer = setTimeout(() => goTo(safeIndex.value + 1), CARD_MS)
  },
  { immediate: true },
)

// Rota las fotos de la propiedad actual cada 5 s
let photoTimer: ReturnType<typeof setTimeout> | undefined
watch(
  [safeIndex, photoIdx, () => props.items.length],
  () => {
    clearTimeout(photoTimer)
    const photos = p.value?.imagenes ?? []
    if (photos.length <= 1) return
    photoTimer = setTimeout(() => (photoIdx.value = (photoIdx.value + 1) % photos.length), PHOTO_MS)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  clearTimeout(cardTimer)
  clearTimeout(photoTimer)
})
</script>

<template>
  <div v-if="!items.length || !p" class="rounded-lg bg-[#ede8e2] aspect-[16/6] flex items-center justify-center">
    <p class="text-[#a89f95] text-sm">Sin propiedades destacadas en esta categoría.</p>
  </div>

  <div
    v-else
    class="relative w-full rounded-lg overflow-hidden bg-stone-800 aspect-[16/7] md:aspect-[16/6] lg:aspect-[16/5.5] cursor-pointer"
    @click="router.push(`/property/${p.id}`)"
  >
    <!-- Property slides -->
    <div
      v-for="(item, i) in items"
      :key="item.id"
      class="absolute inset-0 transition-opacity duration-700"
      :style="{ opacity: i === safeIndex ? 1 : 0, pointerEvents: i === safeIndex ? 'auto' : 'none' }"
    >
      <!-- Photo sub-slides with Ken Burns -->
      <div
        v-for="(photo, j) in photosOf(item)"
        :key="`${item.id}-${j}`"
        class="absolute inset-0 transition-opacity duration-1000"
        :style="{ opacity: i === safeIndex && j === photoIdx ? 1 : 0 }"
      >
        <img
          v-if="i === safeIndex && j === photoIdx"
          :src="photo"
          :alt="item.titulo"
          :class="['w-full h-full object-cover ken-burns', `kb-${j % 3}`]"
        />
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
    </div>

    <!-- Like button -->
    <button
      class="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
      @click.stop="favoritos.toggle(p.id)"
    >
      <Heart :size="16" :class="favoritos.esFavorito(p.id) ? 'fill-red-400 text-red-400' : 'text-white'" />
    </button>

    <!-- Tipo badge -->
    <div class="absolute top-4 left-4 z-10">
      <span class="inline-block bg-[#b8935a] text-[#1a1714] text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-sm">
        {{ p.tipo === 'venta' ? 'En Venta' : 'En Renta' }}
      </span>
    </div>

    <!-- Photo sub-dots -->
    <div v-if="p.imagenes && p.imagenes.length > 1" class="absolute top-4 right-16 z-10 flex gap-1 items-center">
      <button
        v-for="(_, j) in p.imagenes"
        :key="j"
        :class="[
          'rounded-full transition-all duration-300',
          j === photoIdx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60',
        ]"
        @click.stop="photoIdx = j"
      />
    </div>

    <!-- Info overlay -->
    <div class="absolute bottom-0 left-0 right-0 z-10 p-5 sm:p-7">
      <div class="flex items-end justify-between gap-4">
        <div>
          <p class="text-white/70 text-xs flex items-center gap-1 mb-1"><MapPin :size="11" />{{ p.ubicacion }}</p>
          <h2 class="text-white text-xl sm:text-2xl lg:text-3xl mb-2 leading-tight" :style="SERIF">{{ p.titulo }}</h2>
          <div class="flex items-center gap-4 text-white/70 text-xs">
            <span class="flex items-center gap-1"><Bed :size="12" />{{ p.habitaciones }} hab.</span>
            <span class="flex items-center gap-1"><Bath :size="12" />{{ p.banos }} baños</span>
            <span class="flex items-center gap-1"><Maximize2 :size="12" />{{ p.m2 }} m²</span>
          </div>
        </div>
        <div class="text-right shrink-0">
          <p class="text-white/60 text-xs mb-0.5">Precio</p>
          <p class="text-white text-lg sm:text-xl font-semibold" :style="SERIF">{{ p.precio }}</p>
        </div>
      </div>
    </div>

    <!-- Prev / Next -->
    <button
      class="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
      @click.stop="goTo(safeIndex - 1)"
    >
      <ChevronLeft :size="18" class="text-white" />
    </button>
    <button
      class="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
      @click.stop="goTo(safeIndex + 1)"
    >
      <ChevronRight :size="18" class="text-white" />
    </button>

    <!-- Card dots -->
    <div class="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
      <button
        v-for="(_, i) in items"
        :key="i"
        :class="['h-1.5 rounded-full transition-all duration-300', i === safeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40']"
        @click.stop="goTo(i)"
      />
    </div>
  </div>
</template>

<style scoped>
.ken-burns {
  will-change: transform;
}
.kb-0 {
  animation: kb0 5s ease-out forwards;
}
.kb-1 {
  animation: kb1 5s ease-out forwards;
}
.kb-2 {
  animation: kb2 5s ease-out forwards;
}
@keyframes kb0 {
  0% { transform: scale(1) translate(0%, 0%); }
  100% { transform: scale(1.07) translate(-1.5%, -1%); }
}
@keyframes kb1 {
  0% { transform: scale(1.05) translate(-2%, 0%); }
  100% { transform: scale(1) translate(1%, 1%); }
}
@keyframes kb2 {
  0% { transform: scale(1) translate(1%, 1%); }
  100% { transform: scale(1.06) translate(-1%, -1.5%); }
}
</style>
