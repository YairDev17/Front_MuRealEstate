<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { BarChart3, Clock, Download, Eye, Star, TrendingUp } from 'lucide-vue-next'
import AdminTopBar from '@/components/admin/AdminTopBar.vue'
import AdminLogoutActions from '@/components/admin/AdminLogoutActions.vue'
import { analiticaService } from '@/services/modulos.service'
import type { Analitica, PeriodoAnalitica } from '@/types/modulos'
import { SERIF } from '@/config'

const periodo = ref<PeriodoAnalitica>(90)
const data = ref<Analitica | null>(null)
const cargando = ref(true)

watch(
  periodo,
  async (p) => {
    cargando.value = true
    try {
      data.value = await analiticaService.obtener(p)
    } finally {
      cargando.value = false
    }
  },
  { immediate: true },
)

const kpis = computed(() => {
  const k = data.value?.kpis
  if (!k) return []
  return [
    {
      label: 'Visitas a fichas',
      value: k.visitasTotales.toLocaleString('es-MX'),
      icon: Eye,
      color: 'text-sky-400',
    },
    {
      label: 'Días promedio de aprobación',
      value: k.tiempoAprobacionDias.toFixed(1),
      icon: Clock,
      color: 'text-amber-400',
    },
    {
      label: 'Conversión citas → ofertas',
      value: `${k.conversionCitasOfertas} %`,
      icon: TrendingUp,
      color: 'text-emerald-400',
    },
    {
      label: 'Calificación promedio',
      value: k.resenaPromedio.toFixed(1),
      icon: Star,
      color: 'text-[#b8935a]',
    },
  ]
})

const maxVistas = computed(() =>
  Math.max(1, ...(data.value?.masVistas.map((p) => p.visitas) ?? [1])),
)
const maxDias = computed(() =>
  Math.max(1, ...(data.value?.aprobacionPorMes.map((m) => m.dias) ?? [1])),
)
const maxCitas = computed(() => Math.max(1, ...(data.value?.embudo.map((m) => m.citas) ?? [1])))

