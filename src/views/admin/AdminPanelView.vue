<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  BarChart3,
  FileSignature,
  FolderLock,
  KeyRound,
  Star,
  CalendarCheck,
  ChevronDown,
  Clock,
  Filter,
  History,
  Inbox,
  ListChecks,
  LogOut,
  Plus,
  Search,
  TrendingUp,
  User,
} from 'lucide-vue-next'
import AdminTopBar from '@/components/admin/AdminTopBar.vue'
import AdminPropCard from '@/components/admin/AdminPropCard.vue'
import PostulacionCard from '@/components/admin/PostulacionCard.vue'
import MotivoModal from '@/components/admin/MotivoModal.vue'
import NotificationBell from '@/components/ui/NotificationBell.vue'
import WhatsAppIcon from '@/components/ui/WhatsAppIcon.vue'
import { ESTADO_PROPIEDAD } from '@/components/admin/estadoPropiedad'
import { adminPostulacionesService, adminPropiedadesService } from '@/services/admin.service'
import { useAuthStore } from '@/stores/auth'
import type { EstadoPropiedad, PropiedadAdmin } from '@/types/propiedad'
import type { Postulacion } from '@/types/admin'
import { SERIF, WHATSAPP_URL } from '@/config'

const router = useRouter()
const auth = useAuthStore()

const search = ref('')
const tab = ref<'portafolio' | 'postulaciones'>('portafolio')
const propiedades = ref<PropiedadAdmin[]>([])
const postulaciones = ref<Postulacion[]>([])

onMounted(async () => {
  ;[propiedades.value, postulaciones.value] = await Promise.all([
    adminPropiedadesService.listar(),
    adminPostulacionesService.listar(),
  ])
})

const filtradas = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return propiedades.value
  return propiedades.value.filter((p) =>
    `${p.titulo} ${p.colonia} ${p.agente}`.toLowerCase().includes(q),
  )
})
const porEstado = (estado: EstadoPropiedad) => filtradas.value.filter((p) => p.estado === estado)

const stats = computed(() => [
  {
    label: 'Total propiedades',
    value: propiedades.value.length,
    icon: Filter,
    color: 'text-white/50',
  },
  {
    label: 'Listadas',
    value: propiedades.value.filter((p) => p.estado === 'listada').length,
    icon: ListChecks,
    color: 'text-emerald-400',
  },
  {
    label: 'Por listar',
    value: propiedades.value.filter((p) => p.estado === 'por-listar').length,
    icon: Clock,
    color: 'text-amber-400',
  },
  {
    label: 'En revisión',
    value: propiedades.value.filter((p) => p.estado === 'en-revision').length,
    icon: TrendingUp,
    color: 'text-sky-400',
  },
])

const pendientes = computed(() => postulaciones.value.filter((p) => p.estado === 'pendiente'))
const revisadas = computed(() => postulaciones.value.filter((p) => p.estado !== 'pendiente'))
const postStats = computed(() => [
  { label: 'Pendientes', value: pendientes.value.length, color: 'text-amber-400' },
  {
    label: 'Aprobadas',
    value: postulaciones.value.filter((p) => p.estado === 'aprobada').length,
    color: 'text-emerald-400',
  },
  {
    label: 'Rechazadas',
    value: postulaciones.value.filter((p) => p.estado === 'rechazada').length,
    color: 'text-red-400',
  },
])

const rechazando = ref<Postulacion | null>(null)

function reemplazar(actualizada: Postulacion) {
  postulaciones.value = postulaciones.value.map((p) => (p.id === actualizada.id ? actualizada : p))
}

async function aprobar(id: number) {
  reemplazar(await adminPostulacionesService.aprobar(id))
}

async function confirmarRechazo(observaciones: string) {
  if (!rechazando.value) return
  reemplazar(await adminPostulacionesService.rechazar(rechazando.value.id, observaciones))
  rechazando.value = null
}

const SUGERENCIAS_RECHAZO = [
  'Las fotografías no permiten apreciar el inmueble.',
  'Falta documentación que acredite la propiedad.',
  'El precio está fuera del rango del mercado de la zona.',
  'La zona está fuera de la cobertura de MU Real Estate.',
]

function logout() {
  auth.logout()
  router.push('/admin')
}

const accesos = [
  { label: 'Analítica', icon: BarChart3, to: '/admin/analitica' },
  { label: 'Agenda', icon: CalendarCheck, to: '/admin/agenda' },
  { label: 'Usuarios', icon: User, to: '/admin/users' },
  { label: 'Solicitudes', icon: Inbox, to: '/admin/requests' },
  { label: 'Expedientes', icon: FolderLock, to: '/admin/expedientes' },
  { label: 'Reseñas', icon: Star, to: '/admin/resenas' },
  { label: 'Contratos', icon: FileSignature, to: '/admin/contratos' },
  { label: 'Entregas', icon: KeyRound, to: '/admin/entregas' },
  { label: 'Historial', icon: History, to: '/admin/activity' },
]
const columnas: EstadoPropiedad[] = ['listada', 'por-listar', 'en-revision']
</script>

