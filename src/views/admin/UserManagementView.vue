<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Check, Edit2, Lock, MoreHorizontal, Plus, Search, Settings, Shield, Trash2, UserCheck, UserX, Users, X } from 'lucide-vue-next'
import AdminTopBar from '@/components/admin/AdminTopBar.vue'
import AdminLogoutActions from '@/components/admin/AdminLogoutActions.vue'
import UserModal from '@/components/admin/UserModal.vue'
import { ESTADOS_USUARIO, ROLES, ROLES_KEYS } from '@/components/admin/rolesConfig'
import { PERMISOS_CATALOGO, PERMISOS_POR_ROL } from '@/constants/permisos'
import { adminUsuariosService } from '@/services/admin.service'
import type { RolAdmin, UsuarioAdmin } from '@/types/admin'
import { SERIF } from '@/config'

const usuarios = ref<UsuarioAdmin[]>([])
const search = ref('')
const filtroRol = ref<RolAdmin | 'todos'>('todos')
const modal = ref<{ open: boolean; usuario: UsuarioAdmin | null; mode: 'edit' | 'create' }>({
  open: false,
  usuario: null,
  mode: 'create',
})
const menuOpen = ref<number | null>(null)
const tab = ref<'usuarios' | 'roles'>('usuarios')

onMounted(async () => {
  usuarios.value = await adminUsuariosService.listar()
})

const filtrados = computed(() => {
  const q = search.value.toLowerCase()
  return usuarios.value.filter(
    (u) =>
      (u.nombre.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q)) &&
      (filtroRol.value === 'todos' || u.rol === filtroRol.value),
  )
})

const stats = computed(() => [
  { label: 'Total usuarios', value: usuarios.value.length, color: 'text-white/50', icon: Users },
  { label: 'Activos', value: usuarios.value.filter((u) => u.estado === 'activo').length, color: 'text-emerald-400', icon: UserCheck },
  { label: 'Suspendidos', value: usuarios.value.filter((u) => u.estado === 'suspendido').length, color: 'text-red-400', icon: UserX },
  { label: 'Roles definidos', value: ROLES_KEYS.length, color: 'text-purple-400', icon: Lock },
])

const grupos = [...new Set(PERMISOS_CATALOGO.map((p) => p.grupo))]
const filtrosRol: [RolAdmin | 'todos', string][] = [['todos', 'Todos'], ...ROLES_KEYS.map((k) => [k, ROLES[k].label] as [RolAdmin, string])]

const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

function cerrarModal() {
  modal.value = { open: false, usuario: null, mode: 'create' }
}

async function handleSave(u: UsuarioAdmin | Omit<UsuarioAdmin, 'id'>) {
  if ('id' in u) {
    const actualizado = await adminUsuariosService.actualizar(u.id, u)
    usuarios.value = usuarios.value.map((x) => (x.id === u.id ? actualizado : x))
  } else {
    usuarios.value = [...usuarios.value, await adminUsuariosService.crear(u)]
  }
  cerrarModal()
}

async function handleDelete(id: number) {
  menuOpen.value = null
  await adminUsuariosService.eliminar(id)
  usuarios.value = usuarios.value.filter((u) => u.id !== id)
}

async function handleToggleEstado(u: UsuarioAdmin) {
  menuOpen.value = null
  const actualizado = await adminUsuariosService.actualizar(u.id, { estado: u.estado === 'activo' ? 'suspendido' : 'activo' })
  usuarios.value = usuarios.value.map((x) => (x.id === u.id ? actualizado : x))
}
</script>

