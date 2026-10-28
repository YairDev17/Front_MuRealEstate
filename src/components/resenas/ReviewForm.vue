<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle2, Send } from 'lucide-vue-next'
import StarRating from '@/components/ui/StarRating.vue'
import LoadingDots from '@/components/ui/LoadingDots.vue'
import { resenasService } from '@/services/modulos.service'
import { useAuthStore } from '@/stores/auth'
import type { Resena } from '@/types/modulos'

const props = defineProps<{ propiedadId?: number; propiedad?: string }>()
const router = useRouter()
const auth = useAuthStore()

const PERFILES = props.propiedadId
  ? ['Visité la propiedad', 'Comprador(a)', 'Inquilino(a)']
  : ['Comprador(a)', 'Inquilino(a)', 'Propietario(a)', 'Inversionista']

const form = reactive({ calificacion: 0, perfil: PERFILES[0]!, comentario: '' })
const enviando = ref(false)
const enviada = ref(false)
const error = ref('')

async function enviar() {
  if (!form.calificacion) return (error.value = 'Elige una calificación de 1 a 5 estrellas.')
  if (form.comentario.trim().length < 20)
    return (error.value = 'Cuéntanos un poco más (mínimo 20 caracteres).')
  error.value = ''
  enviando.value = true
  try {
    await resenasService.enviar({
      propiedadId: props.propiedadId,
      propiedad: props.propiedad,
      autor: auth.usuario ? `${auth.usuario.nombre} ${auth.usuario.apellido}` : 'Cliente',
      perfil: form.perfil,
      calificacion: form.calificacion as Resena['calificacion'],
      comentario: form.comentario.trim(),
    })
    enviada.value = true
  } finally {
    enviando.value = false
  }
}

const inputCls =
  'w-full bg-[#ede8e2] border border-transparent rounded-md px-4 py-3 text-sm text-[#1a1714] placeholder-[#a89f95] outline-none transition-all duration-200 focus:border-[#1a1714]/25 focus:bg-[#e8e3dc]'
</script>

<template>
  <div class="bg-white border border-[#1a1714]/8 rounded-md p-6">
    <div
      v-if="!auth.isAuthenticated"
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <p class="text-[#7a7067] text-sm">
        Inicia sesión para calificar {{ propiedadId ? 'esta propiedad' : 'nuestro servicio' }}.
      </p>
      <button
        class="px-4 py-2 rounded-md bg-[#1c2b47] text-[#f5f2ee] text-sm font-medium hover:bg-[#243559] transition-all"
        @click="
          router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
        "
      >
        Iniciar sesión
      </button>
    </div>

    <div v-else-if="enviada" class="flex items-start gap-3">
      <CheckCircle2 :size="20" class="text-[#b8935a] shrink-0 mt-0.5" />
      <div>
        <p class="text-[#1a1714] text-sm font-medium">¡Gracias por tu reseña!</p>
        <p class="text-[#7a7067] text-sm">La publicaremos en cuanto nuestro equipo la revise.</p>
      </div>
    </div>

    <form v-else class="flex flex-col gap-4" @submit.prevent="enviar">
      <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div>
          <p class="text-[#1a1714] text-xs font-medium tracking-wider uppercase mb-1.5">
            Tu calificación
          </p>
          <StarRating v-model="form.calificacion" :size="22" />
        </div>
        <div class="flex-1 min-w-[180px]">
          <p class="text-[#1a1714] text-xs font-medium tracking-wider uppercase mb-1.5">
            Tu experiencia como
          </p>
          <select v-model="form.perfil" :class="inputCls">
            <option v-for="p in PERFILES" :key="p">{{ p }}</option>
          </select>
        </div>
      </div>
      <textarea
        v-model="form.comentario"
        rows="3"
        :class="[inputCls, 'resize-none']"
        :placeholder="
          propiedadId
            ? '¿Qué te pareció la propiedad y la visita?'
            : '¿Cómo fue tu experiencia con MU Real Estate?'
        "
      />
      <div class="flex items-center justify-between gap-3">
        <p class="text-xs" :class="error ? 'text-red-500' : 'text-[#a89f95]'">
          {{ error || 'Las reseñas se publican tras una revisión del equipo.' }}
        </p>
        <button
          type="submit"
          :disabled="enviando"
          class="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#1c2b47] text-[#f5f2ee] text-sm font-medium hover:bg-[#243559] transition-all disabled:opacity-60"
        >
          <LoadingDots v-if="enviando" />
          <template v-else><Send :size="13" /> Enviar reseña</template>
        </button>
      </div>
    </form>
  </div>
</template>
