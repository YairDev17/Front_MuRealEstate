<script setup lang="ts">
import { ref } from 'vue'
import { Bookmark, BookmarkCheck, ChevronDown, Search, X } from 'lucide-vue-next'

export type Servicio =
  'Compra' | 'Venta' | 'Renta' | 'Administración' | 'Construcción' | 'Remodelación'
export type TipoInmueble = 'Terrenos' | 'Casas' | 'Departamentos'

export interface BusquedaHome {
  q: string
  servicio: Servicio
  tipoInmueble: TipoInmueble | null
}

const SERVICIOS: Servicio[] = [
  'Compra',
  'Venta',
  'Renta',
  'Administración',
  'Construcción',
  'Remodelación',
]
const TIPOS_INMUEBLE: TipoInmueble[] = ['Terrenos', 'Casas', 'Departamentos']

const props = defineProps<{ initial?: Partial<BusquedaHome>; guardada?: boolean }>()
const emit = defineEmits<{ buscar: [BusquedaHome]; guardar: [BusquedaHome] }>()

const servicio = ref<Servicio>(props.initial?.servicio ?? 'Compra')
const tipoInmueble = ref<TipoInmueble | null>(props.initial?.tipoInmueble ?? null)
const query = ref(props.initial?.q ?? '')
const actual = (): BusquedaHome => ({
  q: query.value,
  servicio: servicio.value,
  tipoInmueble: tipoInmueble.value,
})
const showTipoMenu = ref(false)

const buscar = () => emit('buscar', actual())

function setTipo(t: TipoInmueble | null) {
  tipoInmueble.value = t
  showTipoMenu.value = false
  buscar()
}

function setServicio(s: Servicio) {
  servicio.value = s
  buscar()
}
</script>

<template>
  <div class="bg-[#f5f2ee] border-b border-[#1a1714]/8 pb-5">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
      <form class="flex flex-col sm:flex-row items-stretch gap-2 mb-4" @submit.prevent="buscar">
        <!-- Tipo de inmueble dropdown -->
        <div class="relative sm:shrink-0">
          <button
            type="button"
            class="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 bg-white border border-[#1a1714]/12 rounded-md px-4 py-3 text-sm text-[#1a1714] font-medium hover:border-[#1a1714]/25 transition-all whitespace-nowrap"
            @click="showTipoMenu = !showTipoMenu"
          >
            {{ tipoInmueble ?? 'Tipo de inmueble' }}
            <ChevronDown
              :size="14"
              :class="[
                'text-[#a89f95] transition-transform duration-200',
                showTipoMenu ? 'rotate-180' : '',
              ]"
            />
          </button>
          <div
            v-if="showTipoMenu"
            class="absolute top-full left-0 mt-1 bg-white border border-[#1a1714]/10 rounded-md shadow-lg z-40 min-w-[160px] py-1 overflow-hidden"
          >
            <button
              v-if="tipoInmueble"
              type="button"
              class="w-full text-left px-4 py-2.5 text-sm text-[#a89f95] hover:bg-[#f5f2ee] hover:text-[#1a1714] transition-colors flex items-center gap-1.5"
              @click="setTipo(null)"
            >
              <X :size="10" /> Todos los tipos
            </button>
            <button
              v-for="t in TIPOS_INMUEBLE"
              :key="t"
              type="button"
              :class="[
                'w-full text-left px-4 py-2.5 text-sm transition-colors',
                tipoInmueble === t
                  ? 'bg-[#f5f2ee] text-[#1a1714] font-medium'
                  : 'text-[#7a7067] hover:bg-[#f5f2ee] hover:text-[#1a1714]',
              ]"
              @click="setTipo(t)"
            >
              {{ t }}
            </button>
          </div>
        </div>

        <div
          class="flex-1 flex items-center bg-white border border-[#1a1714]/12 rounded-md px-4 gap-2.5 hover:border-[#1a1714]/25 transition-all focus-within:border-[#1a1714]/30"
        >
          <Search :size="15" class="text-[#a89f95] shrink-0" />
          <input
            v-model="query"
            type="text"
            placeholder="Buscar en colonia, zona o dirección…"
            class="flex-1 py-3 min-w-0 bg-transparent text-sm text-[#1a1714] placeholder-[#a89f95] outline-none"
          />
        </div>

        <button
          type="submit"
          class="sm:shrink-0 flex items-center justify-center gap-2 bg-[#1c2b47] text-[#f5f2ee] rounded-md px-6 py-3 text-sm font-medium hover:bg-[#243559] active:scale-[0.98] transition-all duration-150"
        >
          <Search :size="14" />
          <span>Buscar</span>
        </button>
      </form>

      <!-- Service tabs -->
      <div class="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
        <button
          v-for="s in SERVICIOS"
          :key="s"
          :class="[
            'shrink-0 px-4 py-1.5 rounded-sm text-xs font-medium transition-all duration-150 whitespace-nowrap',
            servicio === s
              ? 'bg-[#1c2b47] text-[#f5f2ee]'
              : 'text-[#7a7067] hover:text-[#1a1714] hover:bg-[#ede8e2]',
          ]"
          @click="setServicio(s)"
        >
          {{ s }}
        </button>
        <template v-if="tipoInmueble">
          <div class="w-px h-4 bg-[#1a1714]/10 mx-2 shrink-0" />
          <span
            class="shrink-0 inline-flex items-center gap-1.5 bg-[#ede8e2] text-[#1a1714] text-xs px-2.5 py-1.5 rounded-sm"
          >
            {{ tipoInmueble }}
            <button class="hover:text-[#b8935a] transition-colors" @click="setTipo(null)">
              <X :size="10" />
            </button>
          </span>
        </template>
        <button
          :class="[
            'ml-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-all duration-150 whitespace-nowrap',
            guardada ? 'text-[#b8935a]' : 'text-[#7a7067] hover:text-[#1a1714] hover:bg-[#ede8e2]',
          ]"
          :disabled="guardada"
          @click="emit('guardar', actual())"
        >
          <BookmarkCheck v-if="guardada" :size="13" />
          <Bookmark v-else :size="13" />
          {{ guardada ? 'Búsqueda guardada' : 'Guardar búsqueda' }}
        </button>
      </div>
    </div>
  </div>
</template>
