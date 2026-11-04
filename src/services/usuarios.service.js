import api from './clienteApi.js'

// El backend devuelve el id como `_id`; para la UI usamos `id` siempre.
export function normalizarId(valor) {
  if (!valor) return ''
  if (typeof valor === 'object') return String(valor._id || '')
  return String(valor)
}

export const usuariosService = {
  async listar(status) {
    const params = status == null ? {} : { status }
    const { data } = await api.get('/usuarios', { params })
    return data
  },
  async obtener(id) {
    return (await api.get(`/usuarios/${id}`)).data
  },
  // La contraseña es opcional: si no se envía, el backend conserva la actual.
  async actualizar(id, datos) {
    return (await api.put(`/usuarios/update/${id}`, datos)).data
  },
  async activar(id) {
    return (await api.put(`/usuarios/active/${id}`)).data
  },
  async desactivar(id) {
    return (await api.put(`/usuarios/inactive/${id}`)).data
  }
}
