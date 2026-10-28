<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  Bell,
  CalendarCheck,
  Check,
  Heart,
  Home,
  Mail,
  MessageSquareQuote,
  Settings,
  Tag,
} from 'lucide-vue-next'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import { useNotificacionesStore } from '@/stores/notificaciones'
import type { Notificacion, TipoNotificacion } from '@/types/modulos'
import { haceCuanto } from '@/utils/formato'
import { SERIF } from '@/config'

const router = useRouter()
const store = useNotificacionesStore()
const filtro = ref<'todas' | 'no-leidas'>('todas')

onMounted(() => store.cargar('usuario'))

const ICONOS: Record<TipoNotificacion, unknown> = {
  publicacion: Home,
  cita: CalendarCheck,
  oferta: Tag,
  favorito: Heart,
  resena: MessageSquareQuote,
  sistema: Settings,
}

const lista = computed(() =>
  filtro.value === 'todas' ? store.items : store.items.filter((n) => !n.leida),
)

async function abrir(n: Notificacion) {
  await store.marcarLeida(n)
  if (n.enlace) router.push(n.enlace)
}
</script>

<template>
  <div class="min-h-screen bg-[#f5f2ee] font-['DM_Sans',sans-serif]">
    <AppNavbar />

    <main class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <button
        class="flex items-center gap-2 text-[#7a7067] hover:text-[#1a1714] text-sm mb-6 transition-colors duration-150"
        @click="router.push('/')"
      >
        <ArrowLeft :size="15" /> Volver a propiedades
      </button>

      <div class="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p class="text-[#a89f95] text-xs tracking-widest uppercase mb-2">Mi cuenta</p>
          <h1 class="text-[#1a1714] text-3xl" :style="SERIF">Notificaciones</h1>
        </div>
        <button
          v-if="store.noLeidas"
          class="flex items-center gap-1.5 text-sm text-[#7a7067] hover:text-[#1a1714] transition-colors"
          @click="store.marcarTodas()"
        >
          <Check :size="14" /> Marcar todas como leídas
        </button>
      </div>

      <div class="flex gap-1 mb-5">
        <button
          v-for="f in [
            { val: 'todas', label: 'Todas' },
            { val: 'no-leidas', label: `No leídas (${store.noLeidas})` },
          ] as const"
          :key="f.val"
          :class="[
            'px-4 py-1.5 rounded-sm text-xs font-medium transition-all',
            filtro === f.val
              ? 'bg-[#1c2b47] text-[#f5f2ee]'
              : 'text-[#7a7067] hover:bg-[#ede8e2] hover:text-[#1a1714]',
          ]"
          @click="filtro = f.val"
        >
          {{ f.label }}
        </button>
      </div>

      <div class="bg-white border border-[#1a1714]/8 rounded-md overflow-hidden">
        <p v-if="store.cargando" class="py-12 text-center text-sm text-[#a89f95]">Cargando…</p>
        <div v-else-if="!lista.length" class="py-16 flex flex-col items-center gap-2 text-center">
          <Bell :size="26" class="text-[#d8cfc3]" />
          <p class="text-[#7a7067] text-sm">
            No hay notificaciones {{ filtro === 'no-leidas' ? 'sin leer' : '' }}.
          </p>
        </div>
        <button
          v-for="n in lista"
          v-else
          :key="n.id"
          :class="[
            'w-full text-left flex gap-4 px-5 py-4 border-b border-[#1a1714]/6 last:border-b-0 transition-colors hover:bg-[#f5f2ee]',
            !n.leida && 'bg-[#fbf7f1]',
          ]"
          @click="abrir(n)"
        >
          <span
            class="w-10 h-10 rounded-full bg-[#ede8e2] text-[#7a7067] flex items-center justify-center shrink-0"
          >
            <component :is="ICONOS[n.tipo]" :size="16" />
          </span>
          <span class="flex-1 min-w-0">
            <span class="flex items-center gap-2">
              <span class="text-sm font-medium text-[#1a1714]">{{ n.titulo }}</span>
              <span v-if="!n.leida" class="w-2 h-2 rounded-full bg-[#b8935a]" />
            </span>
            <span class="block text-sm text-[#7a7067] mt-0.5 leading-relaxed">{{ n.mensaje }}</span>
            <span class="flex items-center gap-3 text-xs text-[#a89f95] mt-1.5">
              {{ haceCuanto(n.fecha) }}
              <span v-if="n.porCorreo" class="flex items-center gap-1"
                ><Mail :size="11" /> También por correo</span
              >
            </span>
          </span>
        </button>
      </div>
    </main>
  </div>
</template>
