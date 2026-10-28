<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{ icon: Component; title: string; subtitle?: string }>()
</script>

<template>
  <section class="bg-white border border-[#1a1714]/8 rounded-md p-6">
    <div class="flex items-start gap-2.5 mb-5">
      <span class="text-[#a89f95] mt-0.5"><component :is="icon" :size="15" /></span>
      <div>
        <h2 class="text-[#1a1714] text-sm font-medium tracking-wide">{{ title }}</h2>
        <p v-if="subtitle" class="text-[#a89f95] text-xs mt-0.5">{{ subtitle }}</p>
      </div>
    </div>
    <slot />
  </section>
</template>
