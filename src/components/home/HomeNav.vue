<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { LogOut, Menu, Plus, X } from 'lucide-vue-next'
import muIsotipo from '@/assets/images/IsotipoMUrealEstate-removebg-preview.png'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const scrolled = ref(false)
const mobileOpen = ref(false)

const onScroll = () => (scrolled.value = window.scrollY > 10)
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

function scrollTo(id: string) {
  mobileOpen.value = false
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const navLinks = [
  { label: 'Propiedades', id: 'propiedades' },
  { label: 'Quiénes Somos', id: 'nosotros' },
  { label: 'Testimonios', id: 'testimonios' },
  { label: 'Contacto', id: 'contacto' },
]
</script>

<template>
  <header
    :class="[
      'sticky top-0 z-50 transition-all duration-300 border-b border-[#1a1714]/8',
      scrolled ? 'bg-[#f5f2ee]/95 backdrop-blur-md shadow-sm' : 'bg-[#f5f2ee]',
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      <button
        class="flex items-center shrink-0 hover:opacity-80 transition-opacity"
        @click="scrollTop"
      >
        <img :src="muIsotipo" alt="MU Real Estate" class="h-12 w-auto object-contain" />
      </button>

      <nav class="hidden lg:flex items-center gap-1">
        <button
          v-for="{ label, id } in navLinks"
          :key="label"
          class="px-4 py-2 rounded-lg text-sm text-[#7a7067] hover:text-[#1a1714] hover:bg-[#ede8e2] transition-all duration-150"
          @click="scrollTo(id)"
        >
          {{ label }}
        </button>
      </nav>

      <div class="hidden md:flex items-center gap-2">
        <button
          class="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#1a1714]/20 text-sm text-[#1a1714] font-medium hover:bg-[#ede8e2] transition-all duration-150"
          @click="router.push('/publicar')"
        >
          <Plus :size="14" /> Publicar
        </button>
        <template v-if="auth.isAuthenticated">
          <div class="flex items-center gap-2.5 pl-1">
            <div class="w-8 h-8 rounded-full bg-[#b8935a] flex items-center justify-center text-xs font-semibold text-white">
              {{ auth.iniciales }}
            </div>
            <span class="text-sm text-[#1a1714] font-medium">{{ auth.nombreCorto }}</span>
          </div>
          <button
            class="p-2 rounded-lg text-[#7a7067] hover:text-[#1a1714] hover:bg-[#ede8e2] transition-all duration-150"
            title="Cerrar sesión"
            @click="auth.logout()"
          >
            <LogOut :size="16" />
          </button>
        </template>
        <button
          v-else
          class="px-4 py-2 rounded-lg bg-[#1c2b47] text-[#f5f2ee] text-sm font-medium hover:bg-[#243559] transition-all duration-150"
          @click="router.push('/login')"
        >
          Iniciar sesión
        </button>
      </div>

      <button class="md:hidden p-2 rounded-lg text-[#7a7067] hover:bg-[#ede8e2]" @click="mobileOpen = !mobileOpen">
        <X v-if="mobileOpen" :size="20" />
        <Menu v-else :size="20" />
      </button>
    </div>

    <div v-if="mobileOpen" class="md:hidden bg-[#f5f2ee] border-t border-[#1a1714]/8 px-4 py-4 flex flex-col gap-2">
      <button
        v-for="{ label, id } in navLinks"
        :key="label"
        class="text-left px-3 py-2.5 rounded-lg text-sm text-[#7a7067] hover:text-[#1a1714] hover:bg-[#ede8e2] transition-colors"
        @click="scrollTo(id)"
      >
        {{ label }}
      </button>
      <div class="h-px bg-[#1a1714]/8 my-1" />
      <div class="flex gap-2">
        <button
          class="flex-1 py-2.5 rounded-lg border border-[#1a1714]/20 text-sm text-[#1a1714] font-medium hover:bg-[#ede8e2] transition-all flex items-center justify-center gap-1.5"
          @click="router.push('/publicar')"
        >
          <Plus :size="13" /> Publicar
        </button>
        <button
          v-if="auth.isAuthenticated"
          class="flex-1 py-2.5 rounded-lg bg-[#1c2b47] text-[#f5f2ee] text-sm font-medium hover:bg-[#243559] transition-all flex items-center justify-center gap-1.5"
          @click="auth.logout()"
        >
          <LogOut :size="13" /> Salir
        </button>
        <button
          v-else
          class="flex-1 py-2.5 rounded-lg bg-[#1c2b47] text-[#f5f2ee] text-sm font-medium hover:bg-[#243559] transition-all"
          @click="router.push('/login')"
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  </header>
</template>