<template>
  <div class="min-h-screen bg-[#0d0d0c] font-['DM_Sans',sans-serif]">
    <MotivoModal
      v-if="rechazando"
      titulo="Rechazar postulación"
      :descripcion="`Indica a ${rechazando.contacto} por qué no se publicará «${rechazando.titulo}». El mensaje le llegará por notificación.`"
      placeholder="Ej. Las fotografías no permiten apreciar el estado del inmueble…"
      :sugerencias="SUGERENCIAS_RECHAZO"
      @close="rechazando = null"
      @confirm="confirmarRechazo"
    />
    <AdminTopBar section="Panel de control" wide>
      <template #center>
        <div
          class="hidden md:flex items-center bg-white/5 border border-white/8 rounded-lg px-3 py-2 gap-2 w-56"
        >
          <Search :size="13" class="text-white/20 shrink-0" />
          <input
            v-model="search"
            type="text"
            placeholder="Buscar propiedad..."
            class="flex-1 bg-transparent text-xs text-white placeholder-white/20 outline-none"
          />
        </div>
      </template>
      <template #actions>
        <div class="flex items-center gap-2">
          <a
            :href="WHATSAPP_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="p-2 rounded-lg text-[#25D366] hover:bg-white/5 transition-all"
            title="Contactar por WhatsApp"
          >
            <WhatsAppIcon :size="16" />
          </a>
          <NotificationBell para="admin" variant="dark" />
          <div class="w-px h-4 bg-white/8" />
          <div class="flex items-center gap-2">
            <div
              class="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/60 font-medium"
            >
              {{ auth.iniciales || 'AD' }}
            </div>
            <span class="hidden sm:block text-white/40 text-xs">Administrador</span>
            <ChevronDown :size="12" class="text-white/20" />
          </div>
          <button
            class="ml-1 p-2 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/5 transition-all"
            title="Cerrar sesión"
            @click="logout"
          >
            <LogOut :size="15" />
          </button>
        </div>
      </template>
    </AdminTopBar>

    <div class="max-w-screen-2xl mx-auto px-5 py-7">
      <!-- Header -->
      <div class="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 class="text-white text-2xl mb-1" :style="SERIF">Gestión de Propiedades</h1>
          <p class="text-white/30 text-sm">
            Seguimiento de estado de todas las propiedades del portafolio.
          </p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button
            v-for="a in accesos"
            :key="a.to"
            class="flex items-center gap-2 bg-white/6 border border-white/10 text-white/60 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-white/10 hover:text-white/80 transition-all"
            @click="router.push(a.to)"
          >
            <component :is="a.icon" :size="14" /> {{ a.label }}
          </button>
          <button
            class="flex items-center gap-2 bg-white text-[#0d0d0c] text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-white/90 transition-all"
            @click="router.push('/admin/new-property')"
          >
            <Plus :size="14" /> Nueva propiedad
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex items-center gap-1 mb-6 border-b border-white/6 pb-0">
        <button
          v-for="t in [
            { val: 'portafolio', label: 'Portafolio', icon: ListChecks, badge: 0 },
            {
              val: 'postulaciones',
              label: 'Postulaciones de usuarios',
              icon: Inbox,
              badge: pendientes.length,
            },
          ] as const"
          :key="t.val"
          :class="[
            'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-150 -mb-px',
            tab === t.val
              ? 'border-white/60 text-white/80'
              : 'border-transparent text-white/30 hover:text-white/50 hover:border-white/20',
          ]"
          @click="tab = t.val"
        >
          <component :is="t.icon" :size="13" /> {{ t.label }}
          <span
            v-if="t.badge > 0"
            class="bg-amber-400 text-black text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none"
          >
            {{ t.badge }}
          </span>
        </button>
      </div>

      <template v-if="tab === 'portafolio'">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
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

        <!-- Kanban -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="estado in columnas" :key="estado" class="flex flex-col min-w-0">
            <div
              :class="[
                'flex items-center justify-between mb-4 pb-3.5 border-b',
                ESTADO_PROPIEDAD[estado].headerBorder,
              ]"
            >
              <div class="flex items-center gap-2">
                <span :style="{ color: ESTADO_PROPIEDAD[estado].color }">
                  <component :is="ESTADO_PROPIEDAD[estado].icon" :size="14" />
                </span>
                <h3 class="text-white/80 text-sm font-medium tracking-wide">
                  {{ ESTADO_PROPIEDAD[estado].label }}
                </h3>
                <span class="bg-white/8 text-white/40 text-xs px-2 py-0.5 rounded-full">{{
                  porEstado(estado).length
                }}</span>
              </div>
              <button
                class="p-1.5 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/5 transition-all duration-150"
                @click="router.push('/admin/new-property')"
              >
                <Plus :size="13" />
              </button>
            </div>
            <div class="flex flex-col gap-3">
              <AdminPropCard
                v-for="p in porEstado(estado)"
                :key="p.id"
                :p="p"
                @click="router.push(`/admin/property/${p.id}`)"
              />
              <div
                v-if="!porEstado(estado).length"
                class="border border-dashed border-white/8 rounded-xl h-24 flex items-center justify-center"
              >
                <p class="text-white/20 text-xs">Sin propiedades</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="grid grid-cols-3 gap-3 mb-8">
          <div
            v-for="s in postStats"
            :key="s.label"
            class="bg-white/3 border border-white/6 rounded-xl px-4 py-4"
          >
            <div :class="['flex items-center gap-2 mb-2', s.color]">
              <User :size="13" />
              <span class="text-xs tracking-wide opacity-80">{{ s.label }}</span>
            </div>
            <p class="text-white text-2xl font-medium" :style="SERIF">{{ s.value }}</p>
          </div>
        </div>

        <div v-if="pendientes.length" class="mb-6">
          <p class="text-amber-400/70 text-xs font-medium tracking-widest uppercase mb-4">
            Pendientes de revisión · {{ pendientes.length }}
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <PostulacionCard
              v-for="p in pendientes"
              :key="p.id"
              :p="p"
              @aprobar="aprobar(p.id)"
              @rechazar="rechazando = p"
            />
          </div>
        </div>

        <div v-if="revisadas.length">
          <p class="text-white/25 text-xs font-medium tracking-widest uppercase mb-4">
            Revisadas · {{ revisadas.length }}
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <PostulacionCard v-for="p in revisadas" :key="p.id" :p="p" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
