<script setup lang="ts">
withDefaults(defineProps<{ dotClass?: string }>(), { dotClass: 'bg-[#f5f2ee]/70' })
</script>

<template>
  <span class="inline-flex gap-1 items-center">
    <span :class="['w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0ms]', dotClass]" />
    <span :class="['w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:150ms]', dotClass]" />
    <span :class="['w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:300ms]', dotClass]" />
  </span>
</template>
