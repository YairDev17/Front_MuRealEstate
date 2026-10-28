<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import { SERIF } from '@/config'

/** Modal para capturar el motivo de un rechazo (postulaciones, reseñas, documentos). */
const props = withDefaults(
  defineProps<{
    titulo: string
    descripcion?: string
    placeholder?: string
    confirmar?: string
    sugerencias?: string[]
  }>(),
  { confirmar: 'Rechazar', placeholder: 'Describe el motivo…', sugerencias: () => [] },
)
const emit = defineEmits<{ close: []; confirm: [motivo: string] }>()
const motivo = ref('')
const error = ref(false)

function enviar() {
  if (!motivo.value.trim()) {
    error.value = true
    return
  }
  emit('confirm', motivo.value.trim())
}
void props
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <div class="bg-[#141413] border border-white/10 rounded-2xl w-full max-w-md">
      <div class="flex items-center justify-between p-6 border-b border-white/6">
        <h2 class="text-white text-lg" :style="SERIF">{{ titulo }}</h2>
        <button
          class="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
          @click="emit('close')"
        >
          <X :size="16" />
        </button>
      </div>
      <div class="p-6 space-y-4">
        <p v-if="descripcion" class="text-white/40 text-sm leading-relaxed">{{ descripcion }}</p>
        <div v-if="sugerencias.length" class="flex flex-wrap gap-1.5">
          <button
            v-for="s in sugerencias"
            :key="s"
            type="button"
            class="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-white/40 hover:border-white/25 hover:text-white/70 transition-all"
            @click="((motivo = s), (error = false))"
          >
            {{ s }}
          </button>
        </div>
        <textarea
          v-model="motivo"
          rows="4"
          :placeholder="placeholder"
          :class="[
            'w-full bg-white/5 border rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none transition-all resize-none',
            error ? 'border-red-400/50' : 'border-white/8 focus:border-white/20',
          ]"
          @input="error = false"
        />
        <p v-if="error" class="text-red-400 text-xs">
          Escribe el motivo; se compartirá con el interesado.
        </p>
      </div>
      <div class="flex gap-2 p-6 pt-0">
        <button
          class="flex-1 py-2.5 rounded-lg border border-white/8 text-white/40 text-sm hover:bg-white/5 transition-all"
          @click="emit('close')"
        >
          Cancelar
        </button>
        <button
          class="flex-1 py-2.5 rounded-lg bg-red-400/15 border border-red-400/30 text-red-300 text-sm font-medium hover:bg-red-400/25 transition-all"
          @click="enviar"
        >
          {{ confirmar }}
        </button>
      </div>
    </div>
  </div>
</template>
