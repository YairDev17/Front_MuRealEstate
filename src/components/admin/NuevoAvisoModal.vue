<script setup lang="ts">
import { reactive } from 'vue'
import { Send, X } from 'lucide-vue-next'
import type { Aviso, TipoAviso } from '@/types/admin'
import { AGENTES, AVISOS_TIPO } from './solicitudesConfig'
import { SERIF } from '@/config'

const emit = defineEmits<{ close: []; send: [Omit<Aviso, 'id' | 'leido'>] }>()

const form = reactive({ tipo: 'informativo' as TipoAviso, titulo: '', cuerpo: '', destinatario: 'Todos' })
const tipos = Object.keys(AVISOS_TIPO) as TipoAviso[]
const fieldCls =
  'w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all'

function enviar() {
  if (form.titulo && form.cuerpo) emit('send', { ...form, autor: 'Administrador', fecha: 'Ahora' })
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <div class="bg-[#141413] border border-white/10 rounded-2xl w-full max-w-md">
      <div class="flex items-center justify-between p-6 border-b border-white/6">
        <h2 class="text-white text-lg" :style="SERIF">Nuevo aviso</h2>
        <button class="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all" @click="emit('close')">
          <X :size="16" />
        </button>
      </div>
      <div class="p-6 space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-white/40 text-xs mb-1.5 tracking-wide">Tipo</label>
            <select v-model="form.tipo" :class="[fieldCls, 'appearance-none']">
              <option v-for="t in tipos" :key="t" :value="t" class="bg-[#141413]">{{ AVISOS_TIPO[t].label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-white/40 text-xs mb-1.5 tracking-wide">Destinatario</label>
            <select v-model="form.destinatario" :class="[fieldCls, 'appearance-none']">
              <option class="bg-[#141413]">Todos</option>
              <option v-for="a in AGENTES" :key="a" class="bg-[#141413]">{{ a }}</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-white/40 text-xs mb-1.5 tracking-wide">Título</label>
          <input v-model="form.titulo" :class="fieldCls" placeholder="Título del aviso" />
        </div>
        <div>
          <label class="block text-white/40 text-xs mb-1.5 tracking-wide">Mensaje</label>
          <textarea v-model="form.cuerpo" rows="4" placeholder="Describe el aviso..." :class="[fieldCls, 'resize-none']" />
        </div>
      </div>
      <div class="flex gap-2 p-6 pt-0">
        <button
          class="flex-1 py-2.5 rounded-lg border border-white/8 text-white/40 text-sm hover:bg-white/5 transition-all"
          @click="emit('close')"
        >
          Cancelar
        </button>
        <button
          class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white text-[#0d0d0c] text-sm font-medium hover:bg-white/90 transition-all"
          @click="enviar"
        >
          <Send :size="13" /> Enviar aviso
        </button>
      </div>
    </div>
  </div>
</template>
