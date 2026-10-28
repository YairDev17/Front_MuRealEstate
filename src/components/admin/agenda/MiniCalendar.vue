<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { EstadoVisita, Visita } from '@/types/admin'
import { DIAS_SEMANA, MESES, toYMD } from './agenda'
import { SERIF } from '@/config'

const props = defineProps<{ visitas: Visita[] }>()
const selected = defineModel<string | null>({ required: true })

const today = new Date()
const todayStr = toYMD(today)
const viewDate = ref(new Date(today.getFullYear(), today.getMonth(), 1))

const year = computed(() => viewDate.value.getFullYear())
const month = computed(() => viewDate.value.getMonth())
const firstDay = computed(() => new Date(year.value, month.value, 1).getDay())
const daysInMonth = computed(() => new Date(year.value, month.value + 1, 0).getDate())

const estadosPorFecha = computed(() => {
  const map: Record<string, EstadoVisita[]> = {}
  for (const v of props.visitas) (map[v.fecha] ??= []).push(v.estado)
  return map
})

const dias = computed(() =>
  Array.from({ length: daysInMonth.value }, (_, i) => {
    const day = i + 1
    const dateStr = `${year.value}-${String(month.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const estados = estadosPorFecha.value[dateStr] ?? []
    return {
      day,
      dateStr,
      isToday: dateStr === todayStr,
      hasVisitas: estados.length > 0,
      hasPending: estados.some((s) => s === 'programada' || s === 'confirmada'),
    }
  }),
)

const prev = () => (viewDate.value = new Date(year.value, month.value - 1, 1))
const next = () => (viewDate.value = new Date(year.value, month.value + 1, 1))
</script>

<template>
  <div class="bg-white/3 border border-white/6 rounded-2xl p-4">
    <div class="flex items-center justify-between mb-4">
      <button class="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all" @click="prev">
        <ChevronLeft :size="14" />
      </button>
      <span class="text-white/60 text-sm font-medium" :style="SERIF">{{ MESES[month] }} {{ year }}</span>
      <button class="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all" @click="next">
        <ChevronRight :size="14" />
      </button>
    </div>

    <div class="grid grid-cols-7 gap-0.5 mb-1">
      <div v-for="d in DIAS_SEMANA" :key="d" class="text-center text-[9px] text-white/20 font-medium py-1">{{ d }}</div>
    </div>

    <div class="grid grid-cols-7 gap-0.5">
      <div v-for="i in firstDay" :key="`empty-${i}`" />
      <button
        v-for="d in dias"
        :key="d.day"
        :class="[
          'relative aspect-square rounded-lg text-xs flex flex-col items-center justify-center transition-all duration-150',
          d.dateStr === selected
            ? 'bg-[#b8935a] text-[#0d0d0c] font-semibold'
            : d.isToday
              ? 'bg-white/10 text-white font-medium'
              : 'text-white/40 hover:bg-white/6 hover:text-white/70',
        ]"
        @click="selected = d.dateStr === selected ? null : d.dateStr"
      >
        {{ d.day }}
        <span
          v-if="d.hasVisitas && d.dateStr !== selected"
          :class="['absolute bottom-0.5 w-1 h-1 rounded-full', d.hasPending ? 'bg-[#b8935a]' : 'bg-white/20']"
        />
      </button>
    </div>
  </div>
</template>
