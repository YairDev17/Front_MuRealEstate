<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Eraser } from 'lucide-vue-next'

/** Lienzo para capturar una firma; emite la imagen PNG como data URL. */
defineProps<{ label: string }>()
const model = defineModel<string | undefined>()
const canvas = ref<HTMLCanvasElement>()
let dibujando = false
let ctx: CanvasRenderingContext2D | null = null

onMounted(() => {
  const c = canvas.value!
  const ratio = window.devicePixelRatio || 1
  c.width = c.offsetWidth * ratio
  c.height = c.offsetHeight * ratio
  ctx = c.getContext('2d')
  if (!ctx) return
  ctx.scale(ratio, ratio)
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#1c2b47'
  if (model.value) {
    const img = new Image()
    img.onload = () => ctx?.drawImage(img, 0, 0, c.offsetWidth, c.offsetHeight)
    img.src = model.value
  }
})

function punto(e: PointerEvent) {
  const r = canvas.value!.getBoundingClientRect()
  return { x: e.clientX - r.left, y: e.clientY - r.top }
}

function inicio(e: PointerEvent) {
  dibujando = true
  canvas.value!.setPointerCapture(e.pointerId)
  const { x, y } = punto(e)
  ctx?.beginPath()
  ctx?.moveTo(x, y)
}

function mover(e: PointerEvent) {
  if (!dibujando || !ctx) return
  const { x, y } = punto(e)
  ctx.lineTo(x, y)
  ctx.stroke()
}

function fin() {
  if (!dibujando) return
  dibujando = false
  model.value = canvas.value!.toDataURL('image/png')
}

function limpiar() {
  const c = canvas.value!
  ctx?.clearRect(0, 0, c.width, c.height)
  model.value = undefined
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-1.5">
      <p class="text-white/40 text-xs">{{ label }}</p>
      <button
        type="button"
        class="flex items-center gap-1 text-[11px] text-white/30 hover:text-white/60"
        @click="limpiar"
      >
        <Eraser :size="11" /> Limpiar
      </button>
    </div>
    <canvas
      ref="canvas"
      class="w-full h-28 rounded-lg bg-[#f5f2ee] cursor-crosshair touch-none"
      @pointerdown="inicio"
      @pointermove="mover"
      @pointerup="fin"
      @pointerleave="fin"
    />
    <p class="text-white/20 text-[10px] mt-1">
      {{ model ? 'Firma capturada' : 'Firme dentro del recuadro' }}
    </p>
  </div>
</template>
