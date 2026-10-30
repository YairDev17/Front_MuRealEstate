<script setup lang="ts">
import { RouterView } from 'vue-router'
import ErrorToast from '@/components/ui/ErrorToast.vue'
</script>

<template>
  <RouterView />
  <ErrorToast />
</template>
