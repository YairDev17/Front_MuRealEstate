<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Search,
  X,
  XCircle,
} from 'lucide-vue-next'
import AdminTopBar from '@/components/admin/AdminTopBar.vue'
import MiniCalendar from '@/components/admin/agenda/MiniCalendar.vue'
import VisitaCard from '@/components/admin/agenda/VisitaCard.vue'
import VisitaModal from '@/components/admin/agenda/VisitaModal.vue'
import {
  ASESORES,
  ESTADO_VISITA,
  ESTADOS_VISITA,
  formatDateLabel,
  toYMD,
} from '@/components/admin/agenda/agenda'
import { iniciales } from '@/components/admin/estadoPropiedad'
import { adminVisitasService } from '@/services/admin.service'
import type { EstadoVisita, Visita } from '@/types/admin'
import { SERIF } from '@/config'

const visitas = ref<Visita[]>([])
const search = ref('')
const filtroEstado = ref<EstadoVisita | 'todas'>('todas')
const filtroAsesor = ref('Todos')
const selectedDate = ref<string | null>(null)
const modalOpen = ref(false)
const editTarget = ref<Visita | undefined>()

onMounted(async () => {
  visitas.value = await adminVisitasService.listar()
})

async function handleSave(data: Omit<Visita, 'id'>) {
  if (editTarget.value) {
    const id = editTarget.value.id
    const actualizada = await adminVisitasService.actualizar(id, data)
    visitas.value = visitas.value.map((v) => (v.id === id ? actualizada : v))
  } else {
    visitas.value = [...visitas.value, await adminVisitasService.crear(data)]
  }
  cerrarModal()
}

async function handleDelete(id: number) {
  await adminVisitasService.eliminar(id)
  visitas.value = visitas.value.filter((v) => v.id !== id)
}

async function handleStatus(id: number, estado: EstadoVisita) {
  const actualizada = await adminVisitasService.actualizar(id, { estado })
  visitas.value = visitas.value.map((v) => (v.id === id ? actualizada : v))
}

function openEdit(v: Visita) {
  editTarget.value = v
  modalOpen.value = true
}
function openNew() {
  editTarget.value = undefined
  modalOpen.value = true
}
function cerrarModal() {
  modalOpen.value = false
  editTarget.value = undefined
}

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return visitas.value.filter(
    (v) =>
      (!q || [v.propiedad, v.interesado, v.asesor].some((s) => s.toLowerCase().includes(q))) &&
      (filtroEstado.value === 'todas' || v.estado === filtroEstado.value) &&
      (filtroAsesor.value === 'Todos' || v.asesor === filtroAsesor.value) &&
      (!selectedDate.value || v.fecha === selectedDate.value),
  )
})

const sortedDates = computed(() => [...new Set(filtered.value.map((v) => v.fecha))].sort())
const groupedByDate = computed(() => {
  const acc: Record<string, Visita[]> = {}
  for (const date of sortedDates.value) {
    acc[date] = filtered.value
      .filter((v) => v.fecha === date)
      .sort((a, b) => a.hora.localeCompare(b.hora))
  }
  return acc
})

const today = toYMD(new Date())
const stats = computed(() => [
  {
    label: 'Hoy',
    value: visitas.value.filter((v) => v.fecha === today).length,
    color: 'text-white/60',
    icon: CalendarDays,
  },
  {
    label: 'Próximas',
    value: visitas.value.filter(
      (v) => v.fecha > today && (v.estado === 'programada' || v.estado === 'confirmada'),
    ).length,
    color: 'text-sky-400',
    icon: Clock,
  },
  {
    label: 'Confirmadas',
    value: visitas.value.filter((v) => v.estado === 'confirmada').length,
    color: 'text-emerald-400',
    icon: CheckCircle2,
  },
  {
    label: 'Canceladas',
    value: visitas.value.filter((v) => v.estado === 'cancelada').length,
    color: 'text-red-400',
    icon: XCircle,
  },
])

const filtrosEstado = ['todas', ...ESTADOS_VISITA] as const
const asesores = ['Todos', ...ASESORES]
const contarEstado = (s: EstadoVisita | 'todas') =>
  s === 'todas' ? visitas.value.length : visitas.value.filter((v) => v.estado === s).length
const contarAsesor = (a: string) =>
  a === 'Todos' ? visitas.value.length : visitas.value.filter((v) => v.asesor === a).length
const filtroCls = (active: boolean) => [
  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all duration-150',
  active ? 'bg-white/8 text-white/70' : 'text-white/30 hover:bg-white/5 hover:text-white/50',
]
</script>

