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
  ChevronDown,
  DollarSign,
  Image,
  MapPin,
  Maximize2,
  Package,
  Plus,
  Send,
  Tag,
  X,
} from 'lucide-vue-next'
import muIsotipo from '@/assets/images/IsotipoMUrealEstate-removebg-preview.png'
import FieldLabel from '@/components/publicar/FieldLabel.vue'
import SectionCard from '@/components/publicar/SectionCard.vue'
import NumberInput from '@/components/publicar/NumberInput.vue'
import ImageUpload from '@/components/publicar/ImageUpload.vue'
import PublishSuccess from '@/components/publicar/PublishSuccess.vue'
import LoadingDots from '@/components/ui/LoadingDots.vue'
import { AMENIDADES, BIENES_CATEGORIAS, OPERACIONES, TIPOS_INMUEBLE } from '@/constants/catalogos'
import { publicacionesService } from '@/services/publicaciones.service'
import { useAuthStore } from '@/stores/auth'
import type { ContactoPublicacion, PropiedadFormData } from '@/types/propiedad'
import { SERIF } from '@/config'

const router = useRouter()
const auth = useAuthStore()

const nuevoForm = (): PropiedadFormData => ({
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

const nuevoContacto = (): ContactoPublicacion => ({
  nombre: auth.usuario ? `${auth.usuario.nombre} ${auth.usuario.apellido}` : '',
  telefono: auth.usuario?.telefono ?? '',
  correo: auth.usuario?.correo ?? '',
})

const form = reactive(nuevoForm())
const contacto = reactive(nuevoContacto())
const step = ref(1)
const submitted = ref(false)
const sending = ref(false)
const showTipoMenu = ref(false)
const customAmenidad = ref('')
const customBien = ref('')
const errores = ref<string[]>([])
const errorEnvio = ref('')

const inputCls =
  'w-full bg-[#ede8e2] border border-transparent rounded-md px-4 py-3 text-sm text-[#1a1714] placeholder-[#a89f95] outline-none transition-all duration-200 focus:border-[#1a1714]/25 focus:bg-[#e8e3dc]'
const noSpinCls = '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'

const chipBtn = (selected: boolean) => [
  'text-xs px-3 py-1.5 rounded-full border transition-all duration-150',
  selected
    ? 'bg-[#1c2b47] text-[#f5f2ee] border-[#1c2b47]'
    : 'bg-transparent text-[#7a7067] border-[#1a1714]/12 hover:border-[#1a1714]/25 hover:text-[#1a1714]',
]

function toggle(list: string[], v: string) {
  const i = list.indexOf(v)
  if (i >= 0) list.splice(i, 1)
  else list.push(v)
}

function addAmenidad() {
  const v = customAmenidad.value.trim()
  if (v && !form.caracteristicas.includes(v)) form.caracteristicas.push(v)
  customAmenidad.value = ''
}

function addBien() {
  const v = customBien.value.trim()
  if (v && !form.bienes.includes(v)) form.bienes.push(v)
  customBien.value = ''
}

const previewUrl = computed(() => (form.imagenes[0] ? URL.createObjectURL(form.imagenes[0]) : ''))

function validarPaso1() {
  const faltantes: string[] = []
  if (!form.imagenes.length) faltantes.push('al menos una fotografía')
  if (!form.nombre.trim()) faltantes.push('nombre de la propiedad')
  if (!form.precio.trim()) faltantes.push('precio')
  if (!form.colonia.trim()) faltantes.push('colonia')
  if (!contacto.nombre.trim()) faltantes.push('tu nombre')
  if (!contacto.telefono.trim()) faltantes.push('teléfono')
  if (!contacto.correo.trim()) faltantes.push('correo')
  errores.value = faltantes
  return faltantes.length === 0
}

function continuar() {
  if (!validarPaso1()) return
  step.value = 2
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function enviar() {
  sending.value = true
  errorEnvio.value = ''
  try {
    await publicacionesService.enviarARevision({ ...form }, { ...contacto })
    submitted.value = true
    window.scrollTo({ top: 0 })
  } catch (e) {
    errorEnvio.value = e instanceof Error ? e.message : 'No se pudo enviar la propiedad.'
  } finally {
    sending.value = false
  }
}

function publicarOtra() {
  Object.assign(form, nuevoForm())
  Object.assign(contacto, nuevoContacto())
  step.value = 1
  submitted.value = false
}
</script>

<template>
  <PublishSuccess
    v-if="submitted"
    :nombre="form.nombre"
    :colonia="form.colonia"
    :ciudad="form.ciudad"
    @volver="router.push('/')"
    @otra="publicarOtra"
  />

  <div v-else class="min-h-screen bg-[#f5f2ee] font-['DM_Sans',sans-serif]">
    <nav class="sticky top-0 z-40 bg-[#f5f2ee]/95 backdrop-blur-md border-b border-[#1a1714]/8">
      <div class="max-w-screen-xl mx-auto px-5 flex items-center justify-between gap-4" style="height: 60px">
        <button class="flex items-center shrink-0 hover:opacity-80 transition-opacity" @click="router.push('/')">
          <img :src="muIsotipo" alt="MU Real Estate" class="h-24 w-auto object-contain" />
        </button>
        <button
          class="flex items-center gap-2 text-[#7a7067] hover:text-[#1a1714] text-sm transition-colors"
          @click="router.push('/')"
        >
          <ArrowLeft :size="14" /> Volver al inicio
        </button>
      </div>
    </nav>

    <div class="max-w-screen-xl mx-auto px-5 py-8">
      <div class="mb-8 max-w-2xl">
        <p class="text-[#a89f95] text-xs tracking-widest uppercase mb-2">Publicar propiedad</p>
        <h1 class="text-[#1a1714] text-3xl mb-2" :style="SERIF">
          {{ step === 1 ? 'Comparte tu propiedad con nosotros' : 'Bienes incluidos' }}
        </h1>
        <p class="text-[#7a7067] text-sm leading-relaxed">
          {{
            step === 1
              ? 'Completa el formulario y nuestro equipo revisará la información. Una vez aprobada, la publicaremos en el portafolio.'
              : 'Selecciona los bienes que se entregan junto con el inmueble. Este paso es opcional.'
          }}
        </p>
      </div>

      <!-- Step indicator -->
      <div class="flex items-center gap-3 mb-8">
        <div v-for="s in [1, 2]" :key="s" class="flex items-center gap-3">
          <button
            type="button"
            :class="[
              'flex items-center gap-2 text-xs font-medium transition-all',
              s === step ? 'text-[#1a1714]' : s < step ? 'text-[#b8935a] cursor-pointer' : 'text-[#a89f95] cursor-default',
            ]"
            @click="s < step && (step = s)"
          >
            <span
              :class="[
                'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all',
                s === step ? 'bg-[#1c2b47] text-white' : s < step ? 'bg-[#b8935a] text-white' : 'bg-[#ede8e2] text-[#a89f95]',
              ]"
            >
              {{ s < step ? '✓' : s }}
            </span>
            <span class="hidden sm:inline">{{ s === 1 ? 'Información general' : 'Bienes incluidos' }}</span>
          </button>
          <div v-if="s < 2" :class="['h-px w-10 transition-all', s < step ? 'bg-[#b8935a]' : 'bg-[#1a1714]/10']" />
        </div>
      </div>

      <div class="grid lg:grid-cols-[1fr_300px] gap-8">
        <!-- ── Left: form ── -->
        <div class="flex flex-col gap-6">
          <template v-if="step === 1">
            <SectionCard :icon="Image" title="Fotografías" subtitle="Sube al menos una imagen de la propiedad.">
              <ImageUpload v-model="form.imagenes" />
            </SectionCard>

            <SectionCard :icon="Tag" title="Datos generales">
              <div class="flex flex-col gap-5">
                <div>
                  <FieldLabel required>Nombre o título de la propiedad</FieldLabel>
                  <input
                    v-model="form.nombre"
                    type="text"
                    placeholder="Ej. Casa Contemporánea en Lomas de Chapultepec"
                    :class="inputCls"
                  />
                </div>

                <div>
                  <FieldLabel required>Tipo de operación</FieldLabel>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      v-for="op in OPERACIONES"
                      :key="op.key"
                      type="button"
                      :class="[
                        'py-2.5 rounded-md text-sm font-medium transition-all duration-200 border',
                        form.operacion === op.key
                          ? 'bg-[#1c2b47] text-[#f5f2ee] border-[#1c2b47]'
                          : 'bg-transparent text-[#7a7067] border-[#1a1714]/12 hover:border-[#1a1714]/25',
                      ]"
                      @click="form.operacion = op.key"
                    >
                      {{ op.label }}
                    </button>
                  </div>
                </div>

                <div>
                  <FieldLabel>Tipo de inmueble</FieldLabel>
                  <div class="relative">
                    <button
                      type="button"
                      class="w-full flex items-center justify-between bg-[#ede8e2] rounded-md px-4 py-3 text-sm text-[#1a1714] hover:bg-[#e8e3dc] transition-all"
                      @click="showTipoMenu = !showTipoMenu"
                    >
                      <span :class="form.tipoInmueble ? 'text-[#1a1714]' : 'text-[#a89f95]'">
                        {{ form.tipoInmueble || 'Seleccionar tipo' }}
                      </span>
                      <ChevronDown :size="14" :class="['text-[#a89f95] transition-transform', showTipoMenu ? 'rotate-180' : '']" />
                    </button>
                    <div
                      v-if="showTipoMenu"
                      class="absolute top-full left-0 right-0 mt-1 bg-white border border-[#1a1714]/10 rounded-md shadow-lg z-30 py-1"
                    >
                      <button
                        v-for="t in TIPOS_INMUEBLE"
                        :key="t"
                        type="button"
                        :class="[
                          'w-full text-left px-4 py-2.5 text-sm transition-colors',
                          form.tipoInmueble === t
                            ? 'bg-[#f5f2ee] text-[#1a1714] font-medium'
                            : 'text-[#7a7067] hover:bg-[#f5f2ee] hover:text-[#1a1714]',
                        ]"
                        @click="(form.tipoInmueble = t), (showTipoMenu = false)"
                      >
                        {{ t }}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <FieldLabel required>Precio {{ form.operacion === 'renta' ? '(mensual)' : '' }}</FieldLabel>
                  <div class="relative">
                    <DollarSign :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a89f95]" />
                    <input
                      v-model="form.precio"
                      type="text"
                      :placeholder="form.operacion === 'renta' ? '38,000' : '12,500,000'"
                      :class="[inputCls, 'pl-9']"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Descripción</FieldLabel>
                  <textarea
                    v-model="form.descripcion"
                    rows="3"
                    placeholder="Describe los aspectos más destacados: acabados, entorno, estado de conservación…"
                    :class="[inputCls, 'resize-none']"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard :icon="MapPin" title="Ubicación">
              <div class="grid sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                  <FieldLabel>Calle y número</FieldLabel>
                  <input v-model="form.calle" type="text" placeholder="Ej. Av. Reforma 123, Int. 4" :class="inputCls" />
                </div>
                <div>
                  <FieldLabel required>Colonia / Fraccionamiento</FieldLabel>
                  <input v-model="form.colonia" type="text" placeholder="Ej. Lomas de Chapultepec" :class="inputCls" />
                </div>
                <div>
                  <FieldLabel>Ciudad</FieldLabel>
                  <input v-model="form.ciudad" type="text" placeholder="CDMX" :class="inputCls" />
                </div>
              </div>
            </SectionCard>

            <SectionCard :icon="Bed" title="Características técnicas">
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
                <NumberInput v-model="form.habitaciones" :icon="Bed" label="Habitaciones" />
                <NumberInput v-model="form.banos" :icon="Bath" label="Baños" />
                <NumberInput v-model="form.estacionamientos" :icon="Car" label="Estacionamientos" />
              </div>
              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Superficie (m²)</FieldLabel>
                  <div class="relative">
                    <Maximize2 :size="13" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a89f95]" />
                    <input v-model="form.m2" type="number" placeholder="420" :class="[inputCls, 'pl-9', noSpinCls]" />
                  </div>
                </div>
                <div>
                  <FieldLabel>Antigüedad</FieldLabel>
                  <div class="relative">
                    <CalendarDays :size="13" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a89f95]" />
                    <input
                      v-model="form.antiguedad"
                      type="text"
                      placeholder="Ej. 5 años · Obra nueva"
                      :class="[inputCls, 'pl-9']"
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard :icon="CheckCircle2" title="Amenidades y características">
              <div class="flex flex-wrap gap-2 mb-4">
                <button
                  v-for="a in AMENIDADES"
                  :key="a"
                  type="button"
                  :class="chipBtn(form.caracteristicas.includes(a))"
                  @click="toggle(form.caracteristicas, a)"
                >
                  <span v-if="form.caracteristicas.includes(a)" class="mr-1">✓</span>{{ a }}
                </button>
              </div>
              <div class="flex gap-2">
                <input
                  v-model="customAmenidad"
                  type="text"
                  placeholder="Agregar característica personalizada..."
                  :class="['flex-1', inputCls]"
                  @keydown.enter.prevent="addAmenidad()"
                />
                <button
                  type="button"
                  class="px-4 py-3 bg-[#ede8e2] border border-transparent rounded-md text-[#7a7067] hover:text-[#1a1714] hover:bg-[#e8e3dc] transition-all"
                  @click="addAmenidad()"
                >
                  <Plus :size="15" />
                </button>
              </div>
              <div v-if="form.caracteristicas.length" class="mt-3 flex flex-wrap gap-1.5">
                <span
                  v-for="a in form.caracteristicas"
                  :key="a"
                  class="inline-flex items-center gap-1.5 bg-[#ede8e2] text-[#1a1714] text-xs px-2.5 py-1 rounded-full"
                >
                  {{ a }}
                  <button class="text-[#a89f95] hover:text-[#1a1714]" @click="toggle(form.caracteristicas, a)">
                    <X :size="9" />
                  </button>
                </span>
              </div>
            </SectionCard>

            <SectionCard :icon="Tag" title="Tus datos de contacto" subtitle="Para que nuestro equipo pueda comunicarse contigo.">
              <div class="grid sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                  <FieldLabel required>Nombre completo</FieldLabel>
                  <input v-model="contacto.nombre" type="text" placeholder="Tu nombre completo" :class="inputCls" />
                </div>
                <div>
                  <FieldLabel required>Teléfono</FieldLabel>
                  <input v-model="contacto.telefono" type="tel" placeholder="+52 55 0000 0000" :class="inputCls" />
                </div>
                <div>
                  <FieldLabel required>Correo electrónico</FieldLabel>
                  <input v-model="contacto.correo" type="email" placeholder="tu@correo.com" :class="inputCls" />
                </div>
              </div>
            </SectionCard>

            <p v-if="errores.length" class="text-red-500 text-xs -mb-2">Falta completar: {{ errores.join(', ') }}.</p>

            <button
              type="button"
              class="w-full bg-[#1c2b47] text-[#f5f2ee] rounded-md py-3.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#243559] active:scale-[0.99] transition-all duration-200"
              @click="continuar"
            >
              Continuar — Bienes incluidos
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </template>

          <SectionCard
            v-else
            :icon="Package"
            title="Bienes incluidos"
            subtitle="Selecciona los bienes que se entregan con el inmueble."
          >
            <div v-for="cat in BIENES_CATEGORIAS" :key="cat.label" class="mb-5 last:mb-0">
              <p class="text-[#a89f95] text-[10px] font-medium tracking-widest uppercase mb-2">{{ cat.label }}</p>
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
            <div class="flex gap-2 mt-4 pt-4 border-t border-[#1a1714]/6">
              <input
                v-model="customBien"
                type="text"
                placeholder="Agregar bien personalizado..."
                :class="['flex-1', inputCls]"
                @keydown.enter.prevent="addBien()"
              />
              <button
                type="button"
                class="px-4 py-3 bg-[#ede8e2] rounded-md text-[#7a7067] hover:text-[#1a1714] hover:bg-[#e8e3dc] transition-all"
                @click="addBien()"
              >
                <Plus :size="15" />
              </button>
            </div>
            <div v-if="form.bienes.length" class="mt-3 flex flex-wrap gap-1.5">
              <span
                v-for="b in form.bienes"
                :key="b"
                class="inline-flex items-center gap-1.5 bg-[#ede8e2] text-[#1a1714] text-xs px-2.5 py-1 rounded-full"
              >
                {{ b }}
                <button class="text-[#a89f95] hover:text-[#1a1714]" @click="toggle(form.bienes, b)"><X :size="9" /></button>
              </span>
            </div>
          </SectionCard>
        </div>

        <!-- ── Right: summary + submit ── -->
        <div class="lg:sticky lg:top-24 h-fit flex flex-col gap-4">
          <div class="bg-white border border-[#1a1714]/8 rounded-md p-5">
            <h3 class="text-[#a89f95] text-xs tracking-widest uppercase mb-4">Vista previa</h3>
            <div v-if="previewUrl" class="aspect-[4/3] rounded-md overflow-hidden bg-[#ede8e2] mb-4">
              <img :src="previewUrl" alt="preview" class="w-full h-full object-cover" />
            </div>
            <div
              v-else
              class="aspect-[4/3] rounded-md bg-[#ede8e2] border border-dashed border-[#1a1714]/12 flex items-center justify-center mb-4"
            >
              <Image :size="20" class="text-[#a89f95]" />
            </div>
            <p class="text-[#1a1714] text-base leading-snug mb-1" :style="SERIF">
              <template v-if="form.nombre">{{ form.nombre }}</template>
              <span v-else class="text-[#a89f95] italic text-sm font-['DM_Sans',sans-serif]">Sin nombre</span>
            </p>
            <p class="text-[#a89f95] text-xs flex items-center gap-1 mb-3">
              <MapPin :size="10" /> {{ [form.colonia, form.ciudad].filter(Boolean).join(', ') || 'Sin ubicación' }}
            </p>
            <div class="grid grid-cols-3 gap-2 mb-3">
              <div
                v-for="(item, i) in [
                  { icon: Bed, val: form.habitaciones || '–' },
                  { icon: Bath, val: form.banos || '–' },
                  { icon: Maximize2, val: form.m2 ? `${form.m2}m²` : '–' },
                ]"
                :key="i"
                class="bg-[#f5f2ee] rounded-md py-2 flex flex-col items-center gap-1"
              >
                <span class="text-[#a89f95]"><component :is="item.icon" :size="11" /></span>
                <span class="text-[#7a7067] text-xs">{{ item.val }}</span>
              </div>
            </div>
            <p v-if="form.precio" class="text-[#1a1714] text-lg" :style="SERIF">
              ${{ form.precio
              }}<span v-if="form.operacion === 'renta'" class="text-[#a89f95] text-sm font-['DM_Sans',sans-serif]"> / mes</span>
            </p>
          </div>

          <div class="bg-[#b8935a]/10 border border-[#b8935a]/30 rounded-md p-4">
            <p class="text-[#7a7067] text-xs leading-relaxed">
              Tu propiedad será enviada a nuestro equipo de revisión. Te contactaremos en un plazo de
              <strong class="text-[#1a1714]">24–48 h hábiles</strong>.
            </p>
          </div>

          <template v-if="step === 2">
            <p v-if="errorEnvio" class="text-red-500 text-xs text-center">{{ errorEnvio }}</p>
            <button
              :disabled="sending"
              class="w-full bg-[#1c2b47] text-[#f5f2ee] rounded-md py-3.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#243559] active:scale-[0.99] transition-all duration-200 disabled:opacity-60"
              @click="enviar"
            >
              <LoadingDots v-if="sending" />
              <template v-else><Send :size="14" /> Enviar a revisión</template>
            </button>
            <button
              class="w-full bg-transparent border border-[#1a1714]/15 text-[#7a7067] rounded-md py-3 text-sm hover:border-[#1a1714]/25 hover:text-[#1a1714] transition-all flex items-center justify-center gap-2"
              @click="step = 1"
            >
              <ArrowLeft :size="13" /> Regresar
            </button>
          </template>
          <button
            v-else
            class="w-full bg-transparent border border-[#1a1714]/15 text-[#7a7067] rounded-md py-3 text-sm hover:border-[#1a1714]/25 hover:text-[#1a1714] transition-all"
            @click="router.push('/')"
          >
            Cancelar
          </button>
          <p class="text-[#a89f95] text-[10px] text-center leading-relaxed">
            Campos marcados con <span class="text-[#b8935a]">*</span> son obligatorios
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
