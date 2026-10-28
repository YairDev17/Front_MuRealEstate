<script setup lang="ts">
/**
 * Layout de pantallas de autenticación: foto a la izquierda (solo desktop)
 * y formulario a la derecha.
 */
withDefaults(
  defineProps<{
    image: string
    imagePosition?: string
    imageBgClass?: string
    overlayClass?: string
    panelClass?: string
  }>(),
  {
    imagePosition: 'center',
    imageBgClass: 'bg-stone-800',
    overlayClass: 'from-black/60 via-black/30 to-black/10',
    panelClass: 'bg-[#f5f2ee]',
  },
)
</script>

<template>
  <div class="flex h-screen w-full overflow-hidden font-['DM_Sans',sans-serif]">
    <!-- Left panel — photo -->
    <div class="relative hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col">
      <div
        :class="['absolute inset-0', imageBgClass]"
        :style="{
          backgroundImage: `url('${image}')`,
          backgroundSize: 'cover',
          backgroundPosition: imagePosition,
        }"
      />
      <div :class="['absolute inset-0 bg-gradient-to-br', overlayClass]" />
      <div class="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">
        <slot name="logo" />
        <div class="max-w-xs xl:max-w-sm">
          <slot name="aside" />
        </div>
      </div>
    </div>

    <!-- Right panel -->
    <div
      :class="[
        'flex flex-1 flex-col items-center justify-center px-8 sm:px-12 lg:px-16 xl:px-20 overflow-y-auto',
        panelClass,
      ]"
    >
      <slot name="mobile-logo" />
      <div class="w-full max-w-sm xl:max-w-md">
        <slot />
      </div>
      <slot name="footer" />
    </div>
  </div>
</template>
