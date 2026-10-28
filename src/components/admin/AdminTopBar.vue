<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft, ShieldCheck } from 'lucide-vue-next'
import muIsotipo from '@/assets/images/IsotipoMUrealEstate-removebg-preview.png'

/** Barra superior común de las pantallas del panel de administración. */
withDefaults(defineProps<{ section?: string; wide?: boolean; backLabel?: string }>(), {
  wide: false,
  backLabel: 'Volver al panel',
})
const router = useRouter()
</script>

<template>
  <nav class="sticky top-0 z-40 bg-[#111210]/90 backdrop-blur-md border-b border-white/6">
    <div
      :class="['mx-auto px-5 flex items-center justify-between gap-4', wide ? 'max-w-screen-2xl' : 'max-w-screen-xl']"
      style="height: 60px"
    >
      <div class="flex items-center gap-3">
        <img :src="muIsotipo" alt="MU Real Estate" class="h-10 w-auto object-contain brightness-0 invert opacity-80" />
        <span class="text-white/25 text-xs flex items-center gap-1">
          <ShieldCheck :size="11" class="text-white/20" /> Admin
        </span>
        <template v-if="section">
          <span class="text-white/15 text-xs hidden sm:block">|</span>
          <span class="text-white/30 text-xs hidden sm:block">{{ section }}</span>
        </template>
      </div>

      <slot name="center" />

      <slot name="actions">
        <button
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-white/30 text-sm hover:text-white/60 hover:bg-white/5 transition-all"
          @click="router.push('/admin/panel')"
        >
          <ArrowLeft :size="14" /> {{ backLabel }}
        </button>
      </slot>
    </div>
  </nav>
</template>
