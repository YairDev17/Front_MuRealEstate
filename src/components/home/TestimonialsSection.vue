<script setup lang="ts">
import { Star } from 'lucide-vue-next'
import { SERIF } from '@/config'

const testimonios = [
  {
    nombre: 'Gabriela Torres',
    cargo: 'Compradora en Polanco',
    texto:
      'Llevaba más de un año buscando sin encontrar lo que necesitaba. En MU Real Estate lo encontré en tres semanas. El acompañamiento fue impecable de principio a fin.',
    avatar: 'GT',
    avatarBg: '#d1fae5',
    avatarColor: '#065f46',
  },
  {
    nombre: 'Ricardo Solís',
    cargo: 'Inversionista · Santa Fe',
    texto:
      'Tienen acceso a propiedades que no están en ningún otro portal. Gracias a ellos cerré dos inversiones con retornos muy por encima del mercado.',
    avatar: 'RS',
    avatarBg: '#e0f2fe',
    avatarColor: '#0c4a6e',
  },
  {
    nombre: 'Mariana Vega',
    cargo: 'Rentista · Condesa',
    texto:
      'Buscaba departamento en la Condesa con presupuesto ajustado. Me presentaron opciones reales, sin perder tiempo. El proceso fue rápido y sin sorpresas.',
    avatar: 'MV',
    avatarBg: '#fef3c7',
    avatarColor: '#78350f',
  },
]
</script>

<template>
  <section id="testimonios" class="py-20 bg-[#f5f2ee]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <p class="text-[#a89f95] text-xs tracking-widest uppercase mb-3">Testimonios</p>
        <h2 class="text-[#1a1714] text-3xl lg:text-4xl" :style="SERIF">Lo que dicen nuestros clientes</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          v-for="t in testimonios"
          :key="t.nombre"
          class="bg-white rounded-md p-7 border border-[#1a1714]/6 flex flex-col gap-5"
        >
          <div class="flex gap-1">
            <Star v-for="i in 5" :key="i" :size="13" class="fill-[#b8935a] text-[#b8935a]" />
          </div>
          <p class="text-[#4a4540] text-sm leading-relaxed flex-1">"{{ t.texto }}"</p>
          <div class="flex items-center gap-3 pt-3 border-t border-[#1a1714]/6">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
              :style="{ backgroundColor: t.avatarBg, color: t.avatarColor }"
            >
              {{ t.avatar }}
            </div>
            <div>
              <p class="text-[#1a1714] text-sm font-medium">{{ t.nombre }}</p>
              <p class="text-[#a89f95] text-xs">{{ t.cargo }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
