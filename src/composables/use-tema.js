import { ref } from 'vue'
import { Dark } from 'quasar'

// Tema de la aplicación: 'dark' | 'light' | 'auto'.
// El valor guardado lo lee index.html para pintar sin parpadeo; aquí solo
// se mantiene en vivo y se persiste.
const CLAVE_TEMA = 'repfora-tema'
const guardado = localStorage.getItem(CLAVE_TEMA)

export const modoTema = ref(['dark', 'light', 'auto'].includes(guardado) ? guardado : 'dark')

const mediaOscuridad = window.matchMedia('(prefers-color-scheme: dark)')

function temaResuelto() {
  return modoTema.value === 'auto'
    ? (mediaOscuridad.matches ? 'dark' : 'light')
    : modoTema.value
}

export function aplicarTema() {
  const tema = temaResuelto()
  const raiz = document.documentElement
  raiz.setAttribute('data-theme', tema)
  raiz.style.colorScheme = tema
  raiz.style.background = '' // ya no hace falta el fondo del anti-flash
  Dark.set(tema === 'dark') // mantiene sincronizado a Quasar (body--dark, q-dark)
}

let escuchando = false

export function useTema() {
  if (!escuchando) {
    escuchando = true
    // Con 'auto' el sistema operativo manda: se re-aplica al cambiar el modo.
    mediaOscuridad.addEventListener('change', () => {
      if (modoTema.value === 'auto') aplicarTema()
    })
  }

  function setModo(modo) {
    modoTema.value = modo
    localStorage.setItem(CLAVE_TEMA, modo)
    aplicarTema()
  }

  return { modo: modoTema, setModo, aplicarTema }
}
