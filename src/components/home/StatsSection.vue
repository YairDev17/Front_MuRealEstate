<script setup lang="ts">
import { Award, Building2, TrendingUp, Users } from 'lucide-vue-next'
import { SERIF } from '@/config'

const items = [
  { icon: Building2, value: '+2,400', label: 'Propiedades listadas' },
  { icon: Users, value: '+8,000', label: 'Familias asesoradas' },
  { icon: Award, value: '11 años', label: 'De experiencia' },
  { icon: TrendingUp, value: '32', label: 'Colonias activas' },
]
</script>

<template>
  <section class="bg-[#1a1714] py-14">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
        <div v-for="item in items" :key="item.label" class="text-center">
          <div class="text-[#b8935a] flex justify-center mb-3">
            <component :is="item.icon" :size="20" />
          </div>
          <p class="text-white text-3xl mb-1" :style="SERIF">{{ item.value }}</p>
          <p class="text-white/40 text-sm">{{ item.label }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
