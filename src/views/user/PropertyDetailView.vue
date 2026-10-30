<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  Bath,
  Bed,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Maximize2,
  Phone,
} from 'lucide-vue-next'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import StarRating from '@/components/ui/StarRating.vue'
import ReviewForm from '@/components/resenas/ReviewForm.vue'
import { resenasService } from '@/services/modulos.service'
import type { Resena } from '@/types/modulos'
import { fechaCorta } from '@/utils/formato'
import { propiedadesService } from '@/services/propiedades.service'
import { useFavoritosStore } from '@/stores/favoritos'
import type { Propiedad } from '@/types/propiedad'
import { SERIF, WHATSAPP_URL } from '@/config'

const props = defineProps<{ id: string }>()
const router = useRouter()
const favoritos = useFavoritosStore()

const propiedad = ref<Propiedad | null>(null)
const resenas = ref<Resena[]>([])
const promedio = computed(() =>
  resenas.value.length
    ? resenas.value.reduce((s, r) => s + r.calificacion, 0) / resenas.value.length
    : 0,
)
const loading = ref(true)
const imgIndex = ref(0)

const imgs = computed(() => propiedad.value?.imagenes ?? [])

watch(
  () => props.id,
  async (id) => {
    loading.value = true
    imgIndex.value = 0
    try {
      ;[propiedad.value, resenas.value] = await Promise.all([
        propiedadesService.obtener(Number(id)),
        resenasService.publicas(Number(id)),
      ])
    } catch {
      propiedad.value = null
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)

// Auto-rotación de fotos cada 5 s
let autoTimer: ReturnType<typeof setTimeout> | undefined
watch(
  [imgIndex, () => imgs.value.length],
  () => {
    clearTimeout(autoTimer)
    if (imgs.value.length <= 1) return
    autoTimer = setTimeout(() => (imgIndex.value = (imgIndex.value + 1) % imgs.value.length), 5000)
  },
  { immediate: true },
)
onBeforeUnmount(() => clearTimeout(autoTimer))

function goImg(dir: number) {
  imgIndex.value = (imgIndex.value + dir + imgs.value.length) % imgs.value.length
}

const stats = computed(() => {
  const p = propiedad.value
  if (!p) return []
  return [
    { icon: Bed, label: `${p.habitaciones} Habitaciones` },
    { icon: Bath, label: `${p.banos} Baños` },
    { icon: Maximize2, label: `${p.m2} m²` },
    { icon: Car, label: `${p.estacionamientos} Estac.` },
    { icon: CalendarDays, label: p.antiguedad },
  ]
})
</script>

<template>
  <div class="min-h-screen bg-[#f5f2ee] font-['DM_Sans',sans-serif]">
    <AppNavbar />

    <div v-if="loading" class="flex items-center justify-center h-[60vh]">
      <p class="text-[#a89f95] text-sm">Cargando propiedad…</p>
    </div>

    <div v-else-if="!propiedad" class="flex flex-col items-center justify-center h-[60vh] gap-4">
      <p class="text-[#7a7067] text-lg" :style="SERIF">Propiedad no encontrada.</p>
      <button
        class="text-sm text-[#1a1714] underline underline-offset-2"
        @click="router.push('/home')"
      >
        Volver al inicio
      </button>
    </div>

    <main v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        class="flex items-center gap-2 text-[#7a7067] hover:text-[#1a1714] text-sm mb-6 transition-colors duration-150"
        @click="router.push('/home')"
      >
        <ArrowLeft :size="15" /> Volver a propiedades
      </button>

      <div class="grid lg:grid-cols-[1fr_360px] gap-8 xl:gap-12">
        <!-- ── Left column ── -->
        <div>
          <!-- Image gallery -->
          <div class="relative rounded-2xl overflow-hidden bg-stone-800 aspect-[16/9] mb-3">
            <div
              v-for="(src, i) in imgs"
              :key="i"
              class="absolute inset-0 transition-opacity duration-1000"
              :style="{
                opacity: i === imgIndex ? 1 : 0,
                pointerEvents: i === imgIndex ? 'auto' : 'none',
              }"
            >
              <img
                :key="i === imgIndex ? `active-${imgIndex}` : `idle-${i}`"
                :src="src"
                :alt="`${propiedad.titulo} - foto ${i + 1}`"
                :class="[
                  'w-full h-full object-cover',
                  i === imgIndex ? `ken-burns kb-${i % 4}` : '',
                  // Con una sola foto no hay rotación: el movimiento sigue en vaivén.
                  imgs.length === 1 && 'kb-loop',
                ]"
              />
            </div>

            <button
              class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
              @click="favoritos.toggle(propiedad.id)"
            >
              <Heart
                :size="18"
                :class="
                  favoritos.esFavorito(propiedad.id) ? 'fill-red-400 text-red-400' : 'text-white'
                "
              />
            </button>

            <div class="absolute top-4 left-4 z-10">
              <span
                class="inline-block bg-[#b8935a] text-white text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full"
              >
                {{ propiedad.tipo === 'venta' ? 'En Venta' : 'En Renta' }}
              </span>
            </div>

            <template v-if="imgs.length > 1">
              <button
                class="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
                @click="goImg(-1)"
              >
                <ChevronLeft :size="18" class="text-white" />
              </button>
              <button
                class="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
                @click="goImg(1)"
              >
                <ChevronRight :size="18" class="text-white" />
              </button>
            </template>

            <div
              class="absolute bottom-0 inset-x-0 z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent pt-12 pb-4 px-5"
            >
              <p class="text-white/70 text-xs flex items-center gap-1 mb-1">
                <MapPin :size="11" /> {{ propiedad.ubicacion }}
              </p>
              <h1 class="text-white text-xl leading-snug" :style="SERIF">{{ propiedad.titulo }}</h1>
            </div>

            <div
              v-if="imgs.length > 1"
              class="absolute bottom-4 right-4 z-20 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full"
            >
              {{ imgIndex + 1 }} / {{ imgs.length }}
            </div>
          </div>

          <!-- Thumbnails: tres por fila como en el diseño; con menos fotos no se estiran -->
          <div :class="['flex gap-2', imgs.length > 1 ? 'mb-8' : 'mb-5']">
            <button
              v-for="(src, i) in imgs.length > 1 ? imgs : []"
              :key="i"
              :class="[
                'flex-1 max-w-[calc((100%-1rem)/3)] aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all duration-150',
                i === imgIndex
                  ? 'border-[#1c2b47]'
                  : 'border-transparent opacity-60 hover:opacity-80',
              ]"
              @click="imgIndex = i"
            >
              <img :src="src" alt="" class="w-full h-full object-cover" />
            </button>
          </div>

          <!-- Header info -->
          <div class="mb-6">
            <p class="text-[#a89f95] text-sm flex items-center gap-1.5 mb-2">
              <MapPin :size="13" /> {{ propiedad.ubicacion }}
            </p>
            <h1 class="text-[#1a1714] text-3xl lg:text-4xl leading-tight mb-4" :style="SERIF">
              {{ propiedad.titulo }}
            </h1>
            <div class="flex flex-wrap gap-4">
              <div
                v-for="s in stats"
                :key="s.label"
                class="flex items-center gap-2 bg-[#ede8e2] rounded-lg px-3.5 py-2 text-[#1a1714] text-sm"
              >
                <span class="text-[#a89f95]"><component :is="s.icon" :size="15" /></span>
                {{ s.label }}
              </div>
            </div>
          </div>

          <div class="h-px bg-[#1a1714]/8 mb-6" />

          <div class="mb-8">
            <h2 class="text-[#1a1714] text-xl mb-3" :style="SERIF">Descripción</h2>
            <p class="text-[#7a7067] text-sm leading-relaxed">{{ propiedad.descripcion }}</p>
          </div>

          <div>
            <h2 class="text-[#1a1714] text-xl mb-4" :style="SERIF">Características</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div
                v-for="c in propiedad.caracteristicas"
                :key="c"
                class="flex items-center gap-2.5 text-sm text-[#1a1714]"
              >
                <CheckCircle2 :size="14" class="text-[#b8935a] shrink-0" />
                {{ c }}
              </div>
            </div>
          </div>

          <!-- Reseñas -->
          <div class="mt-10">
            <div class="flex items-end justify-between gap-4 mb-4 flex-wrap">
              <h2 class="text-[#1a1714] text-xl" :style="SERIF">Reseñas</h2>
              <div v-if="resenas.length" class="flex items-center gap-2 text-sm text-[#7a7067]">
                <StarRating :model-value="Math.round(promedio)" readonly :size="14" />
                <span class="font-medium text-[#1a1714]">{{ promedio.toFixed(1) }}</span>
                <span
                  >· {{ resenas.length }} {{ resenas.length === 1 ? 'reseña' : 'reseñas' }}</span
                >
              </div>
            </div>
            <div class="flex flex-col gap-3 mb-4">
              <div
                v-for="r in resenas"
                :key="r.id"
                class="bg-[#fdfaf7] border border-[#1a1714]/6 rounded-md p-5"
              >
                <div class="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <p class="text-[#1a1714] text-sm font-medium">{{ r.autor }}</p>
                    <p class="text-[#a89f95] text-xs">{{ r.perfil }} · {{ fechaCorta(r.fecha) }}</p>
                  </div>
                  <StarRating :model-value="r.calificacion" readonly :size="12" />
                </div>
                <p class="text-[#4a4540] text-sm leading-relaxed">{{ r.comentario }}</p>
              </div>
              <p v-if="!resenas.length" class="text-[#a89f95] text-sm">
                Aún no hay reseñas de esta propiedad.
              </p>
            </div>
            <ReviewForm :propiedad-id="propiedad.id" :propiedad="propiedad.titulo" />
          </div>
        </div>

        <!-- ── Right column — contact card ── -->
        <div class="lg:sticky lg:top-24 h-fit">
          <div class="bg-[#fdfaf7] rounded-2xl border border-[#1c2b47]/8 p-6">
            <div class="mb-6">
              <p class="text-[#a89f95] text-xs tracking-wider uppercase mb-1">
                {{ propiedad.tipo === 'venta' ? 'Precio de venta' : 'Renta mensual' }}
              </p>
              <p class="text-[#1a1714] text-3xl" :style="SERIF">{{ propiedad.precio }}</p>
            </div>

            <div class="h-px bg-[#1a1714]/8 mb-6" />

            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-11 h-11 rounded-full bg-[#b8935a] flex items-center justify-center text-xs font-semibold text-white shrink-0 tracking-wide"
              >
                CA
              </div>
              <div>
                <p class="text-[#1a1714] text-sm font-medium">CANO & Asociados</p>
                <p class="text-[#a89f95] text-xs">Asesor inmobiliario · {{ propiedad.colonia }}</p>
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <a
                :href="WHATSAPP_URL"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full bg-[#1c2b47] text-[#f5f2ee] rounded-xl py-3.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#243559] transition-all duration-200 active:scale-[0.99]"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
                  />
                  <path
                    d="M12 0C5.373 0 0 5.373 0 12c0 2.128.558 4.122 1.533 5.852L.057 23.57a.5.5 0 0 0 .613.614l5.765-1.476A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.87 9.87 0 0 1-5.046-1.383l-.361-.215-3.742.958.976-3.636-.236-.374A9.836 9.836 0 0 1 2.118 12C2.118 6.52 6.52 2.118 12 2.118S21.882 6.52 21.882 12 17.48 21.882 12 21.882z"
                  />
                </svg>
                Chatea con nosotros
              </a>
              <button
                class="w-full bg-[#ede8e2] text-[#1a1714] rounded-xl py-3.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#e4ddd5] transition-all duration-200"
              >
                <Phone :size="15" />
                Llamar ahora
              </button>
            </div>

            <p class="text-[#a89f95] text-xs text-center mt-4 leading-relaxed">
              Respuesta habitual en menos de 2 horas en días hábiles.
            </p>
          </div>

          <div
            class="mt-4 rounded-2xl overflow-hidden border border-[#1c2b47]/8 aspect-[4/3] bg-[#ede8e2] flex flex-col items-center justify-center gap-2"
          >
            <MapPin :size="20" class="text-[#a89f95]" />
            <p class="text-[#a89f95] text-xs">{{ propiedad.ubicacion }}</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.ken-burns {
  will-change: transform;
}
.kb-0 {
  animation: kbd0 5s ease-out forwards;
}
.kb-1 {
  animation: kbd1 5s ease-out forwards;
}
.kb-2 {
  animation: kbd2 5s ease-out forwards;
}
.kb-3 {
  animation: kbd3 5s ease-out forwards;
}
.kb-loop {
  animation-duration: 8s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}
@keyframes kbd0 {
  0% {
    transform: scale(1) translate(0%, 0%);
  }
  100% {
    transform: scale(1.08) translate(-1.5%, -1%);
  }
}
@keyframes kbd1 {
  0% {
    transform: scale(1.06) translate(-2%, 0%);
  }
  100% {
    transform: scale(1) translate(1%, 1%);
  }
}
@keyframes kbd2 {
  0% {
    transform: scale(1) translate(1%, 1%);
  }
  100% {
    transform: scale(1.07) translate(-1%, -1.5%);
  }
}
@keyframes kbd3 {
  0% {
    transform: scale(1.05) translate(0%, -1%);
  }
  100% {
    transform: scale(1) translate(1.5%, 0.5%);
  }
}
</style>
