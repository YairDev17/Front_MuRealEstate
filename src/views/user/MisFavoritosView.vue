<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Bell, BellOff, Bookmark, Heart, Search, Trash2 } from 'lucide-vue-next'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import PropertyCard from '@/components/propiedades/PropertyCard.vue'
import { propiedadesService } from '@/services/propiedades.service'
import { busquedasService } from '@/services/modulos.service'
import { useFavoritosStore } from '@/stores/favoritos'
import type { Propiedad } from '@/types/propiedad'
import type { BusquedaGuardada } from '@/types/modulos'
import { fechaCorta } from '@/utils/formato'
import { SERIF } from '@/config'

const router = useRouter()
const favoritos = useFavoritosStore()

const tab = ref<'favoritos' | 'busquedas'>('favoritos')
const propiedades = ref<Propiedad[]>([])
const busquedas = ref<BusquedaGuardada[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    ;[propiedades.value, busquedas.value] = await Promise.all([
      propiedadesService.listar(),
      busquedasService.listar(),
    ])
  } finally {
    loading.value = false
  }
})

// Se recalcula al quitar un favorito desde la tarjeta
const misFavoritos = computed(() => propiedades.value.filter((p) => favoritos.esFavorito(p.id)))

async function toggleAlertas(b: BusquedaGuardada) {
  const act = await busquedasService.actualizar(b.id, { alertas: !b.alertas })
  busquedas.value = busquedas.value.map((x) => (x.id === b.id ? act : x))
}

async function eliminar(b: BusquedaGuardada) {
  await busquedasService.eliminar(b.id)
  busquedas.value = busquedas.value.filter((x) => x.id !== b.id)
}

async function abrir(b: BusquedaGuardada) {
  if (b.nuevas) await busquedasService.actualizar(b.id, { nuevas: 0 })
  const { q, servicio, tipoInmueble } = b.filtros
  router.push({
    path: '/',
    query: { q, servicio, tipo: tipoInmueble ?? undefined },
    hash: '#propiedades',
  })
}

const chips = (b: BusquedaGuardada) =>
  [b.filtros.servicio, b.filtros.tipoInmueble, b.filtros.q && `“${b.filtros.q}”`].filter(Boolean)
</script>

