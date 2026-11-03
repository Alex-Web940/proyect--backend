// Ayuda a traducir los errores del backend a mensajes por campo.
// El backend responde: { msg: '...' } o { errors: [{ msg }] | 'texto' }.

export function extraerMensajes(error) {
  const data = error?.response?.data
  const lista = (Array.isArray(data?.errors) ? data.errors : [])
    .map((e) => (typeof e === 'string' ? e : e?.msg || e?.message || ''))
    .filter(Boolean)
  if (data?.msg) lista.push(String(data.msg))
  return lista
}

// `plantillas` asocia un campo del formulario con cadenas o RegExp que,
// de encontrarse en la respuesta, asignan ese mensaje a ese campo.
//   erroresDeCampo(err, { email: ['correo', /ya está registrado/i] })
export function erroresDeCampo(error, plantillas) {
  const mensajes = extraerMensajes(error)
  const salida = {}
  for (const [campo, patrones] of Object.entries(plantillas)) {
    const lista = Array.isArray(patrones) ? patrones : [patrones]
    const encontrado = mensajes.find((mensaje) =>
      lista.some((patron) =>
        patron instanceof RegExp
          ? patron.test(mensaje)
          : mensaje.toLowerCase().includes(String(patron).toLowerCase())
      )
    )
    if (encontrado) salida[campo] = encontrado
  }
  return salida
}
