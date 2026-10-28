<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import HomeNav from '@/components/home/HomeNav.vue'
import HeroSearch, { type BusquedaHome } from '@/components/home/HeroSearch.vue'
import PropertyCarousel from '@/components/home/PropertyCarousel.vue'
import StatsSection from '@/components/home/StatsSection.vue'
import AboutSection from '@/components/home/AboutSection.vue'
import TestimonialsSection from '@/components/home/TestimonialsSection.vue'
import ContactSection from '@/components/home/ContactSection.vue'
import SiteFooter from '@/components/home/SiteFooter.vue'
import WhatsAppFab from '@/components/home/WhatsAppFab.vue'
import PropertyCard from '@/components/propiedades/PropertyCard.vue'
import { propiedadesService } from '@/services/propiedades.service'
import type { Propiedad } from '@/types/propiedad'
import { SERIF } from '@/config'

const destacadas = ref<Propiedad[]>([])
const propiedades = ref<Propiedad[]>([])
const loading = ref(true)

const tipoPorServicio = { Venta: 'venta', Compra: 'venta', Renta: 'renta' } as const

async function cargar(busqueda?: BusquedaHome) {
  loading.value = true
  try {
    propiedades.value = await propiedadesService.listar({
      q: busqueda?.q,
      tipoInmueble: busqueda?.tipoInmueble ?? undefined,
      servicio: busqueda?.servicio,
      tipo: busqueda
        ? tipoPorServicio[busqueda.servicio as keyof typeof tipoPorServicio]
        : undefined,
    })
  } finally {
    loading.value = false
  }
}

const total = computed(() => propiedades.value.length)

onMounted(async () => {
  await cargar()
  destacadas.value = propiedades.value.filter((p) => p.destacada)
})
</script>

<template>
  <div class="min-h-screen font-['DM_Sans',sans-serif]">
    <HomeNav />
    <HeroSearch @buscar="cargar" />

    <section id="propiedades" class="py-8 bg-[#f5f2ee]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-10">
          <PropertyCarousel :items="destacadas" />
        </div>

        <div class="flex items-center justify-between mb-5">
          <h2 class="text-[#1a1714] text-2xl" :style="SERIF">Todas las propiedades</h2>
          <p class="text-[#a89f95] text-sm">{{ total }} propiedades</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <PropertyCard v-for="p in propiedades" :key="p.id" :p="p" />
        </div>
        <p v-if="!loading && !total" class="text-center text-[#a89f95] text-sm py-12">
          No encontramos propiedades con esos filtros.
        </p>
      </div>
    </section>

    <StatsSection />
    <AboutSection />
    <TestimonialsSection />
    <ContactSection />
    <SiteFooter />
    <WhatsAppFab />
  </div>
</template>
