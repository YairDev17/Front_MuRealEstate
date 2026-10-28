<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, CheckCircle2, Mail, RefreshCw } from 'lucide-vue-next'
import AuthSplitLayout from '@/components/layout/AuthSplitLayout.vue'
import LoadingDots from '@/components/ui/LoadingDots.vue'
import muIsotipo from '@/assets/images/IsotipoMUrealEstate-removebg-preview.png'
import { authService } from '@/services/auth.service'
import { SERIF } from '@/config'

interface RegistroState {
  correo?: string
  nombre?: string
  interesadoEnPublicar?: boolean
}

const CODE_LENGTH = 6
const RESEND_SECONDS = 60

const router = useRouter()
const state = (window.history.state ?? {}) as RegistroState
const correo = state.correo ?? 'tu correo'
const nombre = state.nombre ?? ''
const interesadoEnPublicar = state.interesadoEnPublicar ?? false

const digits = ref<string[]>(Array(CODE_LENGTH).fill(''))
const error = ref(false)
const errorMsg = ref('')
const verified = ref(false)
const loading = ref(false)
const countdown = ref(RESEND_SECONDS)
const resendSent = ref(false)
const inputRefs = ref<HTMLInputElement[]>([])

let countdownTimer: ReturnType<typeof setTimeout> | undefined

function tick() {
  clearTimeout(countdownTimer)
  if (countdown.value === 0) return
  countdownTimer = setTimeout(() => countdown.value--, 1000)
}
watch(countdown, tick)

onMounted(() => {
  inputRefs.value[0]?.focus()
  tick()
})
onBeforeUnmount(() => clearTimeout(countdownTimer))

function focusAt(i: number) {
  inputRefs.value[i]?.focus()
}

function handleDigitInput(index: number, e: Event) {
  const input = e.target as HTMLInputElement
  let nums = input.value.replace(/\D/g, '')
  // Escribir sobre una casilla ya llena: reemplaza el dígito anterior
  const prev = digits.value[index]
  if (prev && nums.length === 2) nums = nums[0] === prev ? nums.slice(1) : nums.slice(0, 1)
  // Varios dígitos a la vez (autollenado del código SMS / tipeo rápido): repartirlos
  if (nums.length > 1) {
    const chars = nums.slice(0, CODE_LENGTH - index).split('')
    chars.forEach((ch, i) => (digits.value[index + i] = ch))
    input.value = digits.value[index] ?? ''
    error.value = false
    focusAt(Math.min(index + chars.length, CODE_LENGTH - 1))
    return
  }
  // Mantiene el input sincronizado aunque se escriba un carácter no numérico
  input.value = nums || digits.value[index] || ''
  if (!nums) return
  digits.value[index] = nums
  error.value = false
  if (index < CODE_LENGTH - 1) focusAt(index + 1)
}

function handleKeyDown(index: number, e: KeyboardEvent) {
  if (e.key === 'Backspace') {
    if (digits.value[index]) {
      digits.value[index] = ''
    } else if (index > 0) {
      focusAt(index - 1)
    }
  } else if (e.key === 'ArrowLeft' && index > 0) {
    focusAt(index - 1)
  } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
    focusAt(index + 1)
  }
}

function handlePaste(e: ClipboardEvent) {
  e.preventDefault()
  const pasted = (e.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, CODE_LENGTH)
  if (!pasted) return
  const next: string[] = Array(CODE_LENGTH).fill('')
  pasted.split('').forEach((ch, i) => (next[i] = ch))
  digits.value = next
  focusAt(Math.min(pasted.length, CODE_LENGTH - 1))
}

async function handleVerify() {
  const codigo = digits.value.join('')
  if (codigo.length < CODE_LENGTH) {
    error.value = true
    errorMsg.value = 'Ingresa el código completo de 6 dígitos.'
    return
  }
  loading.value = true
  try {
    await authService.verificarCorreo({ correo, codigo })
    verified.value = true
  } catch (e) {
    error.value = true
    errorMsg.value = e instanceof Error ? e.message : 'El código no es válido.'
  } finally {
    loading.value = false
  }
}

async function handleResend() {
  if (countdown.value > 0) return
  countdown.value = RESEND_SECONDS
  digits.value = Array(CODE_LENGTH).fill('')
  error.value = false
  focusAt(0)
  await authService.reenviarCodigo(correo)
  resendSent.value = true
  setTimeout(() => (resendSent.value = false), 3000)
}

function maskEmail(email: string) {
  const [user = '', domain] = email.split('@')
  if (!domain) return email
  return `${user.slice(0, 2)}${'•'.repeat(Math.max(user.length - 2, 3))}@${domain}`
}

function digitClass(d: string) {
  if (error.value) return 'bg-red-50 border-2 border-red-300 text-red-700'
  if (d) return 'bg-[#1c2b47] border-2 border-[#1c2b47] text-[#f5f2ee]'
  return 'bg-[#ede8e2] border-2 border-transparent text-[#1a1714] focus:border-[#1c2b47]/40 focus:bg-[#e8e3dc]'
}
</script>

