import { defineStore } from 'pinia'
import { sesionService } from '../services/sesion.service.js'

export const useSesionStore = defineStore('sesion', {
  state: () => ({ token: '', usuario: null }),
  getters: {
    estaAutenticado: (state) => !!state.token && !!state.usuario,
    esAdmin: (state) => state.usuario?.rol === 'ADMIN'
  },
  actions: {
    async iniciarSesion(email, password) {
      const data = await sesionService.login(email, password)
      this.token = data.token
      this.usuario = data.usuario
      return data
    },
    async registrarUsuario(datos) {
      return await sesionService.registrar(datos)
    },
    cerrarSesion() {
      this.token = ''
      this.usuario = null
    }
  },
  // La sesión vive en sessionStorage: sobrevive a F5 pero no a cerrar la pestaña.
  persist: { key: 'sesion', storage: sessionStorage }
})
