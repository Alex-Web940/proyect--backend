// Reglas de validación para los :rules de Quasar.
// Todas devuelven `true` cuando la regla pasa o el mensaje cuando falla,
// y tratan los vacíos como "sin valor" para no duplicar el required.

export const normalizarTexto = (valor) => String(valor ?? '').trim()

export function requerido(mensaje = 'Este campo es obligatorio') {
  return (valor) => !!normalizarTexto(valor) || mensaje
}

export function longitud(minimo, maximo = 0, mensaje = '') {
  return (valor) => {
    const texto = normalizarTexto(valor)
    if (!texto) return true
    if (texto.length < minimo) return mensaje || `Mínimo ${minimo} caracteres`
    if (maximo && texto.length > maximo) return mensaje || `Máximo ${maximo} caracteres`
    return true
  }
}

export const correoValido = (valor) =>
  !normalizarTexto(valor) ||
  /^\S+@\S+\.\S+$/.test(normalizarTexto(valor)) ||
  'El correo no es válido'

export function digitos(minimo = 4, maximo = 15, mensaje = '') {
  return (valor) => {
    const texto = normalizarTexto(valor)
    if (!texto) return true
    if (!/^\d+$/.test(texto)) return mensaje || 'Solo se permiten números'
    if (texto.length < minimo) return mensaje || `Debe tener al menos ${minimo} dígitos`
    if (maximo && texto.length > maximo) return mensaje || `Debe tener máximo ${maximo} dígitos`
    return true
  }
}

export function entero(maximo = 10000, mensaje = 'Este campo es obligatorio') {
  return (valor) => {
    if (valor === '' || valor == null) return mensaje
    const numero = Number(valor)
    if (!Number.isInteger(numero)) return 'Debe ser un número entero'
    if (numero <= 0) return 'Debe ser un número mayor a 0'
    if (numero > maximo) return `No puede ser mayor a ${maximo}`
    return true
  }
}

// `coinciden(() => form.password)` compara contra el valor actual de otro campo.
export function coinciden(obtenerReferencia, mensaje = 'Las contraseñas no coinciden') {
  return (valor) => valor === obtenerReferencia() || mensaje
}

// Evita duplicados en una lista ya cargada (mismo id no cuenta).
export function unico({
  obtenerLista,
  obtenerIdPropio,
  obtenerId,
  obtenerValor,
  normalizar = normalizarTexto,
  mensaje = 'Este valor ya está registrado'
}) {
  return (valor) => {
    const candidato = normalizar(normalizarTexto(valor))
    if (!candidato) return true
    const idPropio = obtenerIdPropio()
    const yaExiste = obtenerLista().some(
      (fila) => obtenerId(fila) !== idPropio && normalizar(normalizarTexto(obtenerValor(fila))) === candidato
    )
    return !yaExiste || mensaje
  }
}

export const minusculas = (valor) => String(valor ?? '').toLowerCase()
