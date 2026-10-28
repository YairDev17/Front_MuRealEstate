<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { CheckCircle2, Clock, Home, MessageSquareQuote, Star, XCircle } from 'lucide-vue-next'
import AdminTopBar from '@/components/admin/AdminTopBar.vue'
import AdminLogoutActions from '@/components/admin/AdminLogoutActions.vue'
import MotivoModal from '@/components/admin/MotivoModal.vue'
import StarRating from '@/components/ui/StarRating.vue'
import { resenasService } from '@/services/modulos.service'
import type { EstadoResena, Resena } from '@/types/modulos'
import { fechaCorta } from '@/utils/formato'
import { SERIF } from '@/config'

const ESTADO: Record<EstadoResena, { label: string; color: string; bg: string }> = {
  pendiente: {
    label: 'Pendiente',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/20',
  },
  aprobada: {
    label: 'Publicada',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
  },
  rechazada: { label: 'Rechazada', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
}

const SUGERENCIAS = [
  'Contiene datos de contacto o publicidad.',
  'Lenguaje ofensivo o inapropiado.',
  'Sin información útil para otros usuarios.',
  'No corresponde a una operación real con MU Real Estate.',
]

const resenas = ref<Resena[]>([])
const filtro = ref<EstadoResena>('pendiente')
const rechazando = ref<Resena | null>(null)

onMounted(async () => {
  resenas.value = (await resenasService.listarTodas()).sort((a, b) =>
    b.fecha.localeCompare(a.fecha),
  )
})

const lista = computed(() => resenas.value.filter((r) => r.estado === filtro.value))
const contar = (e: EstadoResena) => resenas.value.filter((r) => r.estado === e).length
const publicadas = computed(() => resenas.value.filter((r) => r.estado === 'aprobada'))
const promedio = computed(() =>
  publicadas.value.length
    ? publicadas.value.reduce((s, r) => s + r.calificacion, 0) / publicadas.value.length
    : 0,
)

const stats = computed(() => [
  { label: 'Pendientes', value: contar('pendiente'), color: 'text-amber-400', icon: Clock },
  { label: 'Publicadas', value: contar('aprobada'), color: 'text-emerald-400', icon: CheckCircle2 },
  { label: 'Rechazadas', value: contar('rechazada'), color: 'text-red-400', icon: XCircle },
  {
    label: 'Calificación promedio',
    value: promedio.value.toFixed(1),
    color: 'text-[#b8935a]',
    icon: Star,
  },
])

function reemplazar(r: Resena) {
  resenas.value = resenas.value.map((x) => (x.id === r.id ? r : x))
}

async function aprobar(r: Resena) {
  reemplazar(await resenasService.aprobar(r))
}

async function confirmarRechazo(motivo: string) {
  if (!rechazando.value) return
  reemplazar(await resenasService.rechazar(rechazando.value, motivo))
  rechazando.value = null
}
</script>

<template>
  <div class="min-h-screen bg-[#0d0d0c] font-['DM_Sans',sans-serif]">
    <MotivoModal
      v-if="rechazando"
      titulo="Rechazar reseña"
      :descripcion="`La reseña de ${rechazando.autor} no se publicará. Indica el motivo para el registro de moderación.`"
      :sugerencias="SUGERENCIAS"
      @close="rechazando = null"
      @confirm="confirmarRechazo"
    />

    <AdminTopBar section="Reseñas y calificaciones" wide>
      <template #actions><AdminLogoutActions /></template>
    </AdminTopBar>

    <div class="max-w-screen-2xl mx-auto px-5 py-7">
      <div class="mb-6">
        <h1 class="text-white text-2xl mb-1" :style="SERIF">Moderación de reseñas</h1>
        <p class="text-white/30 text-sm">
          Revisa las opiniones de los clientes antes de publicarlas en el sitio.
        </p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div
          v-for="s in stats"
          :key="s.label"
          class="bg-white/3 border border-white/6 rounded-xl px-4 py-4"
        >
          <div :class="['flex items-center gap-2 mb-2', s.color]">
            <component :is="s.icon" :size="13" /><span class="text-xs opacity-80">{{
              s.label
            }}</span>
          </div>
          <p class="text-white text-2xl font-medium" :style="SERIF">{{ s.value }}</p>
        </div>
      </div>

      <div class="flex items-center gap-1 mb-6 border-b border-white/6 pb-0 overflow-x-auto">
        <button
          v-for="e in ['pendiente', 'aprobada', 'rechazada'] as const"
          :key="e"
          :class="[
            'shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-150 -mb-px',
            filtro === e
              ? 'border-white/60 text-white/80'
              : 'border-transparent text-white/30 hover:text-white/50 hover:border-white/20',
          ]"
          @click="filtro = e"
        >
          {{ ESTADO[e].label }}s
          <span
            :class="[
              'text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none',
              e === 'pendiente' && contar(e)
                ? 'bg-amber-400 text-black'
                : 'bg-white/8 text-white/40',
            ]"
          >
            {{ contar(e) }}
          </span>
        </button>
      </div>

      <div
        v-if="!lista.length"
        class="border border-dashed border-white/8 rounded-xl py-16 flex flex-col items-center gap-2"
      >
        <MessageSquareQuote :size="20" class="text-white/15" />
        <p class="text-white/20 text-sm">No hay reseñas en esta sección.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div
          v-for="r in lista"
          :key="r.id"
          class="bg-white/4 border border-white/8 rounded-xl p-5 flex flex-col gap-4 hover:border-white/14 transition-all"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60 font-medium shrink-0"
              >
                {{
                  r.autor
                    .split(' ')
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                }}
              </div>
              <div class="min-w-0">
                <p class="text-white/80 text-sm font-medium truncate">{{ r.autor }}</p>
                <p class="text-white/30 text-xs truncate">
                  {{ r.perfil }} · {{ fechaCorta(r.fecha) }}
                </p>
              </div>
            </div>
            <span
              :class="[
                'shrink-0 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border',
                ESTADO[r.estado].bg,
                ESTADO[r.estado].color,
              ]"
            >
              {{ ESTADO[r.estado].label }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-2">
            <StarRating :model-value="r.calificacion" readonly :size="14" />
            <span class="flex items-center gap-1 text-[11px] text-white/30 truncate">
              <Home :size="10" /> {{ r.propiedad ?? 'Servicio en general' }}
            </span>
          </div>

          <p class="text-white/55 text-sm leading-relaxed flex-1">"{{ r.comentario }}"</p>

          <p v-if="r.motivoRechazo" class="text-[11px] text-white/35 leading-snug">
            <span class="text-white/50">Motivo:</span> {{ r.motivoRechazo }}
          </p>

          <div v-if="r.estado === 'pendiente'" class="flex gap-2">
            <button
              class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-medium hover:bg-emerald-400/20 transition-all"
              @click="aprobar(r)"
            >
              <CheckCircle2 :size="12" /> Publicar
            </button>
            <button
              class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-medium hover:bg-red-400/20 transition-all"
              @click="rechazando = r"
            >
              <XCircle :size="12" /> Rechazar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
