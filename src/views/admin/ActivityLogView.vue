<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  ArrowRightLeft,
  ChevronDown,
  DollarSign,
  Eye,
  Image,
  MapPin,
  Package,
  PencilLine,
  Plus,
  Search,
  Trash2,
} from 'lucide-vue-next'
import AdminTopBar from '@/components/admin/AdminTopBar.vue'
import { adminActividadService } from '@/services/admin.service'
import type { AccionTipo, Actividad } from '@/types/admin'
import { SERIF } from '@/config'

const ACCION_CONFIG = {
  creacion: {
    icon: Plus,
    label: 'Creación',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
  },
  edicion: {
    icon: PencilLine,
    label: 'Edición',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10 border-sky-400/20',
  },
  estado: {
    icon: ArrowRightLeft,
    label: 'Estado',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10 border-violet-400/20',
  },
  precio: {
    icon: DollarSign,
    label: 'Precio',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/20',
  },
  imagenes: {
    icon: Image,
    label: 'Imágenes',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10 border-pink-400/20',
  },
  eliminacion: {
    icon: Trash2,
    label: 'Eliminación',
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/20',
  },
  bienes: {
    icon: Package,
    label: 'Bienes',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10 border-orange-400/20',
  },
  ubicacion: {
    icon: MapPin,
    label: 'Ubicación',
    color: 'text-teal-400',
    bg: 'bg-teal-400/10 border-teal-400/20',
  },
} satisfies Record<AccionTipo, unknown>

const ACCIONES: { val: AccionTipo | 'todas'; label: string }[] = [
  { val: 'todas', label: 'Todas las acciones' },
  { val: 'creacion', label: 'Creación' },
  { val: 'edicion', label: 'Edición' },
  { val: 'estado', label: 'Cambio de estado' },
  { val: 'precio', label: 'Precio' },
  { val: 'imagenes', label: 'Imágenes' },
  { val: 'bienes', label: 'Bienes' },
  { val: 'ubicacion', label: 'Ubicación' },
  { val: 'eliminacion', label: 'Eliminación' },
]

const router = useRouter()
const actividades = ref<Actividad[]>([])
const search = ref('')
const agente = ref('Todos')
const accion = ref<AccionTipo | 'todas'>('todas')
const showAgenteMenu = ref(false)
const showAccionMenu = ref(false)

onMounted(async () => {
  actividades.value = await adminActividadService.listar()
})

const agentes = computed(() => ['Todos', ...new Set(actividades.value.map((a) => a.agente))])

const grouped = computed(() => {
  const q = search.value.toLowerCase()
  const groups: Record<string, Actividad[]> = {}
  for (const a of actividades.value) {
    const matchSearch = [a.propiedad, a.colonia, a.agente].some((s) => s.toLowerCase().includes(q))
    const matchAgente = agente.value === 'Todos' || a.agente === agente.value
    const matchAccion = accion.value === 'todas' || a.accion === accion.value
    if (matchSearch && matchAgente && matchAccion) (groups[a.fecha] ??= []).push(a)
  }
  return groups
})

const hayFiltros = computed(
  () => agente.value !== 'Todos' || accion.value !== 'todas' || !!search.value,
)

function limpiar() {
  agente.value = 'Todos'
  accion.value = 'todas'
  search.value = ''
}

const initials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

const btnCls =
  'flex items-center gap-2 bg-white/4 border border-white/8 rounded-lg px-3.5 py-2 text-xs text-white/50 hover:border-white/16 hover:text-white/70 transition-all whitespace-nowrap'
const dropdownCls =
  'absolute top-full left-0 mt-1 bg-[#1a1917] border border-white/10 rounded-lg shadow-xl z-40 min-w-[180px] py-1 overflow-hidden'
const optionCls = (active: boolean) => [
  'w-full text-left px-4 py-2 text-xs transition-colors',
  active ? 'text-white bg-white/8' : 'text-white/40 hover:text-white/70 hover:bg-white/5',
]
</script>

