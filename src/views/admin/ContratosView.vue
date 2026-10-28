<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Edit2, FileSignature, Plus, Printer, X } from 'lucide-vue-next'
import AdminTopBar from '@/components/admin/AdminTopBar.vue'
import AdminLogoutActions from '@/components/admin/AdminLogoutActions.vue'
import { adminPropiedadesService } from '@/services/admin.service'
import {
  plantillasService,
  registrarContratoGenerado,
  rellenarPlantilla,
} from '@/services/modulos.service'
import type { PropiedadAdmin } from '@/types/propiedad'
import type { DatosContrato, PlantillaContrato, TipoContrato } from '@/types/modulos'
import { fechaCorta } from '@/utils/formato'
import { SERIF } from '@/config'

const TIPOS: Record<TipoContrato, { label: string; cls: string }> = {
  compraventa: { label: 'Compraventa', cls: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
  arrendamiento: {
    label: 'Arrendamiento',
    cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  },
  intencion: {
    label: 'Carta de intención',
    cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  },
}
const MARCADORES: (keyof DatosContrato)[] = [
  'propiedad',
  'direccion',
  'precio',
  'propietario',
  'cliente',
  'fecha',
  'ciudad',
]

const plantillas = ref<PlantillaContrato[]>([])
const propiedades = ref<PropiedadAdmin[]>([])
const seleccionadaId = ref<number | null>(null)
const propiedadId = ref<number | null>(null)
const editando = ref<PlantillaContrato | Omit<PlantillaContrato, 'id'> | null>(null)
const generado = ref(false)

const hoy = new Date().toLocaleDateString('es-MX', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const datos = reactive<DatosContrato>({
  propiedad: '',
  direccion: '',
  precio: '',
  propietario: '',
  cliente: '',
  fecha: hoy,
  ciudad: 'Cancún, Quintana Roo',
})

onMounted(async () => {
  ;[plantillas.value, propiedades.value] = await Promise.all([
    plantillasService.listar(),
    adminPropiedadesService.listar(),
  ])
  seleccionadaId.value = plantillas.value[0]?.id ?? null
})

const plantilla = computed(
  () => plantillas.value.find((p) => p.id === seleccionadaId.value) ?? null,
)
const borrador = computed(() =>
  plantilla.value ? rellenarPlantilla(plantilla.value.cuerpo, datos) : '',
)
const faltantes = computed(() => MARCADORES.filter((k) => !datos[k]))

watch(propiedadId, (id) => {
  const p = propiedades.value.find((x) => x.id === id)
  if (!p) return
  datos.propiedad = p.titulo
  datos.direccion = `${p.colonia}${p.ciudad ? `, ${p.ciudad}` : ''}`
  datos.precio = p.precio.replace(' / mes', '')
})
watch([seleccionadaId, () => ({ ...datos })], () => (generado.value = false))

function imprimir() {
  if (!plantilla.value) return
  if (!generado.value) {
    registrarContratoGenerado(plantilla.value, { ...datos })
    generado.value = true
  }
  window.print()
}

async function guardarPlantilla() {
  const e = editando.value
  if (!e || !e.nombre.trim() || !e.cuerpo.trim()) return
  const data = { ...e, actualizada: new Date().toISOString() }
  if ('id' in data) {
    const act = await plantillasService.actualizar(data.id, data)
    plantillas.value = plantillas.value.map((p) => (p.id === act.id ? act : p))
  } else {
    const nueva = await plantillasService.crear(data)
    plantillas.value = [nueva, ...plantillas.value]
    seleccionadaId.value = nueva.id
  }
  editando.value = null
}

const marcador = (m: string) => '{' + '{' + m + '}' + '}'

const nuevaPlantilla = () =>
  (editando.value = {
    nombre: '',
    tipo: 'compraventa',
    descripcion: '',
    cuerpo: '',
    actualizada: new Date().toISOString(),
  })

const inputCls =
  'w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all'
const labelCls = 'block text-white/40 text-xs mb-1.5 tracking-wide'
</script>

<template>
  <div class="min-h-screen bg-[#0d0d0c] font-['DM_Sans',sans-serif]">
    <!-- Editor de plantilla -->
    <div
      v-if="editando"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm no-print"
    >
      <div
        class="bg-[#141413] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div class="flex items-center justify-between p-6 border-b border-white/6">
          <h2 class="text-white text-lg" :style="SERIF">
            {{ 'id' in editando ? 'Editar plantilla' : 'Nueva plantilla' }}
          </h2>
          <button
            class="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5"
            @click="editando = null"
          >
            <X :size="16" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label :class="labelCls">Nombre</label>
              <input v-model="editando.nombre" :class="inputCls" placeholder="Contrato de…" />
            </div>
            <div>
              <label :class="labelCls">Tipo</label>
              <select v-model="editando.tipo" :class="[inputCls, 'appearance-none']">
                <option v-for="(t, k) in TIPOS" :key="k" :value="k" class="bg-[#141413]">
                  {{ t.label }}
                </option>
              </select>
            </div>
          </div>
          <div>
            <label :class="labelCls">Descripción</label>
            <input
              v-model="editando.descripcion"
              :class="inputCls"
              placeholder="Uso de la plantilla"
            />
          </div>
          <div>
            <label :class="labelCls">Texto del contrato</label>
            <textarea
              v-model="editando.cuerpo"
              rows="14"
              :class="[inputCls, 'font-mono text-xs leading-relaxed resize-y']"
            />
            <p class="text-white/25 text-[11px] mt-1.5">
              Marcadores disponibles:
              <code
                v-for="m in MARCADORES"
                :key="m"
                class="text-[#b8935a] mr-1.5"
                v-text="marcador(m)"
              />
            </p>
          </div>
        </div>
        <div class="flex gap-2 p-6 pt-0">
          <button
            class="flex-1 py-2.5 rounded-lg border border-white/8 text-white/40 text-sm hover:bg-white/5"
            @click="editando = null"
          >
            Cancelar
          </button>
          <button
            class="flex-1 py-2.5 rounded-lg bg-white text-[#0d0d0c] text-sm font-medium hover:bg-white/90"
            @click="guardarPlantilla"
          >
            Guardar plantilla
          </button>
        </div>
      </div>
    </div>

    <div class="no-print">
      <AdminTopBar section="Contratos y plantillas" wide>
        <template #actions><AdminLogoutActions /></template>
      </AdminTopBar>
    </div>

    <div class="max-w-screen-2xl mx-auto px-5 py-7">
      <div class="flex items-start justify-between gap-4 flex-wrap mb-6 no-print">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <FileSignature :size="20" class="text-[#b8935a]" />
            <h1 class="text-white text-2xl" :style="SERIF">Contratos y plantillas legales</h1>
          </div>
          <p class="text-white/30 text-sm ml-8">
            Genera borradores prellenados con los datos del inmueble y de las partes.
          </p>
        </div>
        <button
          class="flex items-center gap-2 bg-white text-[#0d0d0c] text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-white/90 transition-all"
          @click="nuevaPlantilla"
        >
          <Plus :size="14" /> Nueva plantilla
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 items-start">
        <div class="flex flex-col gap-5 no-print">
          <!-- Plantillas -->
          <div class="flex flex-col gap-3">
            <p class="text-white/25 text-[10px] font-semibold tracking-widest uppercase">
              Plantillas
            </p>
            <div
              v-for="p in plantillas"
              :key="p.id"
              :class="[
                'rounded-xl border p-4 transition-all cursor-pointer',
                p.id === seleccionadaId
                  ? 'bg-white/8 border-white/20'
                  : 'bg-white/3 border-white/6 hover:border-white/14',
              ]"
              @click="seleccionadaId = p.id"
            >
              <div class="flex items-start justify-between gap-2 mb-2">
                <span
                  :class="[
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                    TIPOS[p.tipo].cls,
                  ]"
                  >{{ TIPOS[p.tipo].label }}</span
                >
                <button
                  class="p-1 rounded-md text-white/25 hover:text-white/60 hover:bg-white/5"
                  title="Editar"
                  @click.stop="editando = { ...p }"
                >
                  <Edit2 :size="12" />
                </button>
              </div>
              <p class="text-white/80 text-sm font-medium">{{ p.nombre }}</p>
              <p class="text-white/30 text-xs mt-1 leading-snug">{{ p.descripcion }}</p>
              <p class="text-white/20 text-[10px] mt-2">
                Actualizada el {{ fechaCorta(p.actualizada) }}
              </p>
            </div>
          </div>

          <!-- Datos -->
          <div class="bg-white/3 border border-white/6 rounded-xl p-5 space-y-4">
            <p class="text-white/25 text-[10px] font-semibold tracking-widest uppercase">
              Datos de la operación
            </p>
            <div>
              <label :class="labelCls">Propiedad del portafolio</label>
              <select v-model="propiedadId" :class="[inputCls, 'appearance-none']">
                <option :value="null" class="bg-[#141413]">Seleccionar…</option>
                <option v-for="p in propiedades" :key="p.id" :value="p.id" class="bg-[#141413]">
                  {{ p.titulo }}
                </option>
              </select>
            </div>
            <div>
              <label :class="labelCls">Dirección</label>
              <input
                v-model="datos.direccion"
                :class="inputCls"
                placeholder="Calle, colonia, ciudad"
              />
            </div>
            <div>
              <label :class="labelCls">Precio pactado</label>
              <input v-model="datos.precio" :class="inputCls" placeholder="$0" />
            </div>
            <div>
              <label :class="labelCls">Propietario</label>
              <input v-model="datos.propietario" :class="inputCls" placeholder="Nombre completo" />
            </div>
            <div>
              <label :class="labelCls">Comprador / arrendatario</label>
              <input v-model="datos.cliente" :class="inputCls" placeholder="Nombre completo" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label :class="labelCls">Fecha</label>
                <input v-model="datos.fecha" :class="inputCls" />
              </div>
              <div>
                <label :class="labelCls">Lugar de firma</label>
                <input v-model="datos.ciudad" :class="inputCls" />
              </div>
            </div>
            <p v-if="faltantes.length" class="text-amber-400/70 text-[11px]">
              Faltan: {{ faltantes.join(', ') }}.
            </p>
            <button
              :disabled="!plantilla"
              class="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#b8935a] text-[#0d0d0c] text-sm font-semibold hover:bg-[#c9a46b] transition-all disabled:opacity-50"
              @click="imprimir"
            >
              <Printer :size="14" /> Imprimir / guardar PDF
            </button>
          </div>
        </div>

        <!-- Vista del documento -->
        <article
          v-if="plantilla"
          class="print-area bg-[#fdfaf7] text-[#1a1714] rounded-xl shadow-2xl px-10 py-12 min-h-[640px]"
        >
          <p class="text-center text-[10px] tracking-[0.3em] uppercase text-[#a89f95] mb-8">
            MU Real Estate · Cano &amp; Asociados — Borrador
          </p>
          <div
            class="whitespace-pre-wrap text-[13px] leading-7"
            style="font-family: Georgia, 'Times New Roman', serif"
          >
            {{ borrador }}
          </div>
          <div class="grid grid-cols-2 gap-10 mt-16 text-center text-xs text-[#7a7067]">
            <div class="border-t border-[#1a1714]/40 pt-2">
              {{ datos.propietario || 'Propietario' }}
            </div>
            <div class="border-t border-[#1a1714]/40 pt-2">{{ datos.cliente || 'Cliente' }}</div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>
