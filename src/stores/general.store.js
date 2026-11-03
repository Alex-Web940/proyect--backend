import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { mapearError } from '../services/clienteApi.js'

export const useGeneralStore = defineStore('general', {
  state: () => ({ menuColapsado: false, busquedaAbierta: false }),
  actions: {
    exito(mensaje) {
      Notify.create({ type: 'positive', message: mensaje, icon: 'check_circle', timeout: 3000 })
    },
    aviso(mensaje) {
      Notify.create({ type: 'warning', message: mensaje, icon: 'warning', timeout: 3500 })
    },
    error(error) {
      // Un 401 ya avisa el interceptor con "Sesión expirada": no se duplica.
      if (!error?.sesionExpirada) {
        Notify.create({ type: 'negative', message: mapearError(error), icon: 'error', timeout: 4500 })
      }
    }
  },
  // Solo el estado de la UI se persiste; la búsqueda nunca.
  persist: { key: 'repfora-general', storage: localStorage, paths: ['menuColapsado'] }
})
