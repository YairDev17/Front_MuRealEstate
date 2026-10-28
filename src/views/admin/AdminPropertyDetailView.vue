<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Bath, Bed, Calendar, Car, Check, CheckCircle2, ChevronRight, Eye, MapPin, Maximize2 } from 'lucide-vue-next'
import AdminTopBar from '@/components/admin/AdminTopBar.vue'
import WhatsAppIcon from '@/components/ui/WhatsAppIcon.vue'
import { ESTADO_PROPIEDAD, iniciales } from '@/components/admin/estadoPropiedad'
import { adminPropiedadesService } from '@/services/admin.service'
import type { EstadoPropiedad, PropiedadAdmin } from '@/types/propiedad'
import { SERIF, WHATSAPP_URL } from '@/config'

const props = defineProps<{ id: string }>()
const router = useRouter()

const propiedad = ref<PropiedadAdmin | null>(null)
const loading = ref(true)
const activeImg = ref(0)
const statusMenuOpen = ref(false)
const statusChanged = ref(false)

watch(
  () => props.id,
  async (id) => {
    loading.value = true
    activeImg.value = 0
    try {
      propiedad.value = await adminPropiedadesService.obtener(Number(id))
    } catch {
      propiedad.value = null
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)

const imagenes = computed(() => {
  const p = propiedad.value
  return p ? (p.imagenes?.length ? p.imagenes : [p.imagen]) : []
})
const cfg = computed(() => ESTADO_PROPIEDAD[propiedad.value?.estado ?? 'listada'])
const estadoOptions: EstadoPropiedad[] = ['listada', 'por-listar', 'en-revision']

async function handleEstadoChange(next: EstadoPropiedad) {
  if (!propiedad.value) return
  statusMenuOpen.value = false
  propiedad.value = await adminPropiedadesService.cambiarEstado(propiedad.value.id, next)
  statusChanged.value = true
  setTimeout(() => (statusChanged.value = false), 2000)
}

const stats = computed(() => {
  const p = propiedad.value
  if (!p) return []
  return [
    { icon: Bed, label: 'Recámaras', value: p.habitaciones },
    { icon: Bath, label: 'Baños', value: p.banos },
    { icon: Maximize2, label: 'm²', value: `${p.m2}` },
    { icon: Car, label: 'Estacion.', value: p.estacionamientos ?? '—' },
  ]
})

const meta = computed(() => {
  const p = propiedad.value
  if (!p) return []
  return [
    { icon: Calendar, label: 'Fecha de ingreso', value: p.fechaIngreso },
    { icon: Eye, label: 'Visitas', value: p.visitas !== undefined ? p.visitas.toLocaleString() : '—' },
    { icon: CheckCircle2, label: 'ID de propiedad', value: `#${String(p.id).padStart(4, '0')}` },
  ]
})
</script>

<template>
  <div v-if="loading" class="min-h-screen bg-[#0d0d0c] flex items-center justify-center">
    <p class="text-white/30 text-sm">Cargando…</p>
  </div>

  <div v-else-if="!propiedad" class="min-h-screen bg-[#0d0d0c] flex flex-col items-center justify-center gap-4">
    <p class="text-white/30 text-sm">Propiedad no encontrada.</p>
    <button
      class="text-white/50 text-xs underline underline-offset-2 hover:text-white/70"
      @click="router.push('/admin/panel')"
    >
      Volver al panel
    </button>
  </div>

  <div v-else class="min-h-screen bg-[#0d0d0c] font-['DM_Sans',sans-serif]">
    <AdminTopBar>
      <template #center>
        <div class="hidden sm:flex items-center gap-1.5 text-xs text-white/25">
          <button class="hover:text-white/50 transition-colors" @click="router.push('/admin/panel')">Panel</button>
          <ChevronRight :size="11" />
          <span class="text-white/50 truncate max-w-[200px]">{{ propiedad.titulo }}</span>
        </div>
      </template>
      <template #actions>
        <button
          class="flex items-center gap-2 text-white/40 text-xs hover:text-white/70 transition-colors"
          @click="router.push('/admin/panel')"
        >
          <ArrowLeft :size="14" /> Volver al panel
        </button>
      </template>
    </AdminTopBar>

    <div class="max-w-screen-xl mx-auto px-5 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <!-- ── Left: images + details ── -->
        <div class="lg:col-span-3 flex flex-col gap-6">
          <div class="relative rounded-2xl overflow-hidden bg-white/5" style="height: 420px">
            <img
              :key="activeImg"
              :src="imagenes[activeImg]"
              :alt="propiedad.titulo"
              class="kenburns-img absolute inset-0 w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            <div class="absolute top-4 left-4">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 border text-xs font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full backdrop-blur-sm',
                  cfg.badge,
                ]"
              >
                <span :class="['w-1.5 h-1.5 rounded-full', cfg.dot]" />
                {{ cfg.singular }}
              </span>
            </div>
            <div class="absolute top-4 right-4">
              <span class="inline-block bg-black/60 backdrop-blur-sm text-white/80 text-xs px-3 py-1.5 rounded-full uppercase tracking-wider">
                {{ propiedad.tipo === 'venta' ? 'Venta' : 'Renta' }}
              </span>
            </div>

            <div class="absolute bottom-0 left-0 right-0 p-5">
              <h1 class="text-white text-2xl leading-tight mb-1" :style="SERIF">{{ propiedad.titulo }}</h1>
              <p class="text-white/50 text-sm flex items-center gap-1.5">
                <MapPin :size="12" /> {{ propiedad.colonia }}{{ propiedad.ciudad ? `, ${propiedad.ciudad}` : '' }}
              </p>
            </div>

            <div v-if="imagenes.length > 1" class="absolute bottom-4 right-4 flex gap-1.5">
              <button
                v-for="(img, i) in imagenes"
                :key="i"
                :class="[
                  'w-12 h-9 rounded-lg overflow-hidden border-2 transition-all duration-150',
                  i === activeImg ? 'border-white/60 opacity-100' : 'border-white/10 opacity-50 hover:opacity-75',
                ]"
                @click="activeImg = i"
              >
                <img :src="img" alt="" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          <div class="grid grid-cols-4 gap-3">
            <div
              v-for="s in stats"
              :key="s.label"
              class="bg-white/4 border border-white/6 rounded-xl px-3 py-4 flex flex-col items-center gap-2"
            >
              <span class="text-white/30"><component :is="s.icon" :size="16" /></span>
              <p class="text-white text-xl font-medium" :style="SERIF">{{ s.value }}</p>
              <p class="text-white/25 text-[10px] tracking-wide uppercase">{{ s.label }}</p>
            </div>
          </div>

          <div v-if="propiedad.descripcion" class="bg-white/3 border border-white/6 rounded-xl p-5">
            <h2 class="text-white/50 text-xs font-medium tracking-widest uppercase mb-3">Descripción</h2>
            <p class="text-white/60 text-sm leading-relaxed">{{ propiedad.descripcion }}</p>
          </div>

          <div v-if="propiedad.caracteristicas?.length" class="bg-white/3 border border-white/6 rounded-xl p-5">
            <h2 class="text-white/50 text-xs font-medium tracking-widest uppercase mb-4">Características</h2>
            <div class="grid grid-cols-2 gap-2">
              <div v-for="c in propiedad.caracteristicas" :key="c" class="flex items-center gap-2 text-white/50 text-sm">
                <div class="w-4 h-4 rounded-full bg-white/8 flex items-center justify-center shrink-0">
                  <div class="w-1.5 h-1.5 rounded-full bg-[#b8935a]" />
                </div>
                {{ c }}
              </div>
            </div>
          </div>
        </div>

        <!-- ── Right: admin sidebar ── -->
        <div class="lg:col-span-2 flex flex-col gap-4">
          <div class="bg-white/4 border border-white/8 rounded-xl p-5">
            <p class="text-white/30 text-xs tracking-widest uppercase mb-1">Precio</p>
            <p class="text-white text-3xl font-semibold" :style="SERIF">{{ propiedad.precio }}</p>
            <p v-if="propiedad.tipo === 'renta'" class="text-white/25 text-xs mt-0.5">por mes</p>
          </div>

          <!-- Status manager -->
          <div class="bg-white/4 border border-white/8 rounded-xl p-5">
            <div class="flex items-center justify-between mb-4">
              <p class="text-white/30 text-xs tracking-widest uppercase">Estado</p>
              <span v-if="statusChanged" class="flex items-center gap-1 text-emerald-400 text-[10px] font-medium">
                <Check :size="10" /> Guardado
              </span>
            </div>
            <div class="relative">
              <button
                :class="[
                  'w-full flex items-center justify-between px-3.5 py-3 rounded-lg border transition-all duration-150',
                  cfg.badge,
                ]"
                @click="statusMenuOpen = !statusMenuOpen"
              >
                <span class="flex items-center gap-2 text-sm font-medium">
                  <span :class="['w-2 h-2 rounded-full', cfg.dot]" />
                  {{ cfg.singular }}
                </span>
                <ChevronRight :size="13" :class="['transition-transform duration-150', statusMenuOpen ? 'rotate-90' : '']" />
              </button>
              <div
                v-if="statusMenuOpen"
                class="absolute top-full left-0 right-0 mt-1.5 bg-[#1a1a18] border border-white/10 rounded-xl overflow-hidden z-10 shadow-2xl"
              >
                <button
                  v-for="value in estadoOptions"
                  :key="value"
                  :class="[
                    'w-full flex items-center gap-2.5 px-4 py-3 text-sm transition-colors',
                    value === propiedad.estado ? 'bg-white/6 text-white/80' : 'text-white/40 hover:bg-white/4 hover:text-white/60',
                  ]"
                  @click="handleEstadoChange(value)"
                >
                  <span :class="['w-2 h-2 rounded-full', ESTADO_PROPIEDAD[value].dot]" />
                  {{ ESTADO_PROPIEDAD[value].singular }}
                  <Check v-if="value === propiedad.estado" :size="12" class="ml-auto opacity-60" />
                </button>
              </div>
            </div>
          </div>

          <div class="bg-white/4 border border-white/8 rounded-xl p-5">
            <p class="text-white/30 text-xs tracking-widest uppercase mb-4">Agente responsable</p>
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-10 h-10 rounded-full bg-[#b8935a]/20 border border-[#b8935a]/30 flex items-center justify-center text-sm text-[#b8935a] font-semibold shrink-0"
              >
                {{ iniciales(propiedad.agente) }}
              </div>
              <div>
                <p class="text-white/80 text-sm font-medium">{{ propiedad.agente }}</p>
                <p class="text-white/30 text-xs">CANO & Asociados</p>
              </div>
            </div>
            <a
              :href="WHATSAPP_URL"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-sm font-medium hover:bg-[#25D366]/20 transition-all"
            >
              <WhatsAppIcon :size="15" /> Contactar por WhatsApp
            </a>
          </div>

          <div class="bg-white/3 border border-white/6 rounded-xl p-5">
            <p class="text-white/30 text-xs tracking-widest uppercase mb-4">Información</p>
            <div class="flex flex-col gap-3">
              <div v-for="m in meta" :key="m.label" class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-white/25 text-xs"><component :is="m.icon" :size="13" /> {{ m.label }}</div>
                <span class="text-white/50 text-xs font-medium">{{ m.value }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <button
              class="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/6 border border-white/10 text-white/60 text-sm font-medium hover:bg-white/10 hover:text-white/80 transition-all"
              @click="router.push('/admin/panel')"
            >
              <ArrowLeft :size="14" /> Volver al panel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes kenburns {
  0% { transform: scale(1) translateX(0) translateY(0); }
  50% { transform: scale(1.06) translateX(-1%) translateY(-0.5%); }
  100% { transform: scale(1) translateX(0) translateY(0); }
}
.kenburns-img {
  animation: kenburns 10s ease-in-out infinite;
}
</style>
