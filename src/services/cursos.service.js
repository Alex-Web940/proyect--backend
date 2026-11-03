import api from './clienteApi.js'

// El backend devuelve el id como `_id`; para la UI usamos `id` siempre.
export function normalizarId(valor) {
  if (!valor) return ''
  if (typeof valor === 'object') return String(valor._id || '')
  return String(valor)
}

export const cursosService = {
  async listar(status) {
    const params = status == null ? {} : { status }
    const { data } = await api.get('/cursos', { params })
    return data
  },
  async obtener(id) {
    return (await api.get(`/cursos/${id}`)).data
  },
  async crear(datos) {
    return (await api.post('/cursos/register', datos)).data
  },
  async actualizar(id, datos) {
    return (await api.put(`/cursos/update/${id}`, datos)).data
  },
  async activar(id) {
    return (await api.put(`/cursos/active/${id}`)).data
  },
  async desactivar(id) {
    return (await api.put(`/cursos/inactive/${id}`)).data
  }
}
