<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ClipboardCheck, Eye, KeyRound, Plus, Printer, X } from 'lucide-vue-next'
import AdminTopBar from '@/components/admin/AdminTopBar.vue'
import AdminLogoutActions from '@/components/admin/AdminLogoutActions.vue'
import SignaturePad from '@/components/admin/SignaturePad.vue'
import { adminPropiedadesService } from '@/services/admin.service'
import { actasService } from '@/services/modulos.service'
import { ELEMENTOS_CHECKLIST } from '@/mocks/modulos'
import { useAuthStore } from '@/stores/auth'
import type { PropiedadAdmin } from '@/types/propiedad'
import type { ActaEntrega, EstadoElemento, TipoActa } from '@/types/modulos'
import { fechaCorta } from '@/utils/formato'
import { SERIF } from '@/config'

const ESTADOS: Record<EstadoElemento, { label: string; activo: string }> = {
  bueno: { label: 'Bueno', activo: 'bg-emerald-400/15 border-emerald-400/40 text-emerald-300' },
  regular: { label: 'Regular', activo: 'bg-amber-400/15 border-amber-400/40 text-amber-300' },
  malo: { label: 'Malo', activo: 'bg-red-400/15 border-red-400/40 text-red-300' },
  na: { label: 'N/A', activo: 'bg-white/10 border-white/25 text-white/70' },
}

const auth = useAuthStore()
const actas = ref<ActaEntrega[]>([])
const propiedades = ref<PropiedadAdmin[]>([])
const formAbierto = ref(false)
const viendo = ref<ActaEntrega | null>(null)
const errores = ref<string[]>([])

onMounted(async () => {
  ;[actas.value, propiedades.value] = await Promise.all([
    actasService.listar(),
    adminPropiedadesService.listar(),
  ])
})

const nueva = (): Omit<ActaEntrega, 'id'> => ({
  tipo: 'entrega',
  propiedad: '',
  fecha: new Date().toISOString().slice(0, 10),
  asesor: auth.usuario ? `${auth.usuario.nombre} ${auth.usuario.apellido}` : '',
  cliente: '',
  llaves: 2,
  lecturas: { luz: '', agua: '', gas: '' },
  elementos: ELEMENTOS_CHECKLIST.flatMap((c) =>
    c.elementos.map((e) => ({
      categoria: c.categoria,
      elemento: e,
      estado: 'bueno' as EstadoElemento,
      nota: '',
    })),
  ),
  observaciones: '',
  firmaCliente: undefined,
  firmaAsesor: undefined,
})
const form = reactive(nueva())

function abrirForm() {
  Object.assign(form, nueva())
  errores.value = []
  formAbierto.value = true
}

async function guardar() {
  const faltan: string[] = []
  if (!form.propiedad) faltan.push('propiedad')
  if (!form.cliente.trim()) faltan.push('nombre del cliente')
  if (form.elementos.some((e) => (e.estado === 'regular' || e.estado === 'malo') && !e.nota.trim()))
    faltan.push('nota en los elementos en estado regular o malo')
  if (!form.firmaCliente) faltan.push('firma del cliente')
  if (!form.firmaAsesor) faltan.push('firma del asesor')
  errores.value = faltan
  if (faltan.length) return
  const acta = await actasService.crear(JSON.parse(JSON.stringify(form)))
  actas.value = [acta, ...actas.value]
  formAbierto.value = false
  viendo.value = acta
}

const resumen = (a: ActaEntrega) => ({
  incidencias: a.elementos.filter((e) => e.estado === 'regular' || e.estado === 'malo').length,
  revisados: a.elementos.filter((e) => e.estado !== 'na').length,
})

const imprimir = () => window.print()

const categorias = computed(() => ELEMENTOS_CHECKLIST.map((c) => c.categoria))
const tipoLabel = (t: TipoActa) =>
  t === 'entrega' ? 'Entrega (check-in)' : 'Recepción (check-out)'