<template>
  <div class="min-h-screen bg-[#f5f2ee] font-['DM_Sans',sans-serif]">
    <AppNavbar />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        class="flex items-center gap-2 text-[#7a7067] hover:text-[#1a1714] text-sm mb-6 transition-colors duration-150"
        @click="router.push('/')"
      >
        <ArrowLeft :size="15" /> Volver a propiedades
      </button>

      <p class="text-[#a89f95] text-xs tracking-widest uppercase mb-2">Mi cuenta</p>
      <h1 class="text-[#1a1714] text-3xl mb-6" :style="SERIF">Mis favoritos</h1>

      <div class="flex items-center gap-1 mb-8 border-b border-[#1a1714]/8">
        <button
          v-for="t in [
            {
              val: 'favoritos',
              label: 'Propiedades guardadas',
              icon: Heart,
              count: misFavoritos.length,
            },
            {
              val: 'busquedas',
              label: 'Búsquedas guardadas',
              icon: Bookmark,
              count: busquedas.length,
            },
          ] as const"
          :key="t.val"
          :class="[
            'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all duration-150',
            tab === t.val
              ? 'border-[#1c2b47] text-[#1a1714]'
              : 'border-transparent text-[#a89f95] hover:text-[#1a1714]',
          ]"
          @click="tab = t.val"
        >
          <component :is="t.icon" :size="14" /> {{ t.label }}
          <span class="bg-[#ede8e2] text-[#7a7067] text-[10px] px-1.5 py-0.5 rounded-full">{{
            t.count
          }}</span>
        </button>
      </div>

      <p v-if="loading" class="text-[#a89f95] text-sm py-12 text-center">Cargando…</p>

      <template v-else-if="tab === 'favoritos'">
        <div
          v-if="misFavoritos.length"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <PropertyCard v-for="p in misFavoritos" :key="p.id" :p="p" />
        </div>
        <div
          v-else
          class="bg-white border border-dashed border-[#1a1714]/12 rounded-md py-16 flex flex-col items-center gap-3 text-center"
        >
          <Heart :size="28" class="text-[#d8cfc3]" />
          <p class="text-[#1a1714]" :style="SERIF">Aún no tienes favoritos</p>
          <p class="text-[#a89f95] text-sm max-w-sm">
            Toca el corazón de cualquier propiedad para guardarla aquí.
          </p>
          <button
            class="mt-2 px-5 py-2.5 rounded-md bg-[#1c2b47] text-[#f5f2ee] text-sm font-medium hover:bg-[#243559] transition-all"
            @click="router.push('/')"
          >
            Explorar propiedades
          </button>
        </div>
      </template>

      <template v-else>
        <div v-if="busquedas.length" class="flex flex-col gap-3">
          <div
            v-for="b in busquedas"
            :key="b.id"
            class="bg-white border border-[#1a1714]/8 rounded-md p-5 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div
              class="w-10 h-10 rounded-full bg-[#ede8e2] flex items-center justify-center text-[#7a7067] shrink-0"
            >
              <Search :size="16" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <p class="text-[#1a1714] text-base" :style="SERIF">{{ b.nombre }}</p>
                <span
                  v-if="b.nuevas"
                  class="bg-[#b8935a] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full"
                >
                  {{ b.nuevas }} nuevas
                </span>
              </div>
              <div class="flex flex-wrap gap-1.5 mt-2">
                <span
                  v-for="c in chips(b)"
                  :key="String(c)"
                  class="bg-[#f5f2ee] text-[#7a7067] text-xs px-2.5 py-1 rounded-full"
                >
                  {{ c }}
                </span>
                <span class="text-[#a89f95] text-xs px-1 py-1"
                  >Guardada el {{ fechaCorta(b.creada) }}</span
                >
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button
                :class="[
                  'flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border transition-all',
                  b.alertas
                    ? 'bg-[#1c2b47] text-[#f5f2ee] border-[#1c2b47]'
                    : 'text-[#7a7067] border-[#1a1714]/12 hover:border-[#1a1714]/25',
                ]"
                :title="b.alertas ? 'Desactivar alertas' : 'Activar alertas'"
                @click="toggleAlertas(b)"
              >
                <Bell v-if="b.alertas" :size="13" />
                <BellOff v-else :size="13" />
                {{ b.alertas ? 'Alertas activas' : 'Sin alertas' }}
              </button>
              <button
                class="px-3 py-2 rounded-md text-xs font-medium bg-[#ede8e2] text-[#1a1714] hover:bg-[#e4ddd5] transition-all"
                @click="abrir(b)"
              >
                Ver resultados
              </button>
              <button
                class="p-2 rounded-md text-[#a89f95] hover:text-red-500 hover:bg-red-50 transition-all"
                title="Eliminar búsqueda"
                @click="eliminar(b)"
              >
                <Trash2 :size="14" />
              </button>
            </div>
          </div>
          <p class="text-[#a89f95] text-xs mt-2">
            Con las alertas activas te avisamos en la plataforma y por correo cuando haya inmuebles
            nuevos o con cambios.
          </p>
        </div>
        <div
          v-else
          class="bg-white border border-dashed border-[#1a1714]/12 rounded-md py-16 flex flex-col items-center gap-3 text-center"
        >
          <Bookmark :size="28" class="text-[#d8cfc3]" />
          <p class="text-[#1a1714]" :style="SERIF">No tienes búsquedas guardadas</p>
          <p class="text-[#a89f95] text-sm max-w-sm">
            Usa «Guardar búsqueda» en el buscador de inicio para recibir avisos.
          </p>
        </div>
      </template>
    </main>
  </div>
</template>
