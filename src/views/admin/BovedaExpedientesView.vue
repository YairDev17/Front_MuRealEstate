<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileCheck2,
  FileText,
  FileX2,
  FolderLock,
  Lock,
  Mail,
  Search,
  Upload,
  XCircle,
} from 'lucide-vue-next'
import AdminTopBar from '@/components/admin/AdminTopBar.vue'
import AdminLogoutActions from '@/components/admin/AdminLogoutActions.vue'
import MotivoModal from '@/components/admin/MotivoModal.vue'
import LoadingDots from '@/components/ui/LoadingDots.vue'
import {
  DOCUMENTOS_REQUERIDOS,
  ETIQUETA_DOCUMENTO,
  expedientesService,
} from '@/services/modulos.service'
import type { DocumentoLegal, EstadoDocumento, Expediente, TipoDocumento } from '@/types/modulos'
import { fechaCorta, tamanoArchivo } from '@/utils/formato'
import { SERIF } from '@/config'

const MAX_MB = 10
const ESTADO_DOC: Record<
  EstadoDocumento,
  { label: string; color: string; bg: string; icon: unknown }
> = {
  pendiente: {
    label: 'Por validar',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/20',
    icon: AlertTriangle,
  },
  validado: {
    label: 'Validado',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
    icon: FileCheck2,
  },
  rechazado: {
    label: 'Rechazado',
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/20',
    icon: FileX2,
  },
}
const SUGERENCIAS = [
  'El documento es ilegible o está incompleto.',
  'El documento está vencido.',
  'El nombre no coincide con el del propietario.',
  'Se requiere el documento completo, no una captura parcial.',
]

const expedientes = ref<Expediente[]>([])
const seleccionadoId = ref<number | null>(null)
const busqueda = ref('')
const rechazando = ref<DocumentoLegal | null>(null)
const tipoCarga = ref<TipoDocumento>('identificacion')
const subiendo = ref(false)
const errorCarga = ref('')
const inputArchivo = ref<HTMLInputElement>()

onMounted(async () => {
  expedientes.value = await expedientesService.listar()
  seleccionadoId.value = expedientes.value[0]?.id ?? null
})

const filtrados = computed(() => {
  const q = busqueda.value.toLowerCase()
  return expedientes.value.filter((e) =>
    `${e.propiedad} ${e.propietario} ${e.colonia}`.toLowerCase().includes(q),
  )
})
const actual = computed(() => expedientes.value.find((e) => e.id === seleccionadoId.value) ?? null)

/** Estado de cada documento requerido según el último archivo cargado de ese tipo. */
function requeridos(e: Expediente) {
  return DOCUMENTOS_REQUERIDOS.map((tipo) => {
    const docs = e.documentos.filter((d) => d.tipo === tipo)
    return { tipo, estado: (docs.at(-1)?.estado ?? 'faltante') as EstadoDocumento | 'faltante' }
  })
}
const validados = (e: Expediente) => requeridos(e).filter((r) => r.estado === 'validado').length

