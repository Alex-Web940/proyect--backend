import api from './clienteApi.js'

export const sesionService = {
  async login(email, password) {
    const { data } = await api.post('/usuarios/login', { email, password })
    return data
  },
  async registrar(datos) {
    const { data } = await api.post('/usuarios/register', datos)
    return data
  }
}
