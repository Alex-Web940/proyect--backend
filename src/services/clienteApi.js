import axios from 'axios'

// Cliente HTTP único de la aplicación. La API corre bajo /api en el backend.
const clienteApi = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// El token y el cierre de sesión los inyecta main.js (evita ciclos de imports).
let obtenerToken = () => null
let alExpirarSesion = () => {}

export function configurarSesion({ obtenerToken: obtener, alExpirarSesion: alExpirar } = {}) {
  if (obtener) obtenerToken = obtener
  if (alExpirar) alExpirarSesion = alExpirar
}

clienteApi.interceptors.request.use((config) => {
  const token = obtenerToken()
  if (token) config.headers['x-token'] = token
  return config
})

// Si el backend responde 401 (token vencido) avisamos UNA vez por ráfaga:
// se marca el error como sesionExpirada para que la UI no lo muestre y se
// dispara el cierre de sesión centralizado.
let avisandoExpiracion = false
clienteApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || ''
    if (error.response?.status === 401 && !url.includes('/usuarios/login')) {
      error.sesionExpirada = true
      if (!avisandoExpiracion) {
        avisandoExpiracion = true
        alExpirarSesion()
        setTimeout(() => { avisandoExpiracion = false }, 2000)
      }
    }
    return Promise.reject(error)
  }
)

// Traduce un error de axios a un mensaje legible para la persona usuaria.
export function mapearError(error) {
  const data = error?.response?.data
  if (Array.isArray(data?.errors) && data.errors.length) {
    return data.errors
      .map((e) => (typeof e === 'string' ? e : e.msg || e.message || ''))
      .filter(Boolean)
      .join('; ')
  }
  if (data?.msg) return data.msg
  return error?.response
    ? 'No fue posible completar la operación'
    : 'Error de conexión con el servidor'
}

export default clienteApi