function resumen(e: Expediente) {
  const req = requeridos(e)
  if (req.every((r) => r.estado === 'validado'))
    return { label: 'Completo', cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' }
  if (req.some((r) => r.estado === 'rechazado'))
    return { label: 'Con observaciones', cls: 'text-red-400 bg-red-400/10 border-red-400/20' }
  if (req.some((r) => r.estado === 'faltante'))
    return { label: 'Incompleto', cls: 'text-white/40 bg-white/5 border-white/10' }
  return { label: 'Por validar', cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20' }
}

function reemplazar(e: Expediente) {
  expedientes.value = expedientes.value.map((x) => (x.id === e.id ? e : x))
}

async function validar(d: DocumentoLegal) {
  if (actual.value) reemplazar(await expedientesService.validar(actual.value, d))
}

async function confirmarRechazo(obs: string) {
  if (actual.value && rechazando.value)
    reemplazar(await expedientesService.rechazar(actual.value, rechazando.value, obs))
  rechazando.value = null
}

async function cargar(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (inputArchivo.value) inputArchivo.value.value = ''
  if (!file || !actual.value) return
  if (!/\.(pdf|jpe?g|png)$/i.test(file.name))
    return (errorCarga.value = 'Solo se aceptan archivos PDF, JPG o PNG.')
  if (file.size > MAX_MB * 1024 * 1024)
    return (errorCarga.value = `El archivo supera ${MAX_MB} MB.`)
  errorCarga.value = ''
  subiendo.value = true
  try {
    reemplazar(await expedientesService.cargar(actual.value.id, tipoCarga.value, file))
  } finally {
    subiendo.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0d0d0c] font-['DM_Sans',sans-serif]">
    <MotivoModal
      v-if="rechazando"
      titulo="Rechazar documento"
      :descripcion="`${ETIQUETA_DOCUMENTO[rechazando.tipo]} · ${rechazando.archivo}. El propietario recibirá estas observaciones para corregirlo.`"
      :sugerencias="SUGERENCIAS"
      @close="rechazando = null"
      @confirm="confirmarRechazo"
    />

    <AdminTopBar section="Bóveda de expedientes" wide>
      <template #actions><AdminLogoutActions /></template>
    </AdminTopBar>

    <div class="max-w-screen-2xl mx-auto px-5 py-7">
      <div class="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <FolderLock :size="20" class="text-[#b8935a]" />
            <h1 class="text-white text-2xl" :style="SERIF">Bóveda digital de expedientes</h1>
          </div>
          <p class="text-white/30 text-sm ml-8">
            Documentación legal que acredita a cada propietario antes de publicar su inmueble.
          </p>
        </div>
        <div
          class="flex items-center gap-2 bg-white/4 border border-white/8 rounded-lg px-3.5 py-2 text-xs text-white/40"
        >
          <Lock :size="12" class="text-[#b8935a]" /> Acceso restringido · cada consulta queda en la
          bitácora
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
        <!-- Lista -->
        <div class="flex flex-col gap-3">
          <div
            class="flex items-center bg-white/5 border border-white/8 rounded-lg px-3 py-2 gap-2"
          >
            <Search :size="13" class="text-white/20 shrink-0" />
            <input
              v-model="busqueda"
              type="text"
              placeholder="Buscar propiedad o propietario..."
              class="flex-1 bg-transparent text-xs text-white placeholder-white/20 outline-none"
            />
          </div>
          <button
            v-for="e in filtrados"
            :key="e.id"
            :class="[
              'text-left rounded-xl border p-4 transition-all',
              e.id === seleccionadoId
                ? 'bg-white/8 border-white/20'
                : 'bg-white/3 border-white/6 hover:border-white/14',
            ]"
            @click="seleccionadoId = e.id"
          >
            <div class="flex items-start justify-between gap-2 mb-2">
              <p class="text-white/80 text-sm font-medium leading-tight" :style="SERIF">
                {{ e.propiedad }}
              </p>
              <span
                :class="[
                  'shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                  resumen(e).cls,
                ]"
              >
                {{ resumen(e).label }}
              </span>
            </div>
            <p class="text-white/30 text-xs mb-3">{{ e.propietario }} · {{ e.colonia }}</p>
            <div class="flex items-center gap-2">
              <div class="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                <div
                  class="h-full bg-emerald-400 transition-all"
                  :style="{ width: `${(validados(e) / DOCUMENTOS_REQUERIDOS.length) * 100}%` }"
                />
              </div>
              <span class="text-white/30 text-[10px]"
                >{{ validados(e) }}/{{ DOCUMENTOS_REQUERIDOS.length }}</span
              >
            </div>
          </button>
        </div>

        <!-- Detalle -->
        <div v-if="actual" class="flex flex-col gap-4">
          <div
            class="bg-white/4 border border-white/8 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4"
          >
            <div>
              <p class="text-white text-lg" :style="SERIF">{{ actual.propiedad }}</p>
              <p class="text-white/40 text-xs flex items-center gap-1.5 mt-1">
                {{ actual.propietario }} · <Mail :size="11" /> {{ actual.correoPropietario }}
              </p>
            </div>
            <div class="flex gap-2">
              <span
                v-for="r in requeridos(actual)"
                :key="r.tipo"
                :class="[
                  'flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border',
                  r.estado === 'faltante'
                    ? 'text-white/30 bg-white/3 border-white/8'
                    : [ESTADO_DOC[r.estado].bg, ESTADO_DOC[r.estado].color],
                ]"
              >
                <CheckCircle2 v-if="r.estado === 'validado'" :size="11" />
                <XCircle
                  v-else-if="r.estado === 'rechazado' || r.estado === 'faltante'"
                  :size="11"
                />
                <AlertTriangle v-else :size="11" />
                {{ ETIQUETA_DOCUMENTO[r.tipo].split(' ')[0] }}
              </span>
            </div>
          </div>

          <div class="bg-white/2 border border-white/6 rounded-xl overflow-hidden">
            <div
              v-for="d in [...actual.documentos].reverse()"
              :key="d.id"
              class="flex flex-wrap items-center gap-4 px-5 py-4 border-b border-white/4 last:border-b-0"
            >
              <div
                class="w-10 h-10 rounded-lg bg-white/6 flex items-center justify-center text-white/40 shrink-0"
              >
                <FileText :size="16" />
              </div>
              <div class="flex-1 min-w-[180px]">
                <p class="text-white/80 text-sm">{{ ETIQUETA_DOCUMENTO[d.tipo] }}</p>
                <p class="text-white/30 text-xs">
                  {{ d.archivo }} · {{ tamanoArchivo(d.tamano) }} · {{ fechaCorta(d.fechaCarga) }}
                </p>
                <p v-if="d.observaciones" class="text-red-300/70 text-[11px] mt-1">
                  {{ d.observaciones }}
                </p>
              </div>
              <span
                :class="[
                  'flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border',
                  ESTADO_DOC[d.estado].bg,
                  ESTADO_DOC[d.estado].color,
                ]"
              >
                <component :is="ESTADO_DOC[d.estado].icon" :size="10" />
                {{ ESTADO_DOC[d.estado].label }}
              </span>
              <div class="flex items-center gap-1.5">
                <a
                  v-if="d.url"
                  :href="d.url"
                  target="_blank"
                  rel="noopener"
                  class="p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
                  title="Ver documento"
                >
                  <Eye :size="14" />
                </a>
                <span
                  v-else
                  class="p-2 text-white/10"
                  title="Vista previa no disponible con datos de prueba"
                  ><Eye :size="14"
                /></span>
                <template v-if="d.estado === 'pendiente'">
                  <button
                    class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-medium hover:bg-emerald-400/20 transition-all"
                    @click="validar(d)"
                  >
                    <CheckCircle2 :size="12" /> Validar
                  </button>
                  <button
                    class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-medium hover:bg-red-400/20 transition-all"
                    @click="rechazando = d"
                  >
                    <XCircle :size="12" /> Rechazar
                  </button>
                </template>
              </div>
            </div>
            <p
              v-if="!actual.documentos.length"
              class="px-5 py-10 text-center text-white/20 text-sm"
            >
              Sin documentos cargados.
            </p>
          </div>

          <div
            class="bg-white/2 border border-dashed border-white/10 rounded-xl p-5 flex flex-wrap items-center gap-3"
          >
            <Upload :size="16" class="text-white/30" />
            <p class="text-white/50 text-sm mr-auto">Cargar documento al expediente</p>
            <select
              v-model="tipoCarga"
              class="bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/20 appearance-none"
            >
              <option
                v-for="(label, tipo) in ETIQUETA_DOCUMENTO"
                :key="tipo"
                :value="tipo"
                class="bg-[#141413]"
              >
                {{ label }}
              </option>
            </select>
            <button
              :disabled="subiendo"
              class="flex items-center gap-2 bg-white text-[#0d0d0c] text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/90 transition-all disabled:opacity-60"
              @click="inputArchivo?.click()"
            >
              <LoadingDots v-if="subiendo" dot-class="bg-[#0d0d0c]/50" />
              <template v-else><Upload :size="13" /> Seleccionar archivo</template>
            </button>
            <input
              ref="inputArchivo"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              class="hidden"
              @change="cargar"
            />
            <p class="w-full text-[11px]" :class="errorCarga ? 'text-red-400' : 'text-white/20'">
              {{
                errorCarga ||
                `PDF, JPG o PNG · máximo ${MAX_MB} MB. Requeridos: identificación, escrituras y predial.`
              }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