<template>
  <AuthSplitLayout
    image="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1400&h=1800&fit=crop&auto=format"
    overlay-class="from-black/65 via-black/35 to-black/10"
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
        Un solo paso más para comenzar.
      </p>
      <p class="text-white/60 text-sm leading-relaxed">
        Verifica tu correo y accede a las mejores propiedades del mercado.
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

    <!-- ── Verified success ── -->
    <div v-if="verified" class="flex flex-col items-center text-center gap-6 py-8">
      <div class="relative">
        <div class="w-20 h-20 rounded-full bg-[#1c2b47]/10 flex items-center justify-center">
          <CheckCircle2 :size="38" class="text-[#1c2b47]" :stroke-width="1.4" />
        </div>
        <div
          class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#b8935a] flex items-center justify-center"
        >
          <span class="text-white text-xs font-bold">✓</span>
        </div>
      </div>
      <div>
        <h2 class="text-[#1a1714] text-3xl mb-2" :style="SERIF">¡Correo verificado!</h2>
        <p class="text-[#7a7067] text-sm leading-relaxed">
          <template v-if="nombre">
            Bienvenido, <span class="font-medium text-[#1a1714]">{{ nombre }}</span
            >. Tu cuenta está lista.
          </template>
          <template v-else>Tu cuenta ha sido verificada exitosamente.</template>
        </p>
      </div>

      <div
        v-if="interesadoEnPublicar"
        class="w-full rounded-xl bg-[#1c2b47]/5 border border-[#1c2b47]/10 px-5 py-4 text-left"
      >
        <p class="text-xs uppercase tracking-widest text-[#b8935a] font-medium mb-1">
          Próximo paso
        </p>
        <p class="text-sm text-[#1a1714]">
          Un asesor de MU Real Estate te contactará para ayudarte a publicar tu propiedad.
        </p>
      </div>

      <button
        class="w-full bg-[#1c2b47] text-[#f5f2ee] rounded-lg py-3.5 text-sm font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-[#243559] active:scale-[0.99] transition-all duration-200"
        @click="router.push('/login')"
      >
        Iniciar sesión
      </button>
    </div>

    <!-- ── OTP form ── -->
    <template v-else>
      <div class="mb-8">
        <button
          type="button"
          class="flex items-center gap-1.5 text-xs text-[#7a7067] hover:text-[#1a1714] transition-colors duration-150 mb-6"
          @click="router.push('/registro')"
        >
          <ArrowLeft :size="13" /> Volver al registro
        </button>

        <div class="w-14 h-14 rounded-2xl bg-[#1c2b47]/8 flex items-center justify-center mb-6">
          <Mail :size="26" class="text-[#1c2b47]" :stroke-width="1.4" />
        </div>

        <h1 class="text-[#1a1714] text-3xl xl:text-4xl mb-2" :style="SERIF">Verifica tu correo</h1>
        <p class="text-[#7a7067] text-sm leading-relaxed">
          Enviamos un código de 6 dígitos a
          <span class="font-medium text-[#1a1714]">{{ maskEmail(correo) }}</span
          >. Revisa tu bandeja de entrada.
        </p>
      </div>

      <div class="flex gap-3 mb-2" @paste="handlePaste">
        <input
          v-for="(d, i) in digits"
          :key="i"
          :ref="
            (el) => {
              if (el) inputRefs[i] = el as HTMLInputElement
            }
          "
          type="text"
          inputmode="numeric"
          :autocomplete="i === 0 ? 'one-time-code' : 'off'"
          :value="d"
          :class="[
            'w-full aspect-square text-center text-xl font-semibold rounded-xl transition-all duration-200 outline-none select-none',
            digitClass(d),
          ]"
          style="caret-color: transparent"
          @input="handleDigitInput(i, $event)"
          @keydown="handleKeyDown(i, $event)"
        />
      </div>

      <p v-if="error" class="text-red-500 text-xs mb-4 pl-1">{{ errorMsg }}</p>

      <button
        :disabled="loading"
        class="mt-5 w-full bg-[#1c2b47] text-[#f5f2ee] rounded-lg py-3.5 text-sm font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-[#243559] active:scale-[0.99] transition-all duration-200 disabled:opacity-60"
        @click="handleVerify"
      >
        <LoadingDots v-if="loading" />
        <template v-else>Verificar correo</template>
      </button>

      <div class="mt-6 flex items-center justify-center gap-2 text-sm">
        <span class="text-[#7a7067]">¿No recibiste el código?</span>
        <span v-if="countdown > 0" class="text-[#a89f95] text-xs tabular-nums"
          >Reenviar en {{ countdown }}s</span
        >
        <button
          v-else
          type="button"
          class="flex items-center gap-1.5 text-[#b8935a] font-medium hover:text-[#9e7a45] transition-colors duration-150 text-xs"
          @click="handleResend"
        >
          <RefreshCw :size="12" /> Reenviar código
        </button>
      </div>

      <p v-if="resendSent" class="mt-3 text-center text-xs text-[#b8935a]">
        Código reenviado. Revisa tu bandeja de entrada.
      </p>

      <p class="mt-8 text-[#a89f95] text-xs leading-relaxed text-center">
        Si no encuentras el correo, revisa tu carpeta de spam o correo no deseado.
      </p>
    </template>

    <template #footer>
      <p class="mt-10 mb-4 text-[#a89f95] text-xs text-center">
        © 2026 MU Real Estate. Todos los derechos reservados.
      </p>
    </template>
  </AuthSplitLayout>
</template>
