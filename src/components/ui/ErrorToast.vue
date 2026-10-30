<script setup lang="ts">
import { AlertCircle, X } from 'lucide-vue-next'
import { errorGlobal } from '@/composables/useErrorGlobal'
</script>

<template>
  <Transition
    enter-from-class="opacity-0 translate-y-2"
    leave-to-class="opacity-0 translate-y-2"
    enter-active-class="transition duration-200"
    leave-active-class="transition duration-200"
  >
    <div
      v-if="errorGlobal"
      role="alert"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[min(92vw,460px)] flex items-start gap-3 rounded-xl border border-red-400/30 bg-[#1a1714] text-[#f5f2ee] px-4 py-3 shadow-2xl"
    >
      <AlertCircle :size="16" class="text-red-400 shrink-0 mt-0.5" />
      <p class="text-sm leading-relaxed flex-1">{{ errorGlobal }}</p>
      <button
        type="button"
        class="text-white/40 hover:text-white/80 transition-colors"
        aria-label="Cerrar"
        @click="errorGlobal = ''"
      >
        <X :size="14" />
      </button>
    </div>
  </Transition>
</template>
