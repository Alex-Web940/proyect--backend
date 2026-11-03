import { createApp } from 'vue'
import { Quasar, Notify, Dark } from 'quasar'
import qIconSet from 'quasar/icon-set/material-icons'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

import App from './App.vue'
import { crearRouter } from './routes/rutasAplicacion.js'
import { useSesionStore } from './stores/sesion.store.js'
import { configurarSesion } from './services/clienteApi.js'
import { aplicarTema } from './composables/use-tema.js'

import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import './style.css'

const app = createApp(App)

const pinia = createPinia()
pinia.use(createPersistedState())
app.use(pinia)

const router = crearRouter(pinia)
app.use(router)

app.use(Quasar, {
  plugins: { Notify },
  iconSet: qIconSet,
  config: { notify: { position: 'top-right', timeout: 3500, progress: true } }
})

// Tema oscuro/claro antes del primer render (index.html ya aplicó el guardado).
aplicarTema()

// El interceptor de clienteApi necesita el token y cómo cerrar la sesión
// sin crear ciclos de imports con los stores/rutas.
const sesionStore = useSesionStore(pinia)
configurarSesion({
  obtenerToken: () => sesionStore.token,
  alExpirarSesion: () => {
    sesionStore.cerrarSesion()
    router.replace({ name: 'login' })
    Notify.create({
      type: 'negative',
      message: 'Sesión expirada. Inicie sesión nuevamente.',
      icon: 'lock_clock',
      timeout: 4500
    })
  }
})

app.mount('#app')
