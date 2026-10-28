<script setup lang="ts">
defineProps<{ required?: boolean }>()
</script>

<template>
  <label class="text-[#1a1714] text-xs font-medium tracking-wider uppercase mb-1.5 block">
    <slot /><span v-if="required" class="text-[#b8935a] ml-1">*</span>
  </label>
</template>
