import './styles/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { mostrarError } from './composables/useErrorGlobal'

const app = createApp(App)

// Errores que ninguna vista atrapó (incluye acciones async de botones): se muestran al usuario.
app.config.errorHandler = (e) => {
  console.error(e)
  mostrarError(e)
}
window.addEventListener('unhandledrejection', (ev) => mostrarError(ev.reason))

app.use(createPinia())
app.use(router)

// Si hay una sesión guardada, valida el token y trae permisos actualizados.
void useAuthStore().refrescarPerfil()

app.mount('#app')
