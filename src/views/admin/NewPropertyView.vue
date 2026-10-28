<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  Bath,
  Bed,
  CalendarDays,
  Car,
  CheckCircle2,
  DollarSign,
  Image,
  MapPin,
  Maximize2,
  Package,
  Plus,
  ShieldCheck,
  Tag,
  X,
} from 'lucide-vue-next'
import ImageUpload from '@/components/publicar/ImageUpload.vue'
import NumberInput from '@/components/publicar/NumberInput.vue'
import LoadingDots from '@/components/ui/LoadingDots.vue'
import { AMENIDADES, BIENES_CATEGORIAS } from '@/constants/catalogos'
import { adminPropiedadesService } from '@/services/admin.service'
import { useAuthStore } from '@/stores/auth'
import type { EstadoPropiedad, PropiedadFormData } from '@/types/propiedad'
import { SERIF } from '@/config'

const router = useRouter()
const auth = useAuthStore()

const OPERACIONES_ADMIN = [
  { key: 'venta', label: 'En Venta' },
  { key: 'renta', label: 'En Renta' },
  { key: 'preventa', label: 'Preventa' },
  { key: 'traspaso', label: 'Traspaso' },
] as const

const ESTADOS_INICIALES: { val: EstadoPropiedad; label: string; dot: string }[] = [
  { val: 'en-revision', label: 'En revisión', dot: 'bg-sky-400' },
  { val: 'por-listar', label: 'Por listar', dot: 'bg-amber-400' },
  { val: 'listada', label: 'Publicar directamente', dot: 'bg-emerald-400' },
]

const form = reactive<PropiedadFormData>({
  nombre: '',
  operacion: 'venta',
  tipoInmueble: '',
  precio: '',
  descripcion: '',
  calle: '',
  colonia: '',
  ciudad: 'CDMX',
  habitaciones: 1,
  banos: 1,
  estacionamientos: 1,
  m2: '',
  antiguedad: '',
  caracteristicas: [],
  bienes: [],
  imagenes: [],
})
const estadoInicial = ref<EstadoPropiedad>('en-revision')
const customCar = ref('')
const customBien = ref('')
const saving = ref(false)
const saved = ref(false)
const error = ref('')

const inputCls =
  'w-full bg-white/4 border border-white/8 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 focus:border-white/20 focus:bg-white/6'
const smallInputCls =
  'flex-1 bg-white/4 border border-white/8 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20'
const labelCls = 'text-white/40 text-xs font-medium tracking-widest uppercase mb-1.5 block'
const sectionCls = 'bg-white/2 border border-white/6 rounded-2xl p-6'
const noSpinCls =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'

const chipBtn = (selected: boolean) => [
  'text-xs px-3 py-1.5 rounded-full border transition-all duration-150',
  selected
    ? 'bg-white text-[#0d0d0c] border-white'
    : 'bg-transparent text-white/35 border-white/10 hover:border-white/25 hover:text-white/55',
]

function toggle(list: string[], v: string) {
  const i = list.indexOf(v)
  if (i >= 0) list.splice(i, 1)
  else list.push(v)
}

function addCar() {
  const v = customCar.value.trim()
  if (v && !form.caracteristicas.includes(v)) form.caracteristicas.push(v)
  customCar.value = ''
}

function addBien() {
  const v = customBien.value.trim()
  if (v && !form.bienes.includes(v)) form.bienes.push(v)
  customBien.value = ''
}

const previewUrl = computed(() => (form.imagenes[0] ? URL.createObjectURL(form.imagenes[0]) : ''))

