<script setup lang="ts">
import type { Component } from 'vue'

const props = withDefaults(
  defineProps<{ icon: Component; label: string; min?: number; variant?: 'light' | 'dark' }>(),
  { min: 0, variant: 'light' },
)
const model = defineModel<number | ''>({ required: true })

const dec = () => (model.value = Math.max(props.min, Number(model.value || 0) - 1))
const inc = () => (model.value = Number(model.value || 0) + 1)
function onInput(e: Event) {
  const v = (e.target as HTMLInputElement).value
  model.value = v === '' ? '' : Number(v)
}

const styles = {
  light: {
    label: 'text-[#7a7067]',
    icon: 'text-[#a89f95]',
    box: 'bg-[#ede8e2] border border-transparent rounded-md focus-within:border-[#1a1714]/20',
    btn: 'text-[#7a7067] hover:text-[#1a1714] hover:bg-[#e8e3dc]',
    input: 'text-[#1a1714]',
  },
  dark: {
    label: 'text-white/30',
    icon: 'text-white/20',
    box: 'bg-white/4 border border-white/8 rounded-lg',
    btn: 'text-white/30 hover:text-white/60 hover:bg-white/5',
    input: 'text-white',
  },
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <div :class="['flex items-center gap-1.5 text-xs mb-0.5', styles[variant].label]">
      <span :class="styles[variant].icon"><component :is="icon" :size="12" /></span>
      {{ label }}
    </div>
    <div :class="['flex items-center overflow-hidden', styles[variant].box]">
      <button type="button" :class="['px-3 py-2.5 transition-all text-lg leading-none', styles[variant].btn]" @click="dec">
        −
      </button>
      <input
        type="number"
        :value="model"
        :min="min"
        :class="[
          'flex-1 min-w-0 bg-transparent text-center text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          styles[variant].input,
        ]"
        @input="onInput"
      />
      <button type="button" :class="['px-3 py-2.5 transition-all text-lg leading-none', styles[variant].btn]" @click="inc">
        +
      </button>
    </div>
  </div>
</template>
