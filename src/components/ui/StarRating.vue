<script setup lang="ts">
import { ref } from 'vue'
import { Star } from 'lucide-vue-next'

const props = withDefaults(defineProps<{ size?: number; readonly?: boolean }>(), {
  size: 14,
  readonly: false,
})
const model = defineModel<number>({ default: 0 })
const hover = ref(0)

function set(n: number) {
  if (!props.readonly) model.value = n
}
</script>

<template>
  <div class="inline-flex gap-0.5" @mouseleave="hover = 0">
    <component
      :is="readonly ? 'span' : 'button'"
      v-for="n in 5"
      :key="n"
      :type="readonly ? undefined : 'button'"
      :class="readonly ? '' : 'cursor-pointer transition-transform hover:scale-110'"
      :aria-label="readonly ? undefined : `${n} estrellas`"
      @mouseenter="!readonly && (hover = n)"
      @click="set(n)"
    >
      <Star
        :size="size"
        :class="n <= (hover || model) ? 'fill-[#b8935a] text-[#b8935a]' : 'text-[#d8cfc3]'"
      />
    </component>
  </div>
</template>
