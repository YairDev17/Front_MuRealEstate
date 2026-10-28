<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Heart, LogOut, Menu, Search, X } from 'lucide-vue-next'
import muIsotipo from '@/assets/images/IsotipoMUrealEstate-removebg-preview.png'
import WhatsAppIcon from '@/components/ui/WhatsAppIcon.vue'
import { useAuthStore } from '@/stores/auth'
import { WHATSAPP_URL } from '@/config'

const router = useRouter()
const auth = useAuthStore()
const menuOpen = ref(false)
const query = ref('')

function handleLogout() {
  auth.logout()
  router.push('/')
}

// TODO: conectar con la búsqueda del catálogo (por ahora regresa al inicio).
const buscar = () => router.push({ path: '/', query: query.value ? { q: query.value } : {} })
</script>

<template>
  <nav class="sticky top-0 z-40 bg-[#f5f2ee]/90 backdrop-blur-md border-b border-[#1a1714]/8">
    <div
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4"
    >
      <button
        class="flex items-center shrink-0 hover:opacity-80 transition-opacity"
        @click="router.push('/home')"
      >
        <img :src="muIsotipo" alt="MU Real Estate" class="h-14 w-auto object-contain" />
      </button>

      <form
        class="hidden md:flex flex-1 max-w-sm items-center bg-[#ede8e2] rounded-lg px-3.5 py-2 gap-2"
        @submit.prevent="buscar"
      >
        <Search :size="14" class="text-[#a89f95] shrink-0" />
        <input
          v-model="query"
          type="text"
          placeholder="Buscar por colonia, precio..."
          class="flex-1 bg-transparent text-sm text-[#1a1714] placeholder-[#a89f95] outline-none"
        />
      </form>

      <div class="hidden md:flex items-center gap-1">
        <button
          class="p-2 rounded-lg text-[#7a7067] hover:text-[#1a1714] hover:bg-[#ede8e2] transition-all duration-150"
        >
          <Heart :size="18" />
        </button>
        <a
          :href="WHATSAPP_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="p-2 rounded-lg text-[#25D366] hover:bg-[#ede8e2] transition-all duration-150"
          title="Contactar por WhatsApp"
        >
          <WhatsAppIcon :size="18" />
        </a>
        <div class="w-px h-5 bg-[#1a1714]/10 mx-1" />
        <template v-if="auth.isAuthenticated">
          <div class="flex items-center gap-2.5 pl-1">
            <div
              class="w-8 h-8 rounded-full bg-[#b8935a] flex items-center justify-center text-xs font-semibold text-white"
            >
              {{ auth.iniciales }}
            </div>
            <span class="text-sm text-[#1a1714] font-medium">{{ auth.nombreCorto }}</span>
          </div>
          <button
            class="ml-2 p-2 rounded-lg text-[#7a7067] hover:text-[#1a1714] hover:bg-[#ede8e2] transition-all duration-150"
            title="Cerrar sesión"
            @click="handleLogout"
          >
            <LogOut :size="16" />
          </button>
        </template>
        <button
          v-else
          class="ml-1 px-4 py-2 rounded-lg bg-[#1c2b47] text-[#f5f2ee] text-sm font-medium hover:bg-[#243559] transition-all duration-150"
          @click="router.push('/login')"
        >
          Iniciar sesión
        </button>
      </div>

      <button
        class="md:hidden p-2 rounded-lg text-[#7a7067] hover:bg-[#ede8e2] transition-all duration-150"
        @click="menuOpen = !menuOpen"
      >
        <X v-if="menuOpen" :size="20" />
        <Menu v-else :size="20" />
      </button>
    </div>

    <div
      v-if="menuOpen"
      class="md:hidden border-t border-[#1a1714]/8 bg-[#f5f2ee] px-4 py-4 flex flex-col gap-3"
    >
      <form
        class="flex items-center bg-[#ede8e2] rounded-lg px-3.5 py-2 gap-2"
        @submit.prevent="buscar"
      >
        <Search :size="14" class="text-[#a89f95]" />
        <input
          v-model="query"
          type="text"
          placeholder="Buscar..."
          class="flex-1 bg-transparent text-sm text-[#1a1714] placeholder-[#a89f95] outline-none"
        />
      </form>
      <div class="flex items-center justify-between pt-1">
        <template v-if="auth.isAuthenticated">
          <div class="flex items-center gap-2">
            <div
              class="w-8 h-8 rounded-full bg-[#b8935a] flex items-center justify-center text-xs font-semibold text-white"
            >
              {{ auth.iniciales }}
            </div>
            <span class="text-sm text-[#1a1714]">{{ auth.nombreCorto }}</span>
          </div>
          <button
            class="text-sm text-[#7a7067] flex items-center gap-1.5 hover:text-[#1a1714]"
            @click="handleLogout"
          >
            <LogOut :size="14" /> Salir
          </button>
        </template>
        <button v-else class="text-sm text-[#1a1714] font-medium" @click="router.push('/login')">
          Iniciar sesión
        </button>
      </div>
    </div>
  </nav>
</template>
