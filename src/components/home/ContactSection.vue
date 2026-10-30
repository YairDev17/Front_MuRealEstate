<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from 'lucide-vue-next'
import { contactoService } from '@/services/contacto.service'
import { SERIF } from '@/config'

const form = reactive({ nombre: '', correo: '', telefono: '', mensaje: '' })
const sending = ref(false)
const sent = ref(false)
const error = ref('')

async function handleSubmit() {
  sending.value = true
  error.value = ''
  try {
    await contactoService.enviar({ ...form })
    sent.value = true
    Object.assign(form, { nombre: '', correo: '', telefono: '', mensaje: '' })
    setTimeout(() => (sent.value = false), 3500)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo enviar el mensaje.'
  } finally {
    sending.value = false
  }
}

const inputCls =
  'w-full bg-[#ede8e2] border border-transparent rounded-md px-4 py-3 text-sm text-[#1a1714] placeholder-[#a89f95] outline-none transition-all duration-200 focus:border-[#1a1714]/25 focus:bg-[#e8e3dc]'
const labelCls = 'text-[#1a1714] text-xs font-medium tracking-wider uppercase mb-1.5 block'

const contactItems = [
  { label: 'Teléfono', val: '+52 55 1234 5678', icon: Phone },
  { label: 'Correo electrónico', val: 'contacto@murealestate.mx', icon: Mail },
  { label: 'Oficina principal', val: 'Av. Presidente Masaryk 123, Polanco, CDMX', icon: MapPin },
]

const socialLinks = [
  { label: 'Instagram', icon: Instagram },
  { label: 'Facebook', icon: Facebook },
  { label: 'Twitter', icon: Twitter },
  { label: 'LinkedIn', icon: Linkedin },
]
</script>

<template>
  <section id="contacto" class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-14 xl:gap-20">
        <div>
          <p class="text-[#a89f95] text-xs tracking-widest uppercase mb-3">Contacto</p>
          <h2 class="text-[#1a1714] text-3xl lg:text-4xl leading-snug mb-6" :style="SERIF">
            Hablemos sobre tu próxima propiedad.
          </h2>
          <p class="text-[#7a7067] text-sm leading-relaxed mb-10">
            Nuestros asesores están disponibles de lunes a viernes de 9:00 a 19:00 h y sábados de
            10:00 a 14:00 h. Respondemos en menos de dos horas.
          </p>
          <div class="flex flex-col gap-5 mb-8">
            <div v-for="item in contactItems" :key="item.label" class="flex items-start gap-4">
              <div
                class="w-10 h-10 rounded-md bg-[#f5f2ee] flex items-center justify-center text-[#7a7067] shrink-0"
              >
                <component :is="item.icon" :size="16" />
              </div>
              <div>
                <p class="text-[#a89f95] text-xs mb-0.5">{{ item.label }}</p>
                <p class="text-[#1a1714] text-sm">{{ item.val }}</p>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button
              v-for="s in socialLinks"
              :key="s.label"
              :title="s.label"
              class="w-9 h-9 rounded-md bg-[#f5f2ee] flex items-center justify-center text-[#7a7067] hover:bg-[#1a1714] hover:text-white transition-all duration-200"
            >
              <component :is="s.icon" :size="16" />
            </button>
          </div>
        </div>

        <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label :class="labelCls">Nombre</label>
              <input
                v-model="form.nombre"
                type="text"
                required
                placeholder="Tu nombre completo"
                :class="inputCls"
              />
            </div>
            <div>
              <label :class="labelCls">Teléfono</label>
              <input
                v-model="form.telefono"
                type="tel"
                placeholder="+52 55 0000 0000"
                :class="inputCls"
              />
            </div>
          </div>
          <div>
            <label :class="labelCls">Correo electrónico</label>
            <input
              v-model="form.correo"
              type="email"
              required
              placeholder="tu@correo.com"
              :class="inputCls"
            />
          </div>
          <div>
            <label :class="labelCls">Mensaje</label>
            <textarea
              v-model="form.mensaje"
              required
              rows="4"
              placeholder="¿Qué tipo de propiedad buscas? ¿Tienes alguna zona o presupuesto en mente?"
              :class="[inputCls, 'resize-none']"
            />
          </div>
          <p v-if="error" class="text-red-500 text-xs">{{ error }}</p>
          <button
            type="submit"
            :disabled="sending"
            class="w-full bg-[#1a1714] text-[#f5f2ee] rounded-md py-3.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#2d2926] active:scale-[0.99] transition-all duration-200 disabled:opacity-60"
          >
            <template v-if="sent">¡Mensaje enviado! Te contactamos pronto.</template>
            <span v-else class="flex items-center gap-2"
              >Enviar mensaje <ArrowRight :size="14"
            /></span>
          </button>
          <p class="text-[#a89f95] text-xs text-center">
            Respondemos en menos de 2 horas en días hábiles.
          </p>
        </form>
      </div>
    </div>
  </section>
</template>
