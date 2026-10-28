<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { AlertCircle, Bell, CalendarCheck, Filter, MapPin, MessageSquare, PhoneCall, Plus, Search, User } from 'lucide-vue-next'
import AdminTopBar from '@/components/admin/AdminTopBar.vue'
import AdminLogoutActions from '@/components/admin/AdminLogoutActions.vue'
import SolicitudDetailModal from '@/components/admin/SolicitudDetailModal.vue'
import NuevoAvisoModal from '@/components/admin/NuevoAvisoModal.vue'
import { AVISOS_TIPO, ESTADOS_SOL, ESTADOS_SOL_KEYS } from '@/components/admin/solicitudesConfig'
import { iniciales } from '@/components/admin/estadoPropiedad'
import { adminAvisosService, adminSolicitudesService } from '@/services/admin.service'
import type { Aviso, EstadoSolicitud, Solicitud, TipoSolicitud } from '@/types/admin'
import { SERIF } from '@/config'

const tab = ref<'solicitudes' | 'avisos'>('solicitudes')
const solicitudes = ref<Solicitud[]>([])
const avisos = ref<Aviso[]>([])
const search = ref('')
const filtroEstado = ref<EstadoSolicitud | 'todos'>('todos')
const filtroTipo = ref<TipoSolicitud | 'todos'>('todos')
const detalleId = ref<number | null>(null)
const nuevoAviso = ref(false)

onMounted(async () => {
  ;[solicitudes.value, avisos.value] = await Promise.all([adminSolicitudesService.listar(), adminAvisosService.listar()])
})

const detalle = computed(() => solicitudes.value.find((s) => s.id === detalleId.value) ?? null)

const filtradas = computed(() => {
  const q = search.value.toLowerCase()
  return solicitudes.value.filter(
    (s) =>
      (s.nombre.toLowerCase().includes(q) || s.propiedad.toLowerCase().includes(q)) &&
      (filtroEstado.value === 'todos' || s.estado === filtroEstado.value) &&
      (filtroTipo.value === 'todos' || s.tipo === filtroTipo.value),
  )
})

const nuevas = computed(() => solicitudes.value.filter((s) => s.estado === 'nueva').length)
const noLeidos = computed(() => avisos.value.filter((a) => !a.leido).length)

const stats = computed(() => [
  { label: 'Total solicitudes', value: solicitudes.value.length, color: 'text-white/50', icon: MessageSquare },
  { label: 'Nuevas', value: nuevas.value, color: 'text-amber-400', icon: AlertCircle },
  { label: 'Asignadas', value: solicitudes.value.filter((s) => s.estado === 'asignada').length, color: 'text-sky-400', icon: User },
  { label: 'Avisos sin leer', value: noLeidos.value, color: 'text-purple-400', icon: Bell },
])

const filtrosTipo: [TipoSolicitud | 'todos', string][] = [
  ['todos', 'Todas'],
  ['contacto', 'Contacto'],
  ['visita', 'Visita'],
]
const filtrosEstado: [EstadoSolicitud | 'todos', string][] = [
  ['todos', 'Todos los estados'],
  ...ESTADOS_SOL_KEYS.map((k) => [k, ESTADOS_SOL[k].label] as [EstadoSolicitud, string]),
]

const filtroCls = (active: boolean) => [
  'px-3 py-1.5 rounded-lg text-xs transition-all border',
  active
    ? 'bg-white/10 border-white/20 text-white/80'
    : 'bg-transparent border-white/6 text-white/30 hover:border-white/12 hover:text-white/50',
]

async function actualizarSolicitud(id: number, patch: Partial<Solicitud>) {
  const actualizada = await adminSolicitudesService.actualizar(id, patch)
  solicitudes.value = solicitudes.value.map((s) => (s.id === id ? actualizada : s))
}

function handleAsignar(sol: Solicitud, agente: string) {
  actualizarSolicitud(sol.id, { asignadoA: agente || null, estado: agente ? 'asignada' : sol.estado })
}

async function handleEnviarAviso(aviso: Omit<Aviso, 'id' | 'leido'>) {
  const creado = await adminAvisosService.crear({ ...aviso, leido: false })
  avisos.value = [creado, ...avisos.value]
  nuevoAviso.value = false
}

