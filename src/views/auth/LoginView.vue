<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, Eye, EyeOff } from 'lucide-vue-next'
import AuthSplitLayout from '@/components/layout/AuthSplitLayout.vue'
import LoadingDots from '@/components/ui/LoadingDots.vue'
import muIsotipo from '@/assets/images/IsotipoMUrealEstate-removebg-preview.png'
import { useAuthStore } from '@/stores/auth'
import { SERIF } from '@/config'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const inputCls =
  'w-full bg-[#ede8e2] border border-transparent rounded-lg px-4 py-3 text-sm text-[#1a1714] placeholder-[#a89f95] outline-none transition-all duration-200 focus:border-[#1a1714]/30 focus:bg-[#e8e3dc]'

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    await auth.login({ correo: email.value, password: password.value })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.push(redirect)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo iniciar sesión.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthSplitLayout
    image="https://images.unsplash.com/photo-1787647559700-529fab8e431c?w=1400&h=1800&fit=crop&auto=format"
    image-position="center top"
  >
    <template #logo>
      <div class="flex items-center">
        <img :src="muIsotipo" alt="MU Real Estate" class="h-24 w-auto object-contain brightness-0 invert" />
      </div>
    </template>
    <template #aside>
      <p class="text-white text-3xl xl:text-4xl leading-snug mb-4" :style="SERIF">
        Las mejores propiedades, en un solo lugar.
      </p>
      <p class="text-white/60 text-sm leading-relaxed">
        Encuentra tu próximo hogar o inversión con la asesoría de nuestro equipo experto.
      </p>
    </template>
    <template #mobile-logo>
      <div class="flex items-center mb-10 lg:hidden">
        <img :src="muIsotipo" alt="MU Real Estate" class="h-24 w-auto object-contain brightness-0" />
      </div>
    </template>

    <div class="mb-10">
      <h1 class="text-[#1a1714] text-3xl xl:text-4xl mb-2" :style="SERIF">Bienvenido de nuevo</h1>
      <p class="text-[#7a7067] text-sm">Ingresa tus credenciales para continuar.</p>
    </div>

    <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
      <div class="flex flex-col gap-1.5">
        <label for="email" class="text-[#1a1714] text-xs font-medium tracking-wider uppercase">
          Inicio de sesión
        </label>
        <input id="email" v-model="email" type="email" placeholder="tu@correo.com" required :class="inputCls" />
      </div>

      <div class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between">
          <label for="password" class="text-[#1a1714] text-xs font-medium tracking-wider uppercase">
            Contraseña
          </label>
          <button
            type="button"
            class="text-xs text-[#7a7067] hover:text-[#1a1714] transition-colors duration-150 underline underline-offset-2 decoration-[#7a7067]/40"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <div class="relative">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            required
            :class="[inputCls, 'pr-11']"
          />
          <button
            type="button"
            class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a89f95] hover:text-[#1a1714] transition-colors duration-150"
            tabindex="-1"
            @click="showPassword = !showPassword"
          >
            <EyeOff v-if="showPassword" :size="16" />
            <Eye v-else :size="16" />
          </button>
        </div>
      </div>

      <p v-if="error" class="text-red-500 text-xs pl-1">{{ error }}</p>

      <button
        type="button"
        class="mt-1 w-full bg-transparent text-[#1a1714] border border-[#1a1714]/20 rounded-lg py-3.5 text-sm font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-[#ede8e2] active:scale-[0.99] transition-all duration-200"
        @click="router.push('/registro')"
      >
        Regístrate
      </button>

      <button
        type="submit"
        :disabled="loading"
        class="w-full bg-[#1c2b47] text-[#f5f2ee] rounded-lg py-3.5 text-sm font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-[#243559] active:scale-[0.99] transition-all duration-200 disabled:opacity-60"
      >
        <LoadingDots v-if="loading" />
        <template v-else>Iniciar sesión <ArrowRight :size="15" /></template>
      </button>
    </form>

    <div class="flex items-center gap-3 my-8">
      <div class="h-px flex-1 bg-[#1a1714]/10" />
      <span class="text-[#a89f95] text-xs tracking-widest uppercase">o</span>
      <div class="h-px flex-1 bg-[#1a1714]/10" />
    </div>

    <div class="flex flex-col items-center gap-2 text-center">
      <p class="text-[#7a7067] text-sm">¿Formas parte del equipo?</p>
      <button
        type="button"
        class="text-sm font-medium text-[#1a1714] underline underline-offset-2 decoration-[#b8935a] decoration-2 hover:decoration-[#1a1714] transition-all duration-150"
        @click="router.push('/admin')"
      >
        Haz click aquí
      </button>
    </div>

    <template #footer>
      <p class="mt-12 text-[#a89f95] text-xs text-center">© 2026 MU Real Estate. Todos los derechos reservados.</p>
    </template>
  </AuthSplitLayout>
</template>