async function handleSave() {
  if (!form.nombre.trim()) {
    error.value = 'Ingresa el nombre de la propiedad.'
    return
  }
  saving.value = true
  error.value = ''
  try {
    await adminPropiedadesService.crearDesdeFormulario(
      { ...form },
      {
        estado: estadoInicial.value,
        agente: auth.usuario ? `${auth.usuario.nombre} ${auth.usuario.apellido}` : 'Administrador',
      },
    )
    saved.value = true
    setTimeout(() => router.push('/admin/panel'), 1400)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo guardar la propiedad.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0d0d0c] font-['DM_Sans',sans-serif]">
    <nav class="sticky top-0 z-40 bg-[#111210]/90 backdrop-blur-md border-b border-white/6">
      <div
        class="max-w-screen-xl mx-auto px-5 flex items-center justify-between gap-4"
        style="height: 60px"
      >
        <div class="flex items-center gap-3">
          <div class="w-7 h-7 rounded-full border border-white/15 flex items-center justify-center">
            <ShieldCheck :size="13" class="text-white/60" />
          </div>
          <span class="text-white/50 text-sm tracking-widest uppercase" :style="SERIF"
            >MU Real Estate · Admin</span
          >
        </div>
        <button
          class="flex items-center gap-2 text-white/30 hover:text-white/60 text-sm transition-colors"
          @click="router.push('/admin/panel')"
        >
          <ArrowLeft :size="14" /> Volver al panel
        </button>
      </div>
    </nav>

    <div class="max-w-screen-xl mx-auto px-5 py-8">
      <div class="mb-8">
        <button
          class="flex items-center gap-2 text-white/25 hover:text-white/50 text-xs mb-4 transition-colors"
          @click="router.push('/admin/panel')"
        >
          <ArrowLeft :size="12" /> Panel
        </button>
        <h1 class="text-white text-2xl" :style="SERIF">Nueva Propiedad</h1>
        <p class="text-white/30 text-sm mt-1">
          Completa la información para publicar la propiedad en el portafolio.
        </p>
      </div>

      <div class="grid lg:grid-cols-[1fr_320px] gap-8">
        <!-- ── Left: main form ── -->
        <div class="flex flex-col gap-7">
          <section :class="sectionCls">
            <div class="flex items-center gap-2.5 mb-5">
              <Image :size="15" class="text-white/30" />
              <h2 class="text-white/70 text-sm font-medium tracking-wide">Imágenes</h2>
            </div>
            <ImageUpload v-model="form.imagenes" variant="dark" />
          </section>

          <section :class="sectionCls">
            <div class="flex items-center gap-2.5 mb-5">
              <Tag :size="15" class="text-white/30" />
              <h2 class="text-white/70 text-sm font-medium tracking-wide">Datos generales</h2>
            </div>
            <div class="flex flex-col gap-5">
              <div>
                <label :class="labelCls">Nombre de la propiedad</label>
                <input
                  v-model="form.nombre"
                  type="text"
                  placeholder="Ej. Casa Contemporánea en Lomas"
                  :class="inputCls"
                />
              </div>

              <div>
                <label :class="labelCls">Tipo de operación</label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="op in OPERACIONES_ADMIN"
                    :key="op.key"
                    type="button"
                    :class="[
                      'py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border',
                      form.operacion === op.key
                        ? 'bg-white text-[#0d0d0c] border-white'
                        : 'bg-transparent text-white/30 border-white/10 hover:border-white/20 hover:text-white/50',
                    ]"
                    @click="form.operacion = op.key"
                  >
                    {{ op.label }}
                  </button>
                </div>
              </div>

              <div>
                <label :class="labelCls">
                  Precio {{ form.operacion === 'renta' ? '(mensual)' : ''
                  }}{{ form.operacion === 'preventa' ? '(desde)' : '' }}
                </label>
                <div class="relative">
                  <DollarSign
                    :size="14"
                    class="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20"
                  />
                  <input
                    v-model="form.precio"
                    type="text"
                    :placeholder="form.operacion === 'venta' ? '12,500,000' : '38,000'"
                    :class="[inputCls, 'pl-9']"
                  />
                </div>
              </div>

              <div>
                <label :class="labelCls">Descripción</label>
                <textarea
                  v-model="form.descripcion"
                  rows="3"
                  placeholder="Describe los aspectos más destacados de la propiedad..."
                  :class="[inputCls, 'resize-none']"
                />
              </div>
            </div>
          </section>

          <section :class="sectionCls">
            <div class="flex items-center gap-2.5 mb-5">
              <MapPin :size="15" class="text-white/30" />
              <h2 class="text-white/70 text-sm font-medium tracking-wide">Ubicación</h2>
            </div>
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label :class="labelCls">Colonia / Fraccionamiento</label>
                <input
                  v-model="form.colonia"
                  type="text"
                  placeholder="Ej. Lomas de Chapultepec"
                  :class="inputCls"
                />
              </div>
              <div>
                <label :class="labelCls">Ciudad</label>
                <input v-model="form.ciudad" type="text" placeholder="CDMX" :class="inputCls" />
              </div>
            </div>
          </section>

          <section :class="sectionCls">
            <div class="flex items-center gap-2.5 mb-5">
              <Bed :size="15" class="text-white/30" />
              <h2 class="text-white/70 text-sm font-medium tracking-wide">
                Características técnicas
              </h2>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
              <NumberInput
                v-model="form.habitaciones"
                :icon="Bed"
                label="Habitaciones"
                variant="dark"
              />
              <NumberInput v-model="form.banos" :icon="Bath" label="Baños" variant="dark" />
              <NumberInput
                v-model="form.estacionamientos"
                :icon="Car"
                label="Estacionamientos"
                variant="dark"
              />
            </div>
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label :class="labelCls">Superficie (m²)</label>
                <div class="relative">
                  <Maximize2
                    :size="13"
                    class="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20"
                  />
                  <input
                    v-model="form.m2"
                    type="number"
                    placeholder="420"
                    :class="[inputCls, 'pl-9', noSpinCls]"
                  />
                </div>
              </div>
              <div>
                <label :class="labelCls">Antigüedad</label>
                <div class="relative">
                  <CalendarDays
                    :size="13"
                    class="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20"
                  />
                  <input
                    v-model="form.antiguedad"
                    type="text"
                    placeholder="Ej. 5 años · Obra nueva"
                    :class="[inputCls, 'pl-9']"
                  />
                </div>
              </div>
            </div>
          </section>

          <section :class="sectionCls">
            <div class="flex items-center gap-2.5 mb-5">
              <CheckCircle2 :size="15" class="text-white/30" />
              <h2 class="text-white/70 text-sm font-medium tracking-wide">
                Amenidades y características
              </h2>
            </div>
            <div class="flex flex-wrap gap-2 mb-4">
              <button
                v-for="c in AMENIDADES"
                :key="c"
                type="button"
                :class="chipBtn(form.caracteristicas.includes(c))"
                @click="toggle(form.caracteristicas, c)"
              >
                <span v-if="form.caracteristicas.includes(c)" class="mr-1">✓</span>{{ c }}
              </button>
            </div>
            <div class="flex gap-2">
              <input
                v-model="customCar"
                type="text"
                placeholder="Agregar característica personalizada..."
                :class="smallInputCls"
                @keydown.enter.prevent="addCar"
              />
              <button
                type="button"
                class="px-4 py-2.5 bg-white/6 border border-white/10 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/10 transition-all text-sm"
                @click="addCar"
              >
                <Plus :size="15" />
              </button>
            </div>
            <div v-if="form.caracteristicas.length" class="mt-3 flex flex-wrap gap-1.5">
              <span
                v-for="c in form.caracteristicas"
                :key="c"
                class="inline-flex items-center gap-1.5 bg-white/8 text-white/60 text-xs px-2.5 py-1 rounded-full"
              >
                {{ c }}
                <button
                  class="text-white/30 hover:text-white/60"
                  @click="toggle(form.caracteristicas, c)"
                >
                  <X :size="9" />
                </button>
              </span>
            </div>
          </section>

          <section :class="sectionCls">
            <div class="flex items-center gap-2.5 mb-1">
              <Package :size="15" class="text-white/30" />
              <h2 class="text-white/70 text-sm font-medium tracking-wide">Bienes incluidos</h2>
            </div>
            <p class="text-white/25 text-xs mb-5">
              Selecciona los bienes muebles o instalaciones que se entregan con el inmueble.
            </p>
            <div v-for="cat in BIENES_CATEGORIAS" :key="cat.label" class="mb-5 last:mb-0">
              <p class="text-white/30 text-[10px] font-medium tracking-widest uppercase mb-2">
                {{ cat.label }}
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="b in cat.items"
                  :key="b"
                  type="button"
                  :class="chipBtn(form.bienes.includes(b))"
                  @click="toggle(form.bienes, b)"
                >
                  <span v-if="form.bienes.includes(b)" class="mr-1">✓</span>{{ b }}
                </button>
              </div>
            </div>
            <div class="flex gap-2 mt-5 pt-4 border-t border-white/6">
              <input
                v-model="customBien"
                type="text"
                placeholder="Agregar bien personalizado..."
                :class="smallInputCls"
                @keydown.enter.prevent="addBien"
              />
              <button
                type="button"
                class="px-4 py-2.5 bg-white/6 border border-white/10 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/10 transition-all text-sm"
                @click="addBien"
              >
                <Plus :size="15" />
              </button>
            </div>
            <div v-if="form.bienes.length" class="mt-3 flex flex-wrap gap-1.5">
              <span
                v-for="b in form.bienes"
                :key="b"
                class="inline-flex items-center gap-1.5 bg-white/8 text-white/60 text-xs px-2.5 py-1 rounded-full"
              >
                {{ b }}
                <button class="text-white/30 hover:text-white/60" @click="toggle(form.bienes, b)">
                  <X :size="9" />
                </button>
              </span>
            </div>
          </section>
        </div>

        <!-- ── Right: summary + actions ── -->
        <div class="lg:sticky lg:top-24 h-fit flex flex-col gap-4">
          <div class="bg-white/2 border border-white/6 rounded-2xl p-5">
            <h3 class="text-white/50 text-xs tracking-widest uppercase mb-4">Resumen</h3>
            <div v-if="previewUrl" class="aspect-[4/3] rounded-xl overflow-hidden bg-white/5 mb-4">
              <img :src="previewUrl" alt="preview" class="w-full h-full object-cover" />
            </div>
            <div
              v-else
              class="aspect-[4/3] rounded-xl bg-white/4 border border-dashed border-white/8 flex items-center justify-center mb-4"
            >
              <Image :size="20" class="text-white/15" />
            </div>
            <p class="text-white text-base leading-snug mb-1" :style="SERIF">
              <template v-if="form.nombre">{{ form.nombre }}</template>
              <span v-else class="text-white/20 italic text-sm">Sin nombre</span>
            </p>
            <p class="text-white/30 text-xs flex items-center gap-1 mb-3">
              <MapPin :size="10" />
              {{ [form.colonia, form.ciudad].filter(Boolean).join(', ') || 'Sin ubicación' }}
            </p>
            <div class="grid grid-cols-3 gap-2 mb-3">
              <div
                v-for="(item, i) in [
                  { icon: Bed, val: form.habitaciones || '–' },
                  { icon: Bath, val: form.banos || '–' },
                  { icon: Maximize2, val: form.m2 ? `${form.m2}m²` : '–' },
                ]"
                :key="i"
                class="bg-white/4 rounded-lg py-2 flex flex-col items-center gap-1"
              >
                <span class="text-white/25"><component :is="item.icon" :size="11" /></span>
                <span class="text-white/50 text-xs">{{ item.val }}</span>
              </div>
            </div>
            <p v-if="form.precio" class="text-white text-lg" :style="SERIF">
              ${{ form.precio
              }}<span v-if="form.operacion === 'renta'" class="text-white/30 text-sm"> / mes</span>
            </p>
          </div>

          <div class="bg-white/2 border border-white/6 rounded-2xl p-5">
            <h3 class="text-white/50 text-xs tracking-widest uppercase mb-3">Estado inicial</h3>
            <div class="flex flex-col gap-2">
              <label
                v-for="e in ESTADOS_INICIALES"
                :key="e.val"
                class="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  v-model="estadoInicial"
                  type="radio"
                  name="estado"
                  :value="e.val"
                  class="hidden"
                />
                <div
                  :class="[
                    'w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center',
                    estadoInicial === e.val ? 'border-white/50' : 'border-white/15',
                  ]"
                >
                  <div
                    :class="[
                      'w-1.5 h-1.5 rounded-full',
                      e.dot,
                      estadoInicial === e.val ? 'opacity-100' : 'opacity-0',
                    ]"
                  />
                </div>
                <span class="text-white/40 text-sm group-hover:text-white/60 transition-colors">{{
                  e.label
                }}</span>
              </label>
            </div>
          </div>

          <p v-if="error" class="text-red-400 text-xs text-center">{{ error }}</p>

          <button
            :disabled="saving || saved"
            class="w-full bg-white text-[#0d0d0c] rounded-xl py-3.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.99] transition-all duration-200 disabled:opacity-70"
            @click="handleSave"
          >
            <LoadingDots v-if="saving" dot-class="bg-[#0d0d0c]/50" />
            <template v-else-if="saved"
              ><CheckCircle2 :size="15" class="text-emerald-600" /> Propiedad guardada</template
            >
            <template v-else>Guardar propiedad</template>
          </button>
          <button
            class="w-full bg-transparent border border-white/10 text-white/30 rounded-xl py-3 text-sm hover:text-white/50 hover:border-white/20 transition-all"
            @click="router.push('/admin/panel')"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
