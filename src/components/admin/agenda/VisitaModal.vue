<script setup lang="ts">
import { reactive } from 'vue'
import { X } from 'lucide-vue-next'
import type { Visita } from '@/types/admin'
import { ASESORES, DURACIONES, ESTADO_VISITA, ESTADOS_VISITA, TIPOS_INMUEBLE_VISITA, toYMD } from './agenda'
import { SERIF } from '@/config'

const props = defineProps<{ initial?: Visita }>()
const emit = defineEmits<{ close: []; save: [Omit<Visita, 'id'>] }>()

const form = reactive<Omit<Visita, 'id'>>({
  propiedad: props.initial?.propiedad ?? '',
  tipoInmueble: props.initial?.tipoInmueble ?? 'Casa',
  direccion: props.initial?.direccion ?? '',
  imagen: props.initial?.imagen ?? 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=260&fit=crop&auto=format',
  interesado: props.initial?.interesado ?? '',
  telefonoInteresado: props.initial?.telefonoInteresado ?? '',
  correoInteresado: props.initial?.correoInteresado ?? '',
  asesor: props.initial?.asesor ?? 'Carlos Cano',
  fecha: props.initial?.fecha ?? toYMD(new Date()),
  hora: props.initial?.hora ?? '10:00',
  duracion: props.initial?.duracion ?? 60,
  estado: props.initial?.estado ?? 'programada',
  notas: props.initial?.notas ?? '',
})

function handleSave() {
  if (!form.propiedad || !form.interesado || !form.asesor || !form.fecha || !form.hora) return
  emit('save', { ...form })
}

const inputCls =
  'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none focus:border-[#b8935a]/40 transition-colors'
const labelCls = 'block text-white/40 text-xs mb-1.5'
const sectionCls = 'text-white/25 text-[10px] font-semibold tracking-widest uppercase mb-3'
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="emit('close')" />
    <div class="relative bg-[#141413] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
      <div class="sticky top-0 bg-[#141413] border-b border-white/6 px-6 py-4 flex items-center justify-between z-10">
        <h2 class="text-white text-lg" :style="SERIF">{{ initial ? 'Editar visita' : 'Nueva visita' }}</h2>
        <button class="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all" @click="emit('close')">
          <X :size="16" />
        </button>
      </div>

      <div class="p-6 space-y-5">
        <div>
          <p :class="sectionCls">Propiedad</p>
          <div class="grid grid-cols-2 gap-3">
            <div class="col-span-2">
              <label :class="labelCls">Nombre de la propiedad *</label>
              <input v-model="form.propiedad" :class="inputCls" placeholder="Ej: Penthouse en Polanco" />
            </div>
            <div>
              <label :class="labelCls">Tipo de inmueble</label>
              <select v-model="form.tipoInmueble" :class="inputCls">
                <option v-for="t in TIPOS_INMUEBLE_VISITA" :key="t" :value="t" class="bg-[#1a1a19]">{{ t }}</option>
              </select>
            </div>
            <div>
              <label :class="labelCls">Estado</label>
              <select v-model="form.estado" :class="inputCls">
                <option v-for="s in ESTADOS_VISITA" :key="s" :value="s" class="bg-[#1a1a19] capitalize">{{ ESTADO_VISITA[s].label }}</option>
              </select>
            </div>
            <div class="col-span-2">
              <label :class="labelCls">Dirección</label>
              <input v-model="form.direccion" :class="inputCls" placeholder="Calle, colonia, ciudad" />
            </div>
          </div>
        </div>

        <div>
          <p :class="sectionCls">Interesado</p>
          <div class="grid grid-cols-2 gap-3">
            <div class="col-span-2">
              <label :class="labelCls">Nombre completo *</label>
              <input v-model="form.interesado" :class="inputCls" placeholder="Nombre del cliente" />
            </div>
            <div>
              <label :class="labelCls">Teléfono</label>
              <input v-model="form.telefonoInteresado" :class="inputCls" placeholder="+52 55 XXXX XXXX" />
            </div>
            <div>
              <label :class="labelCls">Correo</label>
              <input v-model="form.correoInteresado" :class="inputCls" type="email" placeholder="correo@ejemplo.com" />
            </div>
          </div>
        </div>

        <div>
          <p :class="sectionCls">Agenda</p>
          <div class="grid grid-cols-3 gap-3">
            <div class="col-span-1">
              <label :class="labelCls">Asesor *</label>
              <select v-model="form.asesor" :class="inputCls">
                <option v-for="a in ASESORES" :key="a" :value="a" class="bg-[#1a1a19]">{{ a }}</option>
              </select>
            </div>
            <div>
              <label :class="labelCls">Fecha *</label>
              <input v-model="form.fecha" :class="inputCls" type="date" />
            </div>
            <div>
              <label :class="labelCls">Hora *</label>
              <input v-model="form.hora" :class="inputCls" type="time" />
            </div>
            <div>
              <label :class="labelCls">Duración</label>
              <select v-model.number="form.duracion" :class="inputCls">
                <option v-for="d in DURACIONES" :key="d" :value="d" class="bg-[#1a1a19]">{{ d }} min</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label :class="labelCls">Notas internas</label>
          <textarea
            v-model="form.notas"
            :class="[inputCls, 'resize-none']"
            rows="3"
            placeholder="Observaciones, instrucciones especiales..."
          />
        </div>
      </div>

      <div class="sticky bottom-0 bg-[#141413] border-t border-white/6 px-6 py-4 flex justify-end gap-3">
        <button
          class="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/40 text-sm hover:bg-white/10 transition-all"
          @click="emit('close')"
        >
          Cancelar
        </button>
        <button
          class="px-5 py-2 rounded-lg bg-[#b8935a] text-[#0d0d0c] text-sm font-semibold hover:bg-[#c9a46b] transition-all"
          @click="handleSave"
        >
          {{ initial ? 'Guardar cambios' : 'Crear visita' }}
        </button>
      </div>
    </div>
  </div>
</template>