function exportarCsv() {
  if (!data.value) return
  const filas = [
    ['Asesor', 'Citas', 'Ofertas', 'Cierres', 'Conversión (%)'],
    ...data.value.asesores.map((a) => [
      a.nombre,
      a.citas,
      a.ofertas,
      a.cierres,
      a.citas ? Math.round((a.ofertas / a.citas) * 100) : 0,
    ]),
    [],
    ['Propiedad', 'Visitas'],
    ...data.value.masVistas.map((p) => [p.titulo, p.visitas]),
  ]
  const csv = filas
    .map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `reporte-mu-real-estate-${periodo.value}d.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="min-h-screen bg-[#0d0d0c] font-['DM_Sans',sans-serif]">
    <AdminTopBar section="Analítica y reportes" wide>
      <template #actions><AdminLogoutActions /></template>
    </AdminTopBar>

    <div class="max-w-screen-2xl mx-auto px-5 py-7">
      <div class="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <BarChart3 :size="20" class="text-[#b8935a]" />
            <h1 class="text-white text-2xl" :style="SERIF">Dashboard de analítica</h1>
          </div>
          <p class="text-white/30 text-sm ml-8">
            Indicadores clave de la operación de MU Real Estate.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex bg-white/4 border border-white/8 rounded-lg p-1">
            <button
              v-for="p in [30, 90, 365] as const"
              :key="p"
              :class="[
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                periodo === p ? 'bg-white/12 text-white/90' : 'text-white/35 hover:text-white/60',
              ]"
              @click="periodo = p"
            >
              {{ p === 365 ? '12 meses' : `${p} días` }}
            </button>
          </div>
          <button
            class="flex items-center gap-2 bg-white text-[#0d0d0c] text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/90 transition-all"
            @click="exportarCsv"
          >
            <Download :size="14" /> Exportar CSV
          </button>
        </div>
      </div>

      <div :class="['transition-opacity', cargando && 'opacity-50']">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div
            v-for="k in kpis"
            :key="k.label"
            class="bg-white/3 border border-white/6 rounded-xl px-4 py-4"
          >
            <div :class="['flex items-center gap-2 mb-2', k.color]">
              <component :is="k.icon" :size="14" />
              <span class="text-xs tracking-wide opacity-80">{{ k.label }}</span>
            </div>
            <p class="text-white text-2xl font-medium" :style="SERIF">{{ k.value }}</p>
          </div>
        </div>

        <div v-if="data" class="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <!-- Más vistas -->
          <section class="bg-white/3 border border-white/6 rounded-xl p-5">
            <h2 class="text-white/70 text-sm font-medium mb-5">Propiedades más vistas</h2>
            <div class="flex flex-col gap-3.5">
              <div v-for="p in data.masVistas" :key="p.titulo">
                <div class="flex justify-between text-xs mb-1.5">
                  <span class="text-white/60 truncate pr-3">{{ p.titulo }}</span>
                  <span class="text-white/40 tabular-nums">{{
                    p.visitas.toLocaleString('es-MX')
                  }}</span>
                </div>
                <div class="h-2 rounded-full bg-white/6 overflow-hidden">
                  <div
                    class="h-full rounded-full bg-sky-400/80 transition-all duration-500"
                    :style="{ width: `${(p.visitas / maxVistas) * 100}%` }"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- Tiempo de aprobación -->
          <section class="bg-white/3 border border-white/6 rounded-xl p-5">
            <h2 class="text-white/70 text-sm font-medium mb-1">Tiempo promedio de aprobación</h2>
            <p class="text-white/25 text-xs mb-5">
              Días entre el envío del propietario y la decisión del equipo.
            </p>
            <div class="flex items-end gap-3 h-44">
              <div
                v-for="m in data.aprobacionPorMes"
                :key="m.mes"
                class="flex-1 flex flex-col items-center gap-2 h-full justify-end"
              >
                <span class="text-white/50 text-[11px] tabular-nums">{{ m.dias.toFixed(1) }}</span>
                <div
                  class="w-full max-w-12 rounded-t-md bg-amber-400/70 transition-all duration-500"
                  :style="{ height: `${(m.dias / maxDias) * 100}%` }"
                />
                <span class="text-white/30 text-[11px]">{{ m.mes }}</span>
              </div>
            </div>
          </section>

          <!-- Embudo -->
          <section class="bg-white/3 border border-white/6 rounded-xl p-5">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-white/70 text-sm font-medium">Conversión de citas a ofertas</h2>
              <div class="flex items-center gap-3 text-[11px] text-white/40">
                <span class="flex items-center gap-1.5"
                  ><span class="w-2 h-2 rounded-sm bg-white/25" /> Citas</span
                >
                <span class="flex items-center gap-1.5"
                  ><span class="w-2 h-2 rounded-sm bg-emerald-400" /> Ofertas</span
                >
              </div>
            </div>
            <div class="flex items-end gap-4 h-44">
              <div
                v-for="m in data.embudo"
                :key="m.mes"
                class="flex-1 flex flex-col items-center gap-2 h-full justify-end"
              >
                <div class="flex items-end gap-1 w-full justify-center h-full">
                  <div
                    class="w-1/3 max-w-6 rounded-t bg-white/20 transition-all duration-500"
                    :style="{ height: `${(m.citas / maxCitas) * 100}%` }"
                    :title="`${m.citas} citas`"
                  />
                  <div
                    class="w-1/3 max-w-6 rounded-t bg-emerald-400/80 transition-all duration-500"
                    :style="{ height: `${(m.ofertas / maxCitas) * 100}%` }"
                    :title="`${m.ofertas} ofertas`"
                  />
                </div>
                <span class="text-white/30 text-[11px]">{{ m.mes }}</span>
              </div>
            </div>
          </section>

          <!-- Asesores -->
          <section class="bg-white/3 border border-white/6 rounded-xl p-5">
            <h2 class="text-white/70 text-sm font-medium mb-4">Desempeño de asesores</h2>
            <table class="w-full">
              <thead>
                <tr
                  class="border-b border-white/6 text-white/25 text-[10px] tracking-widest uppercase"
                >
                  <th class="text-left font-medium pb-2.5">Asesor</th>
                  <th class="text-right font-medium pb-2.5">Citas</th>
                  <th class="text-right font-medium pb-2.5">Ofertas</th>
                  <th class="text-right font-medium pb-2.5">Cierres</th>
                  <th class="text-right font-medium pb-2.5 pl-3 w-32">Conversión</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="a in data.asesores"
                  :key="a.nombre"
                  class="border-b border-white/4 last:border-b-0"
                >
                  <td class="py-3 text-white/70 text-sm">{{ a.nombre }}</td>
                  <td class="py-3 text-right text-white/50 text-sm tabular-nums">{{ a.citas }}</td>
                  <td class="py-3 text-right text-white/50 text-sm tabular-nums">
                    {{ a.ofertas }}
                  </td>
                  <td class="py-3 text-right text-white/80 text-sm tabular-nums font-medium">
                    {{ a.cierres }}
                  </td>
                  <td class="py-3 pl-3">
                    <div class="flex items-center gap-2 justify-end">
                      <div class="w-16 h-1.5 rounded-full bg-white/8 overflow-hidden">
                        <div
                          class="h-full bg-emerald-400"
                          :style="{ width: `${a.citas ? (a.ofertas / a.citas) * 100 : 0}%` }"
                        />
                      </div>
                      <span class="text-white/40 text-xs tabular-nums w-9 text-right"
                        >{{ a.citas ? Math.round((a.ofertas / a.citas) * 100) : 0 }} %</span
                      >
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
