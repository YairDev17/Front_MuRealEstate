<script setup lang="ts">
import { SERIF } from '@/config'

const values = [
  { title: 'Transparencia', desc: 'Información clara y honesta en cada transacción.' },
  { title: 'Experiencia', desc: '11 años en el mercado inmobiliario de la CDMX.' },
  { title: 'Exclusividad', desc: 'Acceso a propiedades fuera del mercado masivo.' },
  { title: 'Confianza', desc: 'Más de 8,000 familias avalan nuestro servicio.' },
]
</script>

<template>
  <section id="nosotros" class="py-20 bg-white overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-14 xl:gap-20 items-center">
        <div class="relative">
          <div class="aspect-[4/3] rounded-md overflow-hidden bg-stone-200">
            <img
              src="https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=900&h=700&fit=crop&auto=format"
              alt="Equipo MU Real Estate"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="absolute -bottom-6 -right-2 sm:right-6 bg-[#1a1714] text-white rounded-md p-5 shadow-xl max-w-[200px]">
            <p class="text-3xl mb-1" :style="SERIF">11</p>
            <p class="text-white/50 text-xs leading-snug">Años siendo referente inmobiliario en CDMX</p>
          </div>
        </div>

        <div class="pt-8 lg:pt-0">
          <p class="text-[#a89f95] text-xs tracking-widest uppercase mb-3">Quiénes somos</p>
          <h2 class="text-[#1a1714] text-3xl lg:text-4xl leading-snug mb-6" :style="SERIF">
            Somos el puente entre tus sueños y tu próximo hogar.
          </h2>
          <p class="text-[#7a7067] text-sm leading-relaxed mb-4">
            Fundada en 2015, <strong class="text-[#1a1714] font-medium">MU Real Estate</strong> nació con una misión
            clara: democratizar el acceso a propiedades de calidad en la Ciudad de México. Nuestro equipo de más de 40
            asesores especializados trabaja cada día para que encontrar o vender una propiedad sea una experiencia sin
            estrés.
          </p>
          <p class="text-[#7a7067] text-sm leading-relaxed mb-8">
            Nos especializamos en zonas premium como Polanco, Lomas, Santa Fe, Condesa y Roma Norte, con un portafolio
            exclusivo que rara vez se encuentra en portales masivos.
          </p>
          <div class="grid grid-cols-2 gap-3">
            <div v-for="v in values" :key="v.title" class="bg-[#f5f2ee] rounded-md p-4">
              <p class="text-[#1a1714] text-sm font-medium mb-1" :style="SERIF">{{ v.title }}</p>
              <p class="text-[#a89f95] text-xs leading-relaxed">{{ v.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