<template>
  <div class="min-h-screen bg-[#0d0d0c] font-['DM_Sans',sans-serif]">
    <AdminTopBar section="Agenda de Visitas" wide back-label="Panel" />

    <div class="max-w-screen-2xl mx-auto px-5 py-7">
      <div class="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <CalendarCheck :size="20" class="text-[#b8935a]" />
            <h1 class="text-white text-2xl" :style="SERIF">Agenda de Visitas</h1>
          </div>
          <p class="text-white/30 text-sm ml-8">
            Gestión de citas con interesados, asesores y propiedades.
          </p>
        </div>
        <button
          class="flex items-center gap-2 bg-[#b8935a] text-[#0d0d0c] text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#c9a46b] transition-all"
          @click="openNew"
        >
          <Plus :size="15" /> Nueva visita
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        <div
          v-for="s in stats"
          :key="s.label"
          class="bg-white/3 border border-white/6 rounded-xl px-4 py-4"
        >
          <div :class="['flex items-center gap-2 mb-2', s.color]">
            <component :is="s.icon" :size="14" />
            <span class="text-xs tracking-wide opacity-80">{{ s.label }}</span>
          </div>
          <p class="text-white text-2xl font-medium" :style="SERIF">{{ s.value }}</p>
        </div>
      </div>

      <div class="flex gap-6 items-start">
        <!-- Sidebar -->
        <div class="w-64 shrink-0 space-y-4 hidden lg:block">
          <MiniCalendar v-model="selectedDate" :visitas="visitas" />

          <div class="bg-white/3 border border-white/6 rounded-2xl p-4 space-y-1">
            <p class="text-white/25 text-[9px] font-semibold tracking-widest uppercase mb-3">
              Estado
            </p>
            <button
              v-for="s in filtrosEstado"
              :key="s"
              :class="filtroCls(filtroEstado === s)"
              @click="filtroEstado = s"
            >
              <span class="flex items-center gap-2">
                <span
                  v-if="s !== 'todas'"
                  :class="['w-1.5 h-1.5 rounded-full', ESTADO_VISITA[s].dot]"
                />
                {{ s === 'todas' ? 'Todas' : ESTADO_VISITA[s].label }}
              </span>
              <span class="bg-white/6 px-1.5 py-0.5 rounded-full text-[10px] text-white/25">{{
                contarEstado(s)
              }}</span>
            </button>
          </div>

          <div class="bg-white/3 border border-white/6 rounded-2xl p-4 space-y-1">
            <p class="text-white/25 text-[9px] font-semibold tracking-widest uppercase mb-3">
              Asesor
            </p>
            <button
              v-for="a in asesores"
              :key="a"
              :class="filtroCls(filtroAsesor === a)"
              @click="filtroAsesor = a"
            >
              <span class="flex items-center gap-2">
                <div
                  class="w-4 h-4 rounded-full bg-white/8 flex items-center justify-center text-[8px] text-white/40"
                >
                  {{ a === 'Todos' ? 'T' : iniciales(a) }}
                </div>
                {{ a }}
              </span>
              <span class="bg-white/6 px-1.5 py-0.5 rounded-full text-[10px] text-white/25">{{
                contarAsesor(a)
              }}</span>
            </button>
          </div>
        </div>

        <!-- Main list -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-3 mb-5 flex-wrap">
            <div
              class="flex items-center bg-white/5 border border-white/8 rounded-lg px-3 py-2 gap-2 flex-1 min-w-40"
            >
              <Search :size="13" class="text-white/20 shrink-0" />
              <input
                v-model="search"
                type="text"
                placeholder="Buscar propiedad, cliente o asesor..."
                class="flex-1 bg-transparent text-xs text-white placeholder-white/20 outline-none"
              />
              <button
                v-if="search"
                class="text-white/20 hover:text-white/50 transition-colors"
                @click="search = ''"
              >
                <X :size="12" />
              </button>
            </div>
            <button
              v-if="selectedDate"
              class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#b8935a]/10 border border-[#b8935a]/20 text-[#b8935a] text-xs hover:bg-[#b8935a]/15 transition-all"
              @click="selectedDate = null"
            >
              <CalendarDays :size="11" />
              {{ formatDateLabel(selectedDate) }}
              <X :size="10" />
            </button>
            <div class="flex items-center gap-1 text-white/20 text-xs">
              <Filter :size="11" />
              <span>{{ filtered.length }} visita{{ filtered.length !== 1 ? 's' : '' }}</span>
            </div>
          </div>

          <div
            v-if="!sortedDates.length"
            class="flex flex-col items-center justify-center py-20 text-center"
          >
            <CalendarDays :size="36" class="text-white/10 mb-4" />
            <p class="text-white/30 text-sm">No hay visitas que coincidan con los filtros.</p>
            <button
              class="mt-4 flex items-center gap-1.5 text-[#b8935a]/60 text-xs hover:text-[#b8935a] transition-colors"
              @click="openNew"
            >
              <Plus :size="12" /> Crear primera visita
            </button>
          </div>

          <template v-else>
            <div v-for="date in sortedDates" :key="date" class="mb-7">
              <div class="flex items-center gap-3 mb-3">
                <div
                  :class="[
                    'flex items-center gap-2',
                    date === today
                      ? 'text-[#b8935a]'
                      : date < today
                        ? 'text-white/20'
                        : 'text-white/50',
                  ]"
                >
                  <CalendarDays :size="13" />
                  <span class="text-sm font-medium" :style="SERIF"
                    >{{ date === today ? 'Hoy — ' : '' }}{{ formatDateLabel(date) }}</span
                  >
                </div>
                <div class="flex-1 h-px bg-white/6" />
                <span class="text-white/20 text-xs">
                  {{ groupedByDate[date]?.length }} visita{{
                    groupedByDate[date]?.length !== 1 ? 's' : ''
                  }}
                </span>
              </div>
              <div class="space-y-2.5">
                <VisitaCard
                  v-for="v in groupedByDate[date]"
                  :key="v.id"
                  :v="v"
                  @edit="openEdit(v)"
                  @delete="handleDelete(v.id)"
                  @status="handleStatus(v.id, $event)"
                />
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="max-w-screen-2xl mx-auto px-5 pb-8">
      <div class="flex items-center gap-5 flex-wrap">
        <span class="text-white/15 text-[10px] font-semibold tracking-widest uppercase"
          >Leyenda</span
        >
        <span
          v-for="(cfg, key) in ESTADO_VISITA"
          :key="key"
          class="flex items-center gap-1.5 text-xs text-white/25"
        >
          <span :class="['w-2 h-2 rounded-full', cfg.dot]" /> {{ cfg.label }}
        </span>
      </div>
    </div>

    <VisitaModal v-if="modalOpen" :initial="editTarget" @close="cerrarModal" @save="handleSave" />
  </div>
</template>
