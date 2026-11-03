import api from './clienteApi.js'

export const aprendicesService = {
  async listar(status) {
    const params = status == null ? {} : { status }
    const { data } = await api.get('/aprendices', { params })
    return data
  },
  async obtener(id) {
    return (await api.get(`/aprendices/${id}`)).data
  },
  async crear(datos) {
    return (await api.post('/aprendices/register', datos)).data
  },
  async actualizar(id, datos) {
    return (await api.put(`/aprendices/update/${id}`, datos)).data
  },
  async activar(id) {
    return (await api.put(`/aprendices/active/${id}`)).data
  },
  async desactivar(id) {
    return (await api.put(`/aprendices/inactive/${id}`)).data
  }
}
