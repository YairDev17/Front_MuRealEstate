import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    /** Requiere sesión de administrador. */
    requiresAdmin?: boolean
    /** Requiere cualquier sesión iniciada. */
    requiresAuth?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    // ── Sitio público / usuario ──
    { path: '/', name: 'home', component: () => import('@/views/user/HomeView.vue') },
    { path: '/home', redirect: '/' },
    {
      path: '/property/:id',
      name: 'property-detail',
      component: () => import('@/views/user/PropertyDetailView.vue'),
      props: true,
    },
    {
      path: '/publicar',
      meta: { requiresAuth: true },
      name: 'publicar',
      component: () => import('@/views/user/PublishPropertyView.vue'),
    },
    {
      path: '/cuenta/favoritos',
      name: 'mis-favoritos',
      component: () => import('@/views/user/MisFavoritosView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/notificaciones',
      name: 'notificaciones',
      component: () => import('@/views/user/NotificacionesView.vue'),
      meta: { requiresAuth: true },
    },

    // ── Autenticación ──
    { path: '/login', name: 'login', component: () => import('@/views/auth/LoginView.vue') },
    {
      path: '/recuperar',
      name: 'recuperar',
      component: () => import('@/views/auth/RecuperarPasswordView.vue'),
    },
    {
      path: '/registro',
      name: 'registro',
      component: () => import('@/views/auth/RegisterView.vue'),
    },
    {
      path: '/verificacion',
      name: 'verificacion',
      component: () => import('@/views/auth/EmailVerificationView.vue'),
    },
    {
      path: '/admin',
      name: 'admin-login',
      component: () => import('@/views/auth/AdminLoginView.vue'),
    },

    // ── Panel de administración ──
    {
      path: '/admin',
      meta: { requiresAdmin: true },
      children: [
        {
          path: 'panel',
          name: 'admin-panel',
          component: () => import('@/views/admin/AdminPanelView.vue'),
        },
        {
          path: 'new-property',
          name: 'admin-new-property',
          component: () => import('@/views/admin/NewPropertyView.vue'),
        },
        {
          path: 'property/:id',
          name: 'admin-property-detail',
          component: () => import('@/views/admin/AdminPropertyDetailView.vue'),
          props: true,
        },
        {
          path: 'activity',
          name: 'admin-activity',
          component: () => import('@/views/admin/ActivityLogView.vue'),
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/views/admin/UserManagementView.vue'),
        },
        {
          path: 'requests',
          name: 'admin-requests',
          component: () => import('@/views/admin/RequestCenterView.vue'),
        },
        {
          path: 'agenda',
          name: 'admin-agenda',
          component: () => import('@/views/admin/AgendaVisitasView.vue'),
        },
        {
          path: 'analitica',
          name: 'admin-analitica',
          component: () => import('@/views/admin/AnaliticaView.vue'),
        },
        {
          path: 'expedientes',
          name: 'admin-expedientes',
          component: () => import('@/views/admin/BovedaExpedientesView.vue'),
        },
        {
          path: 'resenas',
          name: 'admin-resenas',
          component: () => import('@/views/admin/ResenasModeracionView.vue'),
        },
        {
          path: 'contratos',
          name: 'admin-contratos',
          component: () => import('@/views/admin/ContratosView.vue'),
        },
        {
          path: 'entregas',
          name: 'admin-entregas',
          component: () => import('@/views/admin/EntregasView.vue'),
        },
      ],
    },

    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'admin-login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'admin-login' && auth.isAdmin) return { path: '/admin/panel' }
})

export default router
