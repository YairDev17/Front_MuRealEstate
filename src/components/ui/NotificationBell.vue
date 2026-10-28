<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Bell,
  CalendarCheck,
  Check,
  Heart,
  Home,
  MessageSquareQuote,
  Settings,
  Tag,
} from 'lucide-vue-next'
import { useNotificacionesStore } from '@/stores/notificaciones'
import type { DestinatarioNotificacion, Notificacion, TipoNotificacion } from '@/types/modulos'
import { haceCuanto } from '@/utils/formato'

const props = withDefaults(
  defineProps<{ para: DestinatarioNotificacion; variant?: 'light' | 'dark' }>(),
  {
    variant: 'light',
  },
)

const router = useRouter()
const store = useNotificacionesStore()
const open = ref(false)

onMounted(() => store.cargar(props.para))

const ICONOS: Record<TipoNotificacion, unknown> = {
  publicacion: Home,
  cita: CalendarCheck,
  oferta: Tag,
  favorito: Heart,
  resena: MessageSquareQuote,
  sistema: Settings,
}

async function abrir(n: Notificacion) {
  await store.marcarLeida(n)
  open.value = false
  if (n.enlace) router.push(n.enlace)
}

const dark = props.variant === 'dark'
</script>

<template>
  <div class="relative">
    <button
      :class="[
        'relative p-2 rounded-lg transition-all duration-150',
        dark
          ? 'text-white/30 hover:text-white/60 hover:bg-white/5'
          : 'text-[#7a7067] hover:text-[#1a1714] hover:bg-[#ede8e2]',
      ]"
      title="Notificaciones"
      @click="open = !open"
    >
      <Bell :size="dark ? 15 : 18" />
      <span
        v-if="store.noLeidas"
        class="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-[#b8935a] text-white text-[9px] font-semibold flex items-center justify-center"
      >
        {{ store.noLeidas }}
      </span>
    </button>

    <div v-if="open" class="fixed inset-0 z-40" @click="open = false" />
    <div
      v-if="open"
      :class="[
        'absolute right-0 top-full mt-2 z-50 w-80 rounded-xl shadow-2xl overflow-hidden border',
        dark ? 'bg-[#1a1a18] border-white/10' : 'bg-white border-[#1a1714]/10',
      ]"
    >
      <div
        :class="[
          'flex items-center justify-between px-4 py-3 border-b',
          dark ? 'border-white/6' : 'border-[#1a1714]/8',
        ]"
      >
        <p :class="['text-sm font-medium', dark ? 'text-white/80' : 'text-[#1a1714]']">
          Notificaciones
        </p>
        <button
          v-if="store.noLeidas"
          :class="[
            'flex items-center gap-1 text-xs',
            dark ? 'text-white/40 hover:text-white/70' : 'text-[#7a7067] hover:text-[#1a1714]',
          ]"
          @click="store.marcarTodas()"
        >
          <Check :size="11" /> Marcar todas
        </button>
      </div>
      <div class="max-h-96 overflow-y-auto">
        <p
          v-if="!store.items.length"
          :class="['px-4 py-8 text-center text-xs', dark ? 'text-white/25' : 'text-[#a89f95]']"
        >
          Sin notificaciones
        </p>
        <button
          v-for="n in store.items.slice(0, 6)"
          :key="n.id"
          :class="[
            'w-full text-left flex gap-3 px-4 py-3 transition-colors border-b last:border-b-0',
            dark ? 'border-white/4 hover:bg-white/4' : 'border-[#1a1714]/5 hover:bg-[#f5f2ee]',
            !n.leida && (dark ? 'bg-white/3' : 'bg-[#fbf7f1]'),
          ]"
          @click="abrir(n)"
        >
          <span
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
              dark ? 'bg-white/8 text-white/50' : 'bg-[#ede8e2] text-[#7a7067]',
            ]"
          >
            <component :is="ICONOS[n.tipo]" :size="13" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="flex items-center gap-1.5">
              <span
                :class="['text-xs font-medium truncate', dark ? 'text-white/80' : 'text-[#1a1714]']"
                >{{ n.titulo }}</span
              >
              <span v-if="!n.leida" class="w-1.5 h-1.5 rounded-full bg-[#b8935a] shrink-0" />
            </span>
            <span
              :class="[
                'block text-[11px] leading-snug mt-0.5 line-clamp-2',
                dark ? 'text-white/40' : 'text-[#7a7067]',
              ]"
            >
              {{ n.mensaje }}
            </span>
            <span :class="['block text-[10px] mt-1', dark ? 'text-white/20' : 'text-[#a89f95]']">{{
              haceCuanto(n.fecha)
            }}</span>
          </span>
        </button>
      </div>
      <button
        v-if="para === 'usuario'"
        class="w-full py-2.5 text-xs font-medium text-[#1c2b47] bg-[#f5f2ee] hover:bg-[#ede8e2] transition-colors"
        @click="((open = false), router.push('/notificaciones'))"
      >
        Ver todas
      </button>
    </div>
  </div>
</template>
