<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-vue-next'
import AuthSplitLayout from '@/components/layout/AuthSplitLayout.vue'
import LoadingDots from '@/components/ui/LoadingDots.vue'
import muIsotipo from '@/assets/images/IsotipoMUrealEstate-removebg-preview.png'
import { authService } from '@/services/auth.service'
import { SERIF } from '@/config'

type Paso = 'correo' | 'codigo' | 'listo'

const router = useRouter()
const route = useRoute()

const paso = ref<Paso>('correo')
const correo = ref(typeof route.query.correo === 'string' ? route.query.correo : '')
const codigo = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const inputCls =
  'w-full bg-[#ede8e2] border border-transparent rounded-lg px-4 py-3 text-sm text-[#1a1714] placeholder-[#a89f95] outline-none transition-all duration-200 focus:border-[#1a1714]/30 focus:bg-[#e8e3dc]'
const labelCls = 'text-[#1a1714] text-xs font-medium tracking-wider uppercase'
const btnCls =
  'mt-1 w-full bg-[#1c2b47] text-[#f5f2ee] rounded-lg py-3.5 text-sm font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-[#243559] active:scale-[0.99] transition-all duration-200 disabled:opacity-60'

async function ejecutar(accion: () => Promise<unknown>, siguiente: Paso) {
  loading.value = true
  error.value = ''
  try {
    await accion()
    paso.value = siguiente
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo completar la solicitud.'
  } finally {
    loading.value = false
  }
}

const pedirCodigo = () =>
  ejecutar(() => authService.solicitarRestablecimiento(correo.value), 'codigo')
const cambiar = () =>
  ejecutar(
    () =>
      authService.restablecerPassword({
        correo: correo.value,
        codigo: codigo.value,
        password: password.value,
      }),
    'listo',
  )
</script>

<template>
  <AuthSplitLayout
    image="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&h=1800&fit=crop&auto=format"
  >
    <template #logo>
      <div class="flex items-center">
        <img
          :src="muIsotipo"
          alt="MU Real Estate"
          class="h-24 w-auto object-contain brightness-0 invert"
        />
      </div>
    </template>
    <template #aside>
      <p class="text-white text-3xl xl:text-4xl leading-snug mb-4" :style="SERIF">
        Recupera el acceso a tu cuenta.
      </p>
      <p class="text-white/60 text-sm leading-relaxed">
        Te enviaremos un código a tu correo para que elijas una contraseña nueva.
      </p>
    </template>
    <template #mobile-logo>
      <div class="flex items-center mb-10 lg:hidden">
        <img
          :src="muIsotipo"
          alt="MU Real Estate"
          class="h-24 w-auto object-contain brightness-0"
        />
      </div>
    </template>

    <div v-if="paso === 'listo'" class="flex flex-col items-center text-center gap-6 py-8">
      <div class="w-20 h-20 rounded-full bg-[#1c2b47]/10 flex items-center justify-center">
        <CheckCircle2 :size="38" class="text-[#1c2b47]" :stroke-width="1.4" />
      </div>
      <div>
        <h2 class="text-[#1a1714] text-3xl mb-2" :style="SERIF">Contraseña actualizada</h2>
        <p class="text-[#7a7067] text-sm">Ya puedes iniciar sesión con tu contraseña nueva.</p>
      </div>
      <button :class="btnCls" @click="router.push('/login')">Iniciar sesión</button>
    </div>

    <template v-else>
      <div class="mb-8">
        <button
          type="button"
          class="flex items-center gap-1.5 text-xs text-[#7a7067] hover:text-[#1a1714] transition-colors duration-150 mb-6"
          @click="paso === 'codigo' ? (paso = 'correo') : router.push('/login')"
        >
          <ArrowLeft :size="13" />
          {{ paso === 'codigo' ? 'Cambiar correo' : 'Volver al inicio de sesión' }}
        </button>
        <div class="w-14 h-14 rounded-2xl bg-[#1c2b47]/8 flex items-center justify-center mb-6">
          <KeyRound :size="26" class="text-[#1c2b47]" :stroke-width="1.4" />
        </div>
        <h1 class="text-[#1a1714] text-3xl xl:text-4xl mb-2" :style="SERIF">
          ¿Olvidaste tu contraseña?
        </h1>
        <p class="text-[#7a7067] text-sm leading-relaxed">
          <template v-if="paso === 'correo'">Escribe el correo con el que te registraste.</template>
          <template v-else>
            Si <span class="font-medium text-[#1a1714]">{{ correo }}</span> está registrado, te
            enviamos un código de 6 dígitos.
          </template>
        </p>
      </div>

      <form v-if="paso === 'correo'" class="flex flex-col gap-5" @submit.prevent="pedirCodigo">
        <div class="flex flex-col gap-1.5">
          <label for="correo" :class="labelCls">Correo electrónico</label>
          <input
            id="correo"
            v-model="correo"
            type="email"
            placeholder="tu@correo.com"
            autocomplete="email"
            required
            :class="inputCls"
          />
        </div>
        <p v-if="error" class="text-red-500 text-xs pl-1">{{ error }}</p>
        <button type="submit" :disabled="loading" :class="btnCls">
          <LoadingDots v-if="loading" />
          <template v-else>Enviar código <ArrowRight :size="15" /></template>
        </button>
      </form>

      <form v-else class="flex flex-col gap-5" @submit.prevent="cambiar">
        <div class="flex flex-col gap-1.5">
          <label for="codigo" :class="labelCls">Código</label>
          <input
            id="codigo"
            v-model="codigo"
            inputmode="numeric"
            autocomplete="one-time-code"
            pattern="\d{6}"
            maxlength="6"
            placeholder="000000"
            required
            :class="[inputCls, 'tracking-[0.4em] font-semibold']"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="password" :class="labelCls">Contraseña nueva</label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Mínimo 8 caracteres"
              autocomplete="new-password"
              minlength="8"
              maxlength="72"
              required
              :class="[inputCls, 'pr-11']"
            />
            <button
              type="button"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a89f95] hover:text-[#1a1714] transition-colors duration-150"
              tabindex="-1"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" :size="16" />
              <Eye v-else :size="16" />
            </button>
          </div>
        </div>
        <p v-if="error" class="text-red-500 text-xs pl-1">{{ error }}</p>
        <button type="submit" :disabled="loading" :class="btnCls">
          <LoadingDots v-if="loading" />
          <template v-else>Cambiar contraseña</template>
        </button>
      </form>
    </template>

    <template #footer>
      <p class="mt-10 mb-4 text-[#a89f95] text-xs text-center">
        © 2026 MU Real Estate. Todos los derechos reservados.
      </p>
    </template>
  </AuthSplitLayout>
</template>
