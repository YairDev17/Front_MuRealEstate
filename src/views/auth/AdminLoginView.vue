<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-vue-next'
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
  'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 focus:border-white/25 focus:bg-white/8'

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    await auth.loginAdmin({ correo: email.value, password: password.value })
    const redirect =
      typeof route.query.redirect === 'string' ? route.query.redirect : '/admin/panel'
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
    image="https://images.unsplash.com/photo-1761979089822-0b058236d195?w=1400&h=1800&fit=crop&auto=format"
    image-bg-class="bg-stone-900"
    overlay-class="from-black/75 via-black/50 to-black/20"
    panel-class="bg-[#111210]"
  >
    <template #logo>
      <div class="flex items-center gap-3">
        <img
          :src="muIsotipo"
          alt="MU Real Estate"
          class="h-14 w-auto object-contain brightness-0 invert opacity-90"
        />
        <span
          class="text-white/50 text-xs font-medium tracking-widest uppercase flex items-center gap-1.5"
        >
          <ShieldCheck :size="11" class="text-white/40" /> Admin
        </span>
      </div>
    </template>
    <template #aside>
      <div class="w-8 h-px bg-white/30 mb-5" />
      <p class="text-white text-3xl xl:text-4xl leading-snug mb-4" :style="SERIF">
        Panel de control exclusivo para administradores.
      </p>
      <p class="text-white/50 text-sm leading-relaxed">
        Acceso restringido. Solo personal autorizado de Propied puede ingresar a este entorno.
      </p>
    </template>
    <template #mobile-logo>
      <div class="flex items-center gap-2.5 mb-10 lg:hidden">
        <img
          :src="muIsotipo"
          alt="MU Real Estate"
          class="h-14 w-auto object-contain brightness-0 invert opacity-80"
        />
        <span class="text-white/40 text-xs tracking-widest uppercase flex items-center gap-1">
          <ShieldCheck :size="10" class="text-white/30" /> Admin
        </span>
      </div>
    </template>

    <div
      class="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 mb-8"
    >
      <ShieldCheck :size="12" class="text-[#b8935a]" />
      <span class="text-[#b8935a] text-xs tracking-widest uppercase font-medium"
        >Acceso administrador</span
      >
    </div>

    <div class="mb-10">
      <h1 class="text-white text-3xl xl:text-4xl mb-2" :style="SERIF">Iniciar sesión</h1>
      <p class="text-white/40 text-sm">Ingresa tus credenciales de administrador para continuar.</p>
    </div>

    <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
      <div class="flex flex-col gap-1.5">
        <label for="admin-email" class="text-white/50 text-xs font-medium tracking-wider uppercase">
          Correo administrador
        </label>
        <input
          id="admin-email"
          v-model="email"
          type="email"
          placeholder="admin@propied.mx"
          required
          :class="inputCls"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between">
          <label
            for="admin-password"
            class="text-white/50 text-xs font-medium tracking-wider uppercase"
          >
            Contraseña
          </label>
          <button
            type="button"
            @click="router.push({ path: '/recuperar', query: email ? { correo: email } : {} })"
            class="text-xs text-white/30 hover:text-white/60 transition-colors duration-150 underline underline-offset-2"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <div class="relative">
          <input
            id="admin-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            required
            :class="[inputCls, 'pr-11']"
          />
          <button
            type="button"
            class="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors duration-150"
            tabindex="-1"
            @click="showPassword = !showPassword"
          >
            <EyeOff v-if="showPassword" :size="16" />
            <Eye v-else :size="16" />
          </button>
        </div>
      </div>

      <p v-if="error" class="text-red-400 text-xs pl-1">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="mt-2 w-full bg-white text-[#111210] rounded-lg py-3.5 text-sm font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.99] transition-all duration-200 disabled:opacity-40"
      >
        <LoadingDots v-if="loading" dot-class="bg-[#111210]/50" />
        <template v-else>Ingresar al panel <ArrowRight :size="15" /></template>
      </button>
    </form>

    <div class="flex items-center gap-3 my-8">
      <div class="h-px flex-1 bg-white/8" />
      <span class="text-white/20 text-xs tracking-widest uppercase">o</span>
      <div class="h-px flex-1 bg-white/8" />
    </div>

    <div class="flex flex-col items-center gap-2 text-center">
      <p class="text-white/30 text-sm">¿No eres administrador?</p>
      <button
        type="button"
        class="text-sm font-medium text-white/50 underline underline-offset-2 decoration-white/20 decoration-2 hover:text-white/80 hover:decoration-white/40 transition-all duration-150"
        @click="router.push('/login')"
      >
        Volver al inicio de sesión
      </button>
    </div>

    <template #footer>
      <p class="mt-12 text-white/15 text-xs text-center">
        © 2026 Propied. Panel de administración. Acceso restringido.
      </p>
    </template>
  </AuthSplitLayout>
</template>
