<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

function logout() {
  auth.logout()
  router.push('/admin')
}
</script>

<template>
  <div class="flex items-center gap-2">
    <button
      class="flex items-center gap-2 text-white/30 text-sm hover:text-white/60 transition-all px-3 py-2 rounded-lg hover:bg-white/5"
      @click="router.push('/admin/panel')"
    >
      <ArrowLeft :size="14" /> Panel
    </button>
    <button
      class="p-2 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/5 transition-all"
      title="Cerrar sesión"
      @click="logout"
    >
      <LogOut :size="15" />
    </button>
  </div>
</template>
