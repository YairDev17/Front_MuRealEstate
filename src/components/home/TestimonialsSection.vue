<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { MessageSquarePlus } from 'lucide-vue-next'
import StarRating from '@/components/ui/StarRating.vue'
import ReviewForm from '@/components/resenas/ReviewForm.vue'
import { resenasService } from '@/services/modulos.service'
import type { Resena } from '@/types/modulos'
import { SERIF } from '@/config'

const AVATARES = [
  { bg: '#d1fae5', color: '#065f46' },
  { bg: '#e0f2fe', color: '#0c4a6e' },
  { bg: '#fef3c7', color: '#78350f' },
  { bg: '#ede9fe', color: '#4c1d95' },
]

const testimonios = ref<Resena[]>([])
const mostrarForm = ref(false)

onMounted(async () => {
  testimonios.value = (await resenasService.publicas())
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 6)
})

const iniciales = (n: string) =>
  n
    .split(' ')
    .slice(0, 2)
    .map((x) => x[0])
    .join('')
    .toUpperCase()
</script>

<template>
  <section id="testimonios" class="py-20 bg-[#f5f2ee]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <p class="text-[#a89f95] text-xs tracking-widest uppercase mb-3">Testimonios</p>
        <h2 class="text-[#1a1714] text-3xl lg:text-4xl" :style="SERIF">
          Lo que dicen nuestros clientes
        </h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          v-for="(t, i) in testimonios"
          :key="t.id"
          class="bg-white rounded-md p-7 border border-[#1a1714]/6 flex flex-col gap-5"
        >
          <StarRating :model-value="t.calificacion" readonly :size="13" />
          <p class="text-[#4a4540] text-sm leading-relaxed flex-1">"{{ t.comentario }}"</p>
          <div class="flex items-center gap-3 pt-3 border-t border-[#1a1714]/6">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
              :style="{ backgroundColor: AVATARES[i % 4]!.bg, color: AVATARES[i % 4]!.color }"
            >
              {{ iniciales(t.autor) }}
            </div>
            <div>
              <p class="text-[#1a1714] text-sm font-medium">{{ t.autor }}</p>
              <p class="text-[#a89f95] text-xs">{{ t.perfil }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-10 max-w-2xl mx-auto">
        <div v-if="!mostrarForm" class="text-center">
          <button
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-[#1a1714]/20 text-sm text-[#1a1714] font-medium hover:bg-[#ede8e2] transition-all"
            @click="mostrarForm = true"
          >
            <MessageSquarePlus :size="15" /> Comparte tu experiencia
          </button>
        </div>
        <ReviewForm v-else />
      </div>
    </div>
  </section>
</template>
