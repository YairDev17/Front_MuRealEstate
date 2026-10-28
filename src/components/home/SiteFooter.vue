<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-vue-next'
import muIsotipo from '@/assets/images/IsotipoMUrealEstate-removebg-preview.png'
import { SERIF } from '@/config'

const router = useRouter()
const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
const noop = () => {}

const cols = [
  {
    title: 'Propiedades',
    links: [
      { label: 'Casas en venta', action: () => scrollTo('propiedades') },
      { label: 'Departamentos en renta', action: () => scrollTo('propiedades') },
      { label: 'Propiedades de lujo', action: () => scrollTo('propiedades') },
      { label: 'Inversiones', action: () => scrollTo('propiedades') },
    ],
  },
  {
    title: 'Zonas',
    links: [
      { label: 'Polanco', action: () => scrollTo('propiedades') },
      { label: 'Lomas de Chapultepec', action: () => scrollTo('propiedades') },
      { label: 'Condesa & Roma', action: () => scrollTo('propiedades') },
      { label: 'Santa Fe', action: () => scrollTo('propiedades') },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Quiénes somos', action: () => scrollTo('nosotros') },
      { label: 'Testimonios', action: () => scrollTo('testimonios') },
      { label: 'Área de administradores', action: () => router.push('/admin') },
      { label: 'Contacto', action: () => scrollTo('contacto') },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Aviso de privacidad', action: noop },
      { label: 'Términos y condiciones', action: noop },
      { label: 'Política de cookies', action: noop },
    ],
  },
]

const socials = [
  { label: 'Instagram', icon: Instagram },
  { label: 'Facebook', icon: Facebook },
  { label: 'Twitter', icon: Twitter },
  { label: 'LinkedIn', icon: Linkedin },
]
</script>

<template>
  <footer class="bg-[#1a1714] pt-16 pb-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div class="col-span-2 md:col-span-1">
          <div class="flex items-center gap-3 mb-4">
            <img
              :src="muIsotipo"
              alt="MU Real Estate isotipo"
              class="h-12 w-auto object-contain brightness-0 invert opacity-80"
            />
            <div>
              <p
                class="text-white/80 text-base font-semibold tracking-widest uppercase leading-none"
                :style="SERIF"
              >
                MU
              </p>
              <p class="text-white/50 text-[9px] tracking-[0.25em] uppercase leading-none mt-0.5">
                Real Estate
              </p>
            </div>
          </div>
          <p class="text-white/30 text-xs leading-relaxed max-w-xs">
            Conectamos personas con propiedades excepcionales en la Ciudad de México desde 2015.
          </p>
        </div>
        <div v-for="col in cols" :key="col.title">
          <p class="text-white/50 text-xs tracking-widest uppercase mb-4">{{ col.title }}</p>
          <ul class="flex flex-col gap-2.5">
            <li v-for="link in col.links" :key="link.label">
              <button
                class="text-white/30 text-sm hover:text-white/70 transition-colors text-left"
                @click="link.action"
              >
                {{ link.label }}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div class="h-px bg-white/8 mb-8" />

      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-white/20 text-xs">
          © 2026 MU Real Estate S.A. de C.V. Todos los derechos reservados.
        </p>
        <div class="flex items-center gap-4">
          <button
            v-for="s in socials"
            :key="s.label"
            :title="s.label"
            class="text-white/20 hover:text-white/60 transition-colors"
          >
            <component :is="s.icon" :size="14" />
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>