<template>
  <div class="min-h-screen bg-[#0d0d0c] font-['DM_Sans',sans-serif]">
    <UserModal v-if="modal.open" :usuario="modal.usuario" :mode="modal.mode" @close="cerrarModal" @save="handleSave" />

    <AdminTopBar section="Usuarios & Roles" wide>
      <template #actions><AdminLogoutActions /></template>
    </AdminTopBar>

    <div class="max-w-screen-2xl mx-auto px-5 py-7">
      <div class="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 class="text-white text-2xl mb-1" :style="SERIF">Gestión de Usuarios</h1>
          <p class="text-white/30 text-sm">Administra usuarios, roles y permisos de acceso al sistema.</p>
        </div>
        <button
          class="flex items-center gap-2 bg-white text-[#0d0d0c] text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-white/90 transition-all"
          @click="modal = { open: true, usuario: null, mode: 'create' }"
        >
          <Plus :size="14" /> Nuevo usuario
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div v-for="s in stats" :key="s.label" class="bg-white/3 border border-white/6 rounded-xl px-4 py-4">
          <div :class="['flex items-center gap-2 mb-2', s.color]">
            <component :is="s.icon" :size="13" /><span class="text-xs opacity-80">{{ s.label }}</span>
          </div>
          <p class="text-white text-2xl font-medium" :style="SERIF">{{ s.value }}</p>
        </div>
      </div>

      <div class="flex items-center gap-1 mb-6 border-b border-white/6 pb-0">
        <button
          v-for="t in [
            { val: 'usuarios', label: 'Usuarios', icon: Users },
            { val: 'roles', label: 'Roles & Permisos', icon: Shield },
          ] as const"
          :key="t.val"
          :class="[
            'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-150 -mb-px',
            tab === t.val ? 'border-white/60 text-white/80' : 'border-transparent text-white/30 hover:text-white/50 hover:border-white/20',
          ]"
          @click="tab = t.val"
        >
          <component :is="t.icon" :size="13" /> {{ t.label }}
        </button>
      </div>

      <template v-if="tab === 'usuarios'">
        <div class="flex flex-wrap items-center gap-3 mb-5">
          <div class="flex items-center bg-white/5 border border-white/8 rounded-lg px-3 py-2 gap-2 w-60">
            <Search :size="13" class="text-white/20 shrink-0" />
            <input
              v-model="search"
              type="text"
              placeholder="Buscar usuario..."
              class="flex-1 bg-transparent text-xs text-white placeholder-white/20 outline-none"
            />
          </div>
          <div class="flex items-center gap-1.5 flex-wrap">
            <button
              v-for="[val, label] in filtrosRol"
              :key="val"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs transition-all border',
                filtroRol === val
                  ? 'bg-white/10 border-white/20 text-white/80'
                  : 'bg-transparent border-white/6 text-white/30 hover:border-white/12 hover:text-white/50',
              ]"
              @click="filtroRol = val"
            >
              {{ label }}
            </button>
          </div>
        </div>

        <div class="bg-white/2 border border-white/6 rounded-xl">
          <table class="w-full">
            <thead>
              <tr class="border-b border-white/6">
                <th class="text-left px-5 py-3.5 text-white/25 text-xs tracking-widest uppercase font-medium">Usuario</th>
                <th class="text-left px-4 py-3.5 text-white/25 text-xs tracking-widest uppercase font-medium hidden sm:table-cell">Rol</th>
                <th class="text-left px-4 py-3.5 text-white/25 text-xs tracking-widest uppercase font-medium hidden md:table-cell">Estado</th>
                <th class="text-left px-4 py-3.5 text-white/25 text-xs tracking-widest uppercase font-medium hidden lg:table-cell">
                  Último acceso
                </th>
                <th class="text-left px-4 py-3.5 text-white/25 text-xs tracking-widest uppercase font-medium hidden xl:table-cell">
                  Permisos
                </th>
                <th class="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(u, idx) in filtrados"
                :key="u.id"
                :class="['border-b border-white/4 hover:bg-white/3 transition-all', idx === filtrados.length - 1 ? 'border-b-0' : '']"
              >
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-xs text-white/50 font-medium shrink-0">
                      {{ initials(u.nombre) }}
                    </div>
                    <div>
                      <p class="text-white/80 text-sm font-medium">{{ u.nombre }}</p>
                      <p class="text-white/25 text-xs">{{ u.correo }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4 hidden sm:table-cell">
                  <span :class="['inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border', ROLES[u.rol].bg, ROLES[u.rol].color]">
                    <component :is="ROLES[u.rol].icon" :size="11" /> {{ ROLES[u.rol].label }}
                  </span>
                </td>
                <td class="px-4 py-4 hidden md:table-cell">
                  <span :class="['flex items-center gap-1.5 text-xs', ESTADOS_USUARIO[u.estado].text]">
                    <span :class="['w-1.5 h-1.5 rounded-full', ESTADOS_USUARIO[u.estado].dot]" /> {{ ESTADOS_USUARIO[u.estado].label }}
                  </span>
                </td>
                <td class="px-4 py-4 hidden lg:table-cell">
                  <span class="text-white/25 text-xs">{{ u.ultimoAcceso }}</span>
                </td>
                <td class="px-4 py-4 hidden xl:table-cell">
                  <span class="text-white/30 text-xs">{{ u.permisos.length }} / {{ PERMISOS_CATALOGO.length }}</span>
                </td>
                <td class="px-4 py-4 text-right relative">
                  <button
                    class="p-1.5 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/5 transition-all"
                    @click="menuOpen = menuOpen === u.id ? null : u.id"
                  >
                    <MoreHorizontal :size="14" />
                  </button>
                  <div
                    v-if="menuOpen === u.id"
                    class="absolute right-4 top-full mt-1 z-20 bg-[#1a1a18] border border-white/10 rounded-xl py-1.5 w-44 shadow-2xl"
                  >
                    <button
                      class="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-white/50 hover:text-white/80 hover:bg-white/5 transition-all"
                      @click="(modal = { open: true, usuario: u, mode: 'edit' }), (menuOpen = null)"
                    >
                      <Edit2 :size="12" /> Editar usuario
                    </button>
                    <button
                      class="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-white/50 hover:text-white/80 hover:bg-white/5 transition-all"
                      @click="handleToggleEstado(u)"
                    >
                      <UserX v-if="u.estado === 'activo'" :size="12" />
                      <UserCheck v-else :size="12" />
                      {{ u.estado === 'activo' ? 'Suspender' : 'Activar' }}
                    </button>
                    <div class="my-1 border-t border-white/6" />
                    <button
                      class="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-400 hover:bg-red-400/5 transition-all"
                      @click="handleDelete(u.id)"
                    >
                      <Trash2 :size="12" /> Eliminar
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!filtrados.length">
                <td colspan="6" class="text-center py-12 text-white/20 text-sm">Sin resultados</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div v-for="rol in ROLES_KEYS" :key="rol" class="bg-white/3 border border-white/6 rounded-2xl p-5">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div :class="['w-8 h-8 rounded-xl border flex items-center justify-center', ROLES[rol].bg, ROLES[rol].color]">
                <component :is="ROLES[rol].icon" :size="11" />
              </div>
              <div>
                <p :class="['text-sm font-medium', ROLES[rol].color]">{{ ROLES[rol].label }}</p>
                <p class="text-white/25 text-xs">
                  {{ usuarios.filter((u) => u.rol === rol).length }} usuario{{ usuarios.filter((u) => u.rol === rol).length !== 1 ? 's' : '' }}
                </p>
              </div>
            </div>
            <button class="p-1.5 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/5 transition-all">
              <Settings :size="13" />
            </button>
          </div>
          <div class="space-y-3">
            <div v-for="grupo in grupos" :key="grupo">
              <p class="text-white/20 text-[10px] tracking-widest uppercase mb-1.5">{{ grupo }}</p>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="p in PERMISOS_CATALOGO.filter((x) => x.grupo === grupo)"
                  :key="p.id"
                  :class="[
                    'inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border',
                    PERMISOS_POR_ROL[rol].includes(p.id)
                      ? [ROLES[rol].bg, ROLES[rol].color]
                      : 'bg-transparent border-white/5 text-white/15',
                  ]"
                >
                  <Check v-if="PERMISOS_POR_ROL[rol].includes(p.id)" :size="8" />
                  <X v-else :size="8" />
                  {{ p.label }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="menuOpen !== null" class="fixed inset-0 z-10" @click="menuOpen = null" />
  </div>
</template>