<template>
  <div class="min-h-screen bg-[#0d0d0c] font-['DM_Sans',sans-serif]">
    <AdminTopBar />

    <div class="max-w-screen-xl mx-auto px-5 py-8">
      <div class="mb-8">
        <button
          class="flex items-center gap-2 text-white/25 hover:text-white/50 text-xs mb-4 transition-colors"
          @click="router.push('/admin/panel')"
        >
          <ArrowLeft :size="12" /> Panel
        </button>
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 class="text-white text-2xl mb-1" :style="SERIF">Historial de modificaciones</h1>
            <p class="text-white/30 text-sm">
              Registro completo de cambios realizados en el portafolio de propiedades.
            </p>
          </div>
          <div class="bg-white/3 border border-white/6 rounded-xl px-5 py-3 text-center">
            <p class="text-white text-2xl font-medium" :style="SERIF">{{ actividades.length }}</p>
            <p class="text-white/30 text-xs">registros totales</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-2 mb-7">
        <div
          class="flex-1 min-w-[200px] flex items-center bg-white/4 border border-white/8 rounded-lg px-3.5 py-2 gap-2 hover:border-white/16 transition-all focus-within:border-white/20"
        >
          <Search :size="13" class="text-white/20 shrink-0" />
          <input
            v-model="search"
            type="text"
            placeholder="Buscar por propiedad, colonia o agente…"
            class="flex-1 bg-transparent text-xs text-white placeholder-white/20 outline-none"
          />
        </div>

        <div class="relative shrink-0">
          <button
            :class="btnCls"
            @click="((showAgenteMenu = !showAgenteMenu), (showAccionMenu = false))"
          >
            <Eye :size="12" class="text-white/30" />
            {{ agente }}
            <ChevronDown
              :size="11"
              :class="['text-white/20 transition-transform', showAgenteMenu ? 'rotate-180' : '']"
            />
          </button>
          <div v-if="showAgenteMenu" :class="dropdownCls">
            <button
              v-for="a in agentes"
              :key="a"
              :class="optionCls(agente === a)"
              @click="((agente = a), (showAgenteMenu = false))"
            >
              {{ a }}
            </button>
          </div>
        </div>

        <div class="relative shrink-0">
          <button
            :class="btnCls"
            @click="((showAccionMenu = !showAccionMenu), (showAgenteMenu = false))"
          >
            <PencilLine :size="12" class="text-white/30" />
            {{ ACCIONES.find((a) => a.val === accion)?.label }}
            <ChevronDown
              :size="11"
              :class="['text-white/20 transition-transform', showAccionMenu ? 'rotate-180' : '']"
            />
          </button>
          <div v-if="showAccionMenu" :class="dropdownCls">
            <button
              v-for="a in ACCIONES"
              :key="a.val"
              :class="optionCls(accion === a.val)"
              @click="((accion = a.val), (showAccionMenu = false))"
            >
              {{ a.label }}
            </button>
          </div>
        </div>

        <button
          v-if="hayFiltros"
          class="text-xs text-white/25 hover:text-white/50 transition-colors px-2"
          @click="limpiar"
        >
          Limpiar filtros
        </button>
      </div>

      <!-- Activity log -->
      <div
        v-if="!Object.keys(grouped).length"
        class="border border-dashed border-white/8 rounded-xl h-32 flex items-center justify-center"
      >
        <p class="text-white/20 text-sm">Sin registros para los filtros seleccionados.</p>
      </div>

      <div v-else class="flex flex-col gap-8">
        <div v-for="(items, fecha) in grouped" :key="fecha">
          <div class="flex items-center gap-3 mb-4">
            <p class="text-white/25 text-xs font-medium tracking-widest uppercase shrink-0">
              {{ fecha }}
            </p>
            <div class="flex-1 h-px bg-white/6" />
            <span class="text-white/15 text-[10px]"
              >{{ items.length }} {{ items.length === 1 ? 'cambio' : 'cambios' }}</span
            >
          </div>

          <div class="relative">
            <div class="absolute left-[19px] top-0 bottom-0 w-px bg-white/6" />
            <div class="flex flex-col gap-0">
              <div
                v-for="(a, idx) in items"
                :key="a.id"
                :class="['relative flex gap-4 group', idx < items.length - 1 ? 'pb-5' : '']"
              >
                <div
                  :class="[
                    'relative z-10 w-10 h-10 rounded-full border flex items-center justify-center shrink-0',
                    ACCION_CONFIG[a.accion].bg,
                    ACCION_CONFIG[a.accion].color,
                  ]"
                >
                  <component :is="ACCION_CONFIG[a.accion].icon" :size="12" />
                </div>

                <div
                  class="flex-1 bg-white/2 border border-white/6 rounded-xl p-4 hover:border-white/12 hover:bg-white/3 transition-all duration-200 min-w-0"
                >
                  <div class="flex items-start justify-between gap-3 flex-wrap mb-2">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span
                        :class="[
                          'inline-flex items-center gap-1.5 border text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full',
                          ACCION_CONFIG[a.accion].bg,
                          ACCION_CONFIG[a.accion].color,
                        ]"
                      >
                        <component :is="ACCION_CONFIG[a.accion].icon" :size="12" />
                        {{ ACCION_CONFIG[a.accion].label }}
                      </span>
                      <h3 class="text-white/80 text-sm leading-tight" :style="SERIF">
                        {{ a.propiedad }}
                      </h3>
                      <span class="text-white/25 text-xs flex items-center gap-0.5"
                        ><MapPin :size="9" />{{ a.colonia }}</span
                      >
                    </div>
                    <span class="text-white/20 text-xs shrink-0">{{ a.hora }} h</span>
                  </div>

                  <p class="text-white/40 text-xs leading-relaxed mb-3">{{ a.detalle }}</p>

                  <div
                    v-if="a.estadoAnterior && a.estadoNuevo"
                    class="flex items-center gap-2 mb-3"
                  >
                    <span
                      class="text-white/20 text-[10px] bg-white/4 border border-white/8 px-2 py-1 rounded-md"
                    >
                      {{ a.estadoAnterior }}
                    </span>
                    <ArrowRightLeft :size="10" class="text-white/20 shrink-0" />
                    <span
                      class="text-white/60 text-[10px] bg-white/6 border border-white/12 px-2 py-1 rounded-md"
                    >
                      {{ a.estadoNuevo }}
                    </span>
                  </div>

                  <div class="flex items-center gap-2">
                    <div
                      class="w-5 h-5 rounded-full bg-white/8 flex items-center justify-center text-[9px] text-white/40 font-medium shrink-0"
                    >
                      {{ initials(a.agente) }}
                    </div>
                    <span class="text-white/25 text-[11px]">{{ a.agente }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