async function marcarLeido(aviso: Aviso) {
  if (aviso.leido) return
  const actualizado = await adminAvisosService.actualizar(aviso.id, { leido: true })
  avisos.value = avisos.value.map((a) => (a.id === aviso.id ? actualizado : a))
}
</script>

<template>
  <div class="min-h-screen bg-[#0d0d0c] font-['DM_Sans',sans-serif]">
    <SolicitudDetailModal
      v-if="detalle"
      :key="detalle.id"
      :sol="detalle"
      @close="detalleId = null"
      @asignar="handleAsignar(detalle, $event)"
      @cambiar-estado="actualizarSolicitud(detalle.id, { estado: $event })"
      @guardar-nota="actualizarSolicitud(detalle.id, { notas: $event })"
    />
    <NuevoAvisoModal v-if="nuevoAviso" @close="nuevoAviso = false" @send="handleEnviarAviso" />

    <AdminTopBar section="Solicitudes & Avisos" wide>
      <template #actions><AdminLogoutActions /></template>
    </AdminTopBar>

    <div class="max-w-screen-2xl mx-auto px-5 py-7">
      <div class="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 class="text-white text-2xl mb-1" :style="SERIF">Centro de Solicitudes</h1>
          <p class="text-white/30 text-sm">Gestiona solicitudes de contacto, visitas y avisos al equipo.</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="tab === 'avisos'"
            class="flex items-center gap-2 bg-white text-[#0d0d0c] text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-white/90 transition-all"
            @click="nuevoAviso = true"
          >
            <Plus :size="14" /> Nuevo aviso
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div v-for="s in stats" :key="s.label" class="bg-white/3 border border-white/6 rounded-xl px-4 py-4">
          <div :class="['flex items-center gap-2 mb-2', s.color]">
            <component :is="s.icon" :size="13" /><span class="text-xs opacity-80">{{ s.label }}</span>
          </div>
          <p class="text-white text-2xl font-medium" :style="SERIF">{{ s.value }}</p>
        </div>
      </div>

      <div class="flex items-center gap-1 mb-6 border-b border-white/6 pb-0">
        <button
          v-for="t in [
            { val: 'solicitudes', label: 'Solicitudes', icon: PhoneCall, badge: nuevas },
            { val: 'avisos', label: 'Avisos Internos', icon: Bell, badge: noLeidos },
          ] as const"
          :key="t.val"
          :class="[
            'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-150 -mb-px',
            tab === t.val ? 'border-white/60 text-white/80' : 'border-transparent text-white/30 hover:text-white/50 hover:border-white/20',
          ]"
          @click="tab = t.val"
        >
          <component :is="t.icon" :size="13" /> {{ t.label }}
          <span v-if="t.badge > 0" class="bg-amber-400 text-black text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none">
            {{ t.badge }}
          </span>
        </button>
      </div>

      <template v-if="tab === 'solicitudes'">
        <div class="flex flex-wrap items-center gap-3 mb-5">
          <div class="flex items-center bg-white/5 border border-white/8 rounded-lg px-3 py-2 gap-2 w-60">
            <Search :size="13" class="text-white/20 shrink-0" />
            <input
              v-model="search"
              type="text"
              placeholder="Buscar solicitud..."
              class="flex-1 bg-transparent text-xs text-white placeholder-white/20 outline-none"
            />
          </div>
          <div class="flex items-center gap-1.5">
            <button v-for="[val, label] in filtrosTipo" :key="val" :class="filtroCls(filtroTipo === val)" @click="filtroTipo = val">
              {{ label }}
            </button>
          </div>
          <div class="flex items-center gap-1.5 flex-wrap">
            <button
              v-for="[val, label] in filtrosEstado"
              :key="val"
              :class="filtroCls(filtroEstado === val)"
              @click="filtroEstado = val"
            >
              {{ label }}
            </button>
          </div>
        </div>

        <div class="space-y-3">
          <div
            v-for="sol in filtradas"
            :key="sol.id"
            class="bg-white/3 border border-white/6 rounded-xl p-4 hover:border-white/14 hover:bg-white/5 transition-all cursor-pointer group"
            @click="detalleId = sol.id"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-start gap-3 min-w-0">
                <div
                  :class="[
                    'mt-0.5 w-8 h-8 rounded-xl border flex items-center justify-center shrink-0',
                    ESTADOS_SOL[sol.estado].bg,
                    ESTADOS_SOL[sol.estado].color,
                  ]"
                >
                  <CalendarCheck v-if="sol.tipo === 'visita'" :size="14" />
                  <PhoneCall v-else :size="14" />
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap mb-1">
                    <p class="text-white/80 text-sm font-medium">{{ sol.nombre }}</p>
                    <span
                      :class="[
                        'inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border',
                        ESTADOS_SOL[sol.estado].bg,
                        ESTADOS_SOL[sol.estado].color,
                      ]"
                    >
                      <component :is="ESTADOS_SOL[sol.estado].icon" :size="11" /> {{ ESTADOS_SOL[sol.estado].label }}
                    </span>
                    <span class="text-white/20 text-[10px] capitalize bg-white/4 px-2 py-0.5 rounded-full border border-white/6">
                      {{ sol.tipo === 'visita' ? 'Visita' : 'Contacto' }}
                    </span>
                  </div>
                  <p class="text-white/40 text-xs flex items-center gap-1.5 mb-1">
                    <MapPin :size="10" /> {{ sol.propiedad }} · {{ sol.ubicacion }}
                  </p>
                  <p class="text-white/25 text-xs line-clamp-1 italic">"{{ sol.mensaje }}"</p>
                </div>
              </div>

              <div class="text-right shrink-0">
                <p class="text-white/25 text-xs mb-1">{{ sol.fecha }}</p>
                <p class="text-white/15 text-[10px]">{{ sol.hora }}</p>
                <div v-if="sol.asignadoA" class="mt-2 flex items-center gap-1.5 justify-end">
                  <div class="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] text-white/40">
                    {{ iniciales(sol.asignadoA) }}
                  </div>
                  <span class="text-white/25 text-[10px]">{{ sol.asignadoA }}</span>
                </div>
              </div>
            </div>
            <div v-if="sol.notas" class="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
              <MessageSquare :size="10" class="text-white/20 shrink-0" />
              <p class="text-white/25 text-xs line-clamp-1">{{ sol.notas }}</p>
            </div>
          </div>
          <div v-if="!filtradas.length" class="border border-dashed border-white/8 rounded-xl py-16 flex flex-col items-center gap-2">
            <Filter :size="20" class="text-white/15" />
            <p class="text-white/20 text-sm">Sin solicitudes que coincidan</p>
          </div>
        </div>
      </template>

      <div v-else class="space-y-3">
        <div
          v-for="aviso in avisos"
          :key="aviso.id"
          :class="[
            'border rounded-xl p-4 transition-all cursor-pointer group',
            aviso.leido ? 'bg-white/2 border-white/5 hover:bg-white/4' : 'bg-white/4 border-white/10 hover:bg-white/6',
          ]"
          @click="marcarLeido(aviso)"
        >
          <div class="flex items-start gap-3">
            <div
              :class="[
                'mt-0.5 w-8 h-8 rounded-xl border flex items-center justify-center shrink-0',
                AVISOS_TIPO[aviso.tipo].bg,
                AVISOS_TIPO[aviso.tipo].color,
              ]"
            >
              <component :is="AVISOS_TIPO[aviso.tipo].icon" :size="12" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-2 mb-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <p :class="['text-sm font-medium', aviso.leido ? 'text-white/50' : 'text-white/80']">{{ aviso.titulo }}</p>
                  <span v-if="!aviso.leido" class="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span
                    :class="[
                      'inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border',
                      AVISOS_TIPO[aviso.tipo].bg,
                      AVISOS_TIPO[aviso.tipo].color,
                    ]"
                  >
                    <component :is="AVISOS_TIPO[aviso.tipo].icon" :size="12" /> {{ AVISOS_TIPO[aviso.tipo].label }}
                  </span>
                </div>
                <p class="text-white/20 text-[10px] shrink-0">{{ aviso.fecha }}</p>
              </div>
              <p :class="['text-xs leading-relaxed mb-2', aviso.leido ? 'text-white/25' : 'text-white/40']">{{ aviso.cuerpo }}</p>
              <div class="flex items-center gap-3">
                <span class="text-white/20 text-[10px]">De: {{ aviso.autor }}</span>
                <span class="text-white/15 text-[10px]">Para: {{ aviso.destinatario }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
