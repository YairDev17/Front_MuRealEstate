<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-vue-next'
import AuthSplitLayout from '@/components/layout/AuthSplitLayout.vue'
import LoadingDots from '@/components/ui/LoadingDots.vue'
import muIsotipo from '@/assets/images/IsotipoMUrealEstate-removebg-preview.png'
import { authService } from '@/services/auth.service'
import type { RegistroPayload } from '@/types/auth'
import { SERIF } from '@/config'

const router = useRouter()

const form = reactive<RegistroPayload>({
  nombre: '',
  apellido: '',
  correo: '',
  telefono: '',
  password: '',
  interesadoEnPublicar: false,
})
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const inputCls =
  'w-full bg-[#ede8e2] border border-transparent rounded-lg px-4 py-3 text-sm text-[#1a1714] placeholder-[#a89f95] outline-none transition-all duration-200 focus:border-[#1a1714]/30 focus:bg-[#e8e3dc]'
const labelCls = 'text-[#1a1714] text-xs font-medium tracking-wider uppercase'

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    await authService.registro({ ...form })
    router.push({
      path: '/verificacion',
      state: {
        correo: form.correo,
        nombre: form.nombre,
        interesadoEnPublicar: form.interesadoEnPublicar,
      },
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo crear la cuenta.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthSplitLayout
    image="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&h=1800&fit=crop&auto=format"
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
        Tu siguiente propiedad empieza aquí.
      </p>
      <p class="text-white/60 text-sm leading-relaxed">
        Crea tu cuenta y accede a las mejores oportunidades del mercado inmobiliario.
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

    <div class="mb-8">
      <button
        type="button"
        class="flex items-center gap-1.5 text-xs text-[#7a7067] hover:text-[#1a1714] transition-colors duration-150 mb-6"
        @click="router.push('/login')"
      >
        <ArrowLeft :size="13" /> Volver al inicio de sesión
      </button>
      <h1 class="text-[#1a1714] text-3xl xl:text-4xl mb-2" :style="SERIF">Crear cuenta</h1>
      <p class="text-[#7a7067] text-sm">Completa los datos para registrarte.</p>
    </div>

    <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
      <!-- Nombre + Apellido -->
      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label for="nombre" :class="labelCls">Nombre</label>
          <input
            id="nombre"
            v-model="form.nombre"
            type="text"
            placeholder="Juan"
            required
            :class="inputCls"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="apellido" :class="labelCls">Apellido</label>
          <input
            id="apellido"
            v-model="form.apellido"
            type="text"
            placeholder="García"
            required
            :class="inputCls"
          />
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="correo" :class="labelCls">Correo electrónico</label>
        <input
          id="correo"
          v-model="form.correo"
          type="email"
          placeholder="tu@correo.com"
          required
          :class="inputCls"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="telefono" :class="labelCls">Número telefónico</label>
        <input
          id="telefono"
          v-model="form.telefono"
          type="tel"
          placeholder="+52 55 0000 0000"
          required
          :class="inputCls"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="password" :class="labelCls">Contraseña</label>
        <div class="relative">
          <input
            id="password"
            v-model="form.password"
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

      <!-- ¿Interesado en publicar? — toggle pill -->
      <div class="flex flex-col gap-2">
        <span :class="labelCls">¿Tienes una propiedad para publicar?</span>
        <button
          type="button"
          :class="[
            'w-full rounded-xl px-5 py-4 text-sm font-medium text-left border-2 transition-all duration-200 active:scale-[0.99] flex items-center justify-between',
            form.interesadoEnPublicar
              ? 'bg-[#1c2b47] border-[#1c2b47] text-[#f5f2ee]'
              : 'bg-[#ede8e2] border-transparent text-[#7a7067] hover:border-[#1a1714]/20',
          ]"
          @click="form.interesadoEnPublicar = !form.interesadoEnPublicar"
        >
          <span>
            {{
              form.interesadoEnPublicar
                ? 'Sí, estoy interesado en publicar'
                : 'No, solo quiero explorar propiedades'
            }}
          </span>
          <span
            :class="[
              'w-10 h-6 rounded-full flex-shrink-0 relative transition-all duration-300',
              form.interesadoEnPublicar ? 'bg-[#b8935a]' : 'bg-[#a89f95]/40',
            ]"
          >
            <span
              :class="[
                'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300',
                form.interesadoEnPublicar ? 'left-5' : 'left-1',
              ]"
            />
          </span>
        </button>
        <p class="text-[#a89f95] text-xs leading-relaxed pl-1">
          {{
            form.interesadoEnPublicar
              ? 'Podrás subir tu propiedad con fotos y seguir su revisión desde tu cuenta.'
              : 'Podrás publicar propiedades más adelante si cambias de opinión.'
          }}
        </p>
      </div>

      <p v-if="error" class="text-red-500 text-xs pl-1">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="mt-1 w-full bg-[#1c2b47] text-[#f5f2ee] rounded-lg py-3.5 text-sm font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-[#243559] active:scale-[0.99] transition-all duration-200 disabled:opacity-60"
      >
        <LoadingDots v-if="loading" />
        <template v-else>Crear cuenta <ArrowRight :size="15" /></template>
      </button>
    </form>

    <template #footer>
      <p class="mt-10 mb-4 text-[#a89f95] text-xs text-center">
        © 2026 MU Real Estate. Todos los derechos reservados.
      </p>
    </template>
  </AuthSplitLayout>
</template>