const inputCls =
  'w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all'
const labelCls = 'block text-white/40 text-xs mb-1.5'
</script>

<template>
  <div class="min-h-screen bg-[#0d0d0c] font-['DM_Sans',sans-serif]">
    <!-- Formulario -->
    <div
      v-if="formAbierto"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 no-print"
    >
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="formAbierto = false" />
      <div
        class="relative bg-[#141413] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl"
      >
        <div
          class="sticky top-0 bg-[#141413] border-b border-white/6 px-6 py-4 flex items-center justify-between z-10"
        >
          <h2 class="text-white text-lg" :style="SERIF">Nueva acta de entrega / recepción</h2>
          <button
            class="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5"
            @click="formAbierto = false"
          >
            <X :size="16" />
          </button>
        </div>

        <div class="p-6 space-y-6">
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="t in ['entrega', 'recepcion'] as const"
              :key="t"
              :class="[
                'py-2.5 rounded-lg text-sm font-medium border transition-all',
                form.tipo === t
                  ? 'bg-white text-[#0d0d0c] border-white'
                  : 'text-white/40 border-white/10 hover:border-white/20',
              ]"
              @click="form.tipo = t"
            >
              {{ tipoLabel(t) }}
            </button>
          </div>

          <div class="grid sm:grid-cols-2 gap-3">
            <div class="sm:col-span-2">
              <label :class="labelCls">Propiedad *</label>
              <select v-model="form.propiedad" :class="[inputCls, 'appearance-none']">
                <option value="" class="bg-[#141413]">Seleccionar…</option>
                <option v-for="p in propiedades" :key="p.id" :value="p.titulo" class="bg-[#141413]">
                  {{ p.titulo }}
                </option>
              </select>
            </div>
            <div>
              <label :class="labelCls"
                >{{ form.tipo === 'entrega' ? 'Recibe (cliente)' : 'Entrega (cliente)' }} *</label
              >
              <input v-model="form.cliente" :class="inputCls" placeholder="Nombre completo" />
            </div>
            <div>
              <label :class="labelCls">Asesor</label>
              <input v-model="form.asesor" :class="inputCls" />
            </div>
            <div>
              <label :class="labelCls">Fecha</label>
              <input v-model="form.fecha" type="date" :class="inputCls" />
            </div>
            <div>
              <label :class="labelCls">Juegos de llaves</label>
              <input v-model.number="form.llaves" type="number" min="0" :class="inputCls" />
            </div>
          </div>

          <div>
            <p class="text-white/25 text-[10px] font-semibold tracking-widest uppercase mb-3">
              Lecturas de medidores
            </p>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label :class="labelCls">Luz (kWh)</label
                ><input v-model="form.lecturas.luz" :class="inputCls" />
              </div>
              <div>
                <label :class="labelCls">Agua (m³)</label
                ><input v-model="form.lecturas.agua" :class="inputCls" />
              </div>
              <div>
                <label :class="labelCls">Gas (%)</label
                ><input v-model="form.lecturas.gas" :class="inputCls" />
              </div>
            </div>
          </div>

          <div v-for="cat in categorias" :key="cat">
            <p class="text-white/25 text-[10px] font-semibold tracking-widest uppercase mb-2">
              {{ cat }}
            </p>
            <div class="flex flex-col gap-2">
              <div
                v-for="e in form.elementos.filter((x) => x.categoria === cat)"
                :key="e.elemento"
                class="bg-white/3 border border-white/6 rounded-lg px-3 py-2.5"
              >
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-white/70 text-sm flex-1 min-w-[140px]">{{ e.elemento }}</span>
                  <button
                    v-for="(cfg, est) in ESTADOS"
                    :key="est"
                    type="button"
                    :class="[
                      'text-[11px] px-2.5 py-1 rounded-full border transition-all',
                      e.estado === est
                        ? cfg.activo
                        : 'border-white/8 text-white/30 hover:border-white/20',
                    ]"
                    @click="e.estado = est"
                  >
                    {{ cfg.label }}
                  </button>
                </div>
                <input
                  v-if="e.estado === 'regular' || e.estado === 'malo'"
                  v-model="e.nota"
                  :class="[inputCls, 'mt-2 text-xs']"
                  placeholder="Describe el detalle encontrado…"
                />
              </div>
            </div>
          </div>

          <div>
            <label :class="labelCls">Observaciones generales</label>
            <textarea v-model="form.observaciones" rows="3" :class="[inputCls, 'resize-none']" />
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <SignaturePad v-model="form.firmaCliente" label="Firma del cliente *" />
            <SignaturePad v-model="form.firmaAsesor" label="Firma del asesor *" />
          </div>
        </div>

        <div
          class="sticky bottom-0 bg-[#141413] border-t border-white/6 px-6 py-4 flex items-center justify-end gap-3"
        >
          <p v-if="errores.length" class="text-red-400 text-xs mr-auto">
            Falta: {{ errores.join(', ') }}.
          </p>
          <button
            class="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/40 text-sm hover:bg-white/10"
            @click="formAbierto = false"
          >
            Cancelar
          </button>
          <button
            class="px-5 py-2 rounded-lg bg-[#b8935a] text-[#0d0d0c] text-sm font-semibold hover:bg-[#c9a46b]"
            @click="guardar"
          >
            Guardar acta firmada
          </button>
        </div>
      </div>
    </div>

    <!-- Acta para consulta / impresión -->
    <div
      v-if="viendo"
      class="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-black/70 backdrop-blur-sm"
    >
      <div class="relative w-full max-w-3xl my-6">
        <div class="flex justify-end gap-2 mb-3 no-print">
          <button
            class="flex items-center gap-2 bg-white text-[#0d0d0c] text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/90"
            @click="imprimir"
          >
            <Printer :size="14" /> Imprimir / PDF
          </button>
          <button
            class="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20"
            @click="viendo = null"
          >
            <X :size="16" />
          </button>
        </div>
        <article class="print-area bg-[#fdfaf7] text-[#1a1714] rounded-xl px-10 py-10">
          <p class="text-[10px] tracking-[0.3em] uppercase text-[#a89f95] mb-2">
            MU Real Estate · Cano &amp; Asociados
          </p>
          <h2 class="text-2xl mb-1" :style="SERIF">
            Acta de {{ viendo.tipo === 'entrega' ? 'entrega' : 'recepción' }} de inmueble
          </h2>
          <p class="text-sm text-[#7a7067] mb-6">
            {{ viendo.propiedad }} · {{ fechaCorta(viendo.fecha + 'T12:00:00') }}
          </p>
          <div class="grid grid-cols-2 gap-x-8 gap-y-1 text-sm mb-6">
            <p><span class="text-[#a89f95]">Cliente:</span> {{ viendo.cliente }}</p>
            <p><span class="text-[#a89f95]">Asesor:</span> {{ viendo.asesor }}</p>
            <p><span class="text-[#a89f95]">Llaves entregadas:</span> {{ viendo.llaves }}</p>
            <p>
              <span class="text-[#a89f95]">Medidores:</span> luz {{ viendo.lecturas.luz || '—' }} ·
              agua {{ viendo.lecturas.agua || '—' }} · gas
              {{ viendo.lecturas.gas || '—' }}
            </p>
          </div>
          <table class="w-full text-sm mb-6">
            <thead>
              <tr
                class="border-b border-[#1a1714]/15 text-left text-[11px] uppercase tracking-wider text-[#7a7067]"
              >
                <th class="py-2 font-medium">Elemento</th>
                <th class="py-2 font-medium w-24">Estado</th>
                <th class="py-2 font-medium">Nota</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="e in viendo.elementos"
                :key="e.categoria + e.elemento"
                class="border-b border-[#1a1714]/6"
              >
                <td class="py-1.5">
                  {{ e.elemento }} <span class="text-[#a89f95] text-xs">· {{ e.categoria }}</span>
                </td>
                <td class="py-1.5">{{ ESTADOS[e.estado].label }}</td>
                <td class="py-1.5 text-[#7a7067]">{{ e.nota }}</td>
              </tr>
            </tbody>
          </table>
          <p v-if="viendo.observaciones" class="text-sm mb-8">
            <span class="text-[#a89f95]">Observaciones:</span> {{ viendo.observaciones }}
          </p>
          <div class="grid grid-cols-2 gap-10 text-center text-xs text-[#7a7067]">
            <div>
              <img
                v-if="viendo.firmaCliente"
                :src="viendo.firmaCliente"
                alt="Firma del cliente"
                class="h-20 mx-auto object-contain"
              />
              <div v-else class="h-20" />
              <div class="border-t border-[#1a1714]/40 pt-2">{{ viendo.cliente }}</div>
            </div>
            <div>
              <img
                v-if="viendo.firmaAsesor"
                :src="viendo.firmaAsesor"
                alt="Firma del asesor"
                class="h-20 mx-auto object-contain"
              />
              <div v-else class="h-20" />
              <div class="border-t border-[#1a1714]/40 pt-2">{{ viendo.asesor }}</div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <div class="no-print">
      <AdminTopBar section="Entrega de inmuebles" wide>
        <template #actions><AdminLogoutActions /></template>
      </AdminTopBar>

      <div class="max-w-screen-2xl mx-auto px-5 py-7">
        <div class="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <KeyRound :size="20" class="text-[#b8935a]" />
              <h1 class="text-white text-2xl" :style="SERIF">Entrega y recepción de inmuebles</h1>
            </div>
            <p class="text-white/30 text-sm ml-8">
              Lista de cotejo del estado físico del inmueble con firmas de conformidad.
            </p>
          </div>
          <button
            class="flex items-center gap-2 bg-[#b8935a] text-[#0d0d0c] text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#c9a46b] transition-all"
            @click="abrirForm"
          >
            <Plus :size="15" /> Nueva acta
          </button>
        </div>

        <div
          v-if="!actas.length"
          class="border border-dashed border-white/8 rounded-xl py-16 flex flex-col items-center gap-2"
        >
          <ClipboardCheck :size="22" class="text-white/15" />
          <p class="text-white/20 text-sm">Aún no hay actas registradas.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div
            v-for="a in actas"
            :key="a.id"
            class="bg-white/4 border border-white/8 rounded-xl p-5 hover:border-white/14 transition-all"
          >
            <div class="flex items-start justify-between gap-2 mb-3">
              <span
                :class="[
                  'text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border',
                  a.tipo === 'entrega'
                    ? 'text-sky-400 bg-sky-400/10 border-sky-400/20'
                    : 'text-violet-400 bg-violet-400/10 border-violet-400/20',
                ]"
              >
                {{ tipoLabel(a.tipo) }}
              </span>
              <span class="text-white/25 text-[11px]">{{ fechaCorta(a.fecha + 'T12:00:00') }}</span>
            </div>
            <p class="text-white/80 text-sm font-medium mb-1" :style="SERIF">{{ a.propiedad }}</p>
            <p class="text-white/35 text-xs mb-4">{{ a.cliente }} · asesor {{ a.asesor }}</p>
            <div class="flex items-center gap-4 text-xs mb-4">
              <span class="text-white/40">{{ resumen(a).revisados }} elementos revisados</span>
              <span :class="resumen(a).incidencias ? 'text-amber-400' : 'text-emerald-400'">
                {{
                  resumen(a).incidencias
                    ? `${resumen(a).incidencias} con detalles`
                    : 'Sin incidencias'
                }}
              </span>
            </div>
            <button
              class="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/6 border border-white/10 text-white/60 text-xs font-medium hover:bg-white/10 transition-all"
              @click="viendo = a"
            >
              <Eye :size="12" /> Ver acta
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
