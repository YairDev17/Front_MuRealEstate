<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Plus, Upload, X } from 'lucide-vue-next'

const MAX_IMAGENES = 10

const props = withDefaults(defineProps<{ variant?: 'light' | 'dark' }>(), { variant: 'light' })
const files = defineModel<File[]>({ required: true })

const inputRef = ref<HTMLInputElement>()
const dragging = ref(false)

// URLs de vista previa sincronizadas con los archivos seleccionados
const previews = ref<string[]>([])
watch(
  files,
  (list) => {
    previews.value.forEach((u) => URL.revokeObjectURL(u))
    previews.value = list.map((f) => URL.createObjectURL(f))
  },
  { immediate: true },
)
onBeforeUnmount(() => previews.value.forEach((u) => URL.revokeObjectURL(u)))

function handleFiles(list: FileList | null | undefined) {
  if (!list) return
  const nuevas = Array.from(list).filter((f) => f.type.startsWith('image/'))
  files.value = [...files.value, ...nuevas].slice(0, MAX_IMAGENES)
  if (inputRef.value) inputRef.value.value = ''
}

function remove(idx: number) {
  files.value = files.value.filter((_, i) => i !== idx)
}

function onDrop(e: DragEvent) {
  dragging.value = false
  handleFiles(e.dataTransfer?.files)
}

const dark = computed(() => props.variant === 'dark')
</script>

<template>
  <div class="flex flex-col gap-3">
    <div
      :class="[
        'border-2 border-dashed p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200',
        dark ? 'rounded-xl' : 'rounded-md',
        dark
          ? dragging
            ? 'border-white/40 bg-white/8'
            : 'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5'
          : dragging
            ? 'border-[#1a1714]/40 bg-[#ede8e2]'
            : 'border-[#1a1714]/12 bg-[#f5f2ee] hover:border-[#1a1714]/25 hover:bg-[#ede8e2]',
      ]"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
      @click="inputRef?.click()"
    >
      <div :class="['w-10 h-10 rounded-full flex items-center justify-center', dark ? 'bg-white/8' : 'bg-[#ede8e2]']">
        <Upload :size="18" :class="dark ? 'text-white/40' : 'text-[#a89f95]'" />
      </div>
      <div class="text-center">
        <p :class="dark ? 'text-white/60 text-sm font-medium' : 'text-[#7a7067] text-sm'">
          Arrastra imágenes aquí o
          <span :class="['underline underline-offset-2', dark ? 'text-white/80' : 'text-[#1a1714]']">selecciona archivos</span>
        </p>
        <p :class="['text-xs mt-1', dark ? 'text-white/25' : 'text-[#a89f95]']">
          JPG, PNG, WEBP · Máximo {{ MAX_IMAGENES }} imágenes
        </p>
      </div>
      <input ref="inputRef" type="file" accept="image/*" multiple class="hidden" @change="handleFiles(($event.target as HTMLInputElement).files)" />
    </div>

    <div v-if="previews.length" class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
      <div
        v-for="(src, i) in previews"
        :key="src"
        :class="[
          'relative group aspect-[4/3] overflow-hidden',
          dark ? 'rounded-lg bg-white/5' : 'rounded-md bg-[#ede8e2]',
        ]"
      >
        <img :src="src" :alt="`foto ${i + 1}`" class="w-full h-full object-cover" />
        <div v-if="i === 0" class="absolute bottom-1.5 left-1.5">
          <span
            :class="[
              'text-[9px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide',
              dark ? 'bg-white/80 text-black' : 'bg-[#1a1714]/70 text-white',
            ]"
          >
            Principal
          </span>
        </div>
        <button
          type="button"
          :class="[
            'absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity',
            dark ? 'bg-black/60' : 'bg-[#1a1714]/60',
          ]"
          @click.stop="remove(i)"
        >
          <X :size="10" class="text-white" />
        </button>
      </div>
      <button
        v-if="previews.length < MAX_IMAGENES"
        type="button"
        :class="[
          'aspect-[4/3] border-2 border-dashed flex items-center justify-center transition-all',
          dark ? 'rounded-lg border-white/10 hover:border-white/20' : 'rounded-md border-[#1a1714]/12 hover:border-[#1a1714]/25',
        ]"
        @click="inputRef?.click()"
      >
        <Plus :size="16" :class="dark ? 'text-white/20' : 'text-[#a89f95]'" />
      </button>
    </div>
  </div>
</template>
