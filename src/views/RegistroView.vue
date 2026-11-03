<template>
  <div>
    <EncabezadoPagina
      titulo="Registro de usuarios"
      icono="person_add"
      descripcion="Cree cuentas de acceso a la plataforma"
    />

    <div class="rejilla">
      <aside class="tarjeta carnet aparece" aria-label="Vista previa de la cuenta">
        <div class="avatar-envoltorio">
          <svg class="anillo" viewBox="0 0 100 100" aria-hidden="true">
            <circle class="anillo-fondo" cx="50" cy="50" r="46" />
            <circle
              class="anillo-progreso"
              cx="50"
              cy="50"
              r="46"
              :style="{ strokeDashoffset: desplazamientoAnillo }"
            />
          </svg>
          <Transition name="pop" mode="out-in">
            <div :key="iniciales" class="avatar">{{ iniciales }}</div>
          </Transition>
        </div>

        <h2>{{ nombreMostrado }}</h2>
        <p class="correo">{{ correoMostrado }}</p>
        <span class="rol">rol USER</span>
        <p class="avance">{{ requisitosCumplidos }}/4 requisitos</p>
      </aside>

      <q-card class="tarjeta formulario aparece">
        <q-card-section>
          <Transition name="fade">
            <div v-if="exito" class="banner exito q-mb-md" role="status">
              <q-icon name="check_circle" size="20px" />
              <span>Cuenta creada correctamente.</span>
            </div>
          </Transition>

          <q-form ref="formRef" greedy novalidate @submit.prevent="registrar">
            <div class="campos">
              <div class="campo" :class="{ sacudir: sacudir && !valido.nombre }" style="--i: 0">
                <q-input
                  ref="nombreRef"
                  v-model="form.nombre"
                  outlined
                  label="Nombre completo"
                  :rules="reglasFormulario.nombre"
                  lazy-rules="ondemand"
                  :disable="enviando"
                  :error="!!errores.nombre"
                  :error-message="errores.nombre"
                  autofocus
                  @focus="enfocado = 'nombre'"
                  @blur="enfocado = ''"
                  @update:model-value="() => limpiarError('nombre')"
                >
                  <template #prepend>
                    <q-icon name="person" :color="colorIcono('nombre')" />
                  </template>
                  <template #append>
                    <Transition name="pop">
                      <q-icon v-if="valido.nombre" name="check_circle" color="positive" size="20px" />
                    </Transition>
                  </template>
                  <template #hint>
                    <span class="pista" :class="{ ok: valido.nombre }">{{ pistaNombre }}</span>
                  </template>
                </q-input>
              </div>

              <div class="campo" :class="{ sacudir: sacudir && !valido.email }" style="--i: 1">
                <q-input
                  ref="emailRef"
                  v-model="form.email"
                  outlined
                  type="email"
                  label="Correo electrónico"
                  autocomplete="off"
                  :rules="reglasFormulario.email"
                  lazy-rules="ondemand"
                  :disable="enviando"
                  :error="!!errores.email"
                  :error-message="errores.email"
                  @focus="enfocado = 'email'"
                  @blur="enfocado = ''"
                  @update:model-value="() => limpiarError('email')"
                >
                  <template #prepend>
                    <q-icon name="mail" :color="colorIcono('email')" />
                  </template>
                  <template #append>
                    <Transition name="pop">
                      <q-icon v-if="valido.email" name="check_circle" color="positive" size="20px" />
                    </Transition>
                  </template>
                  <template #hint>
                    <span class="pista" :class="{ ok: valido.email }">{{ pistaEmail }}</span>
                  </template>
                </q-input>
              </div>

              <div class="campo" :class="{ sacudir: sacudir && !valido.password }" style="--i: 2">
                <q-input
                  ref="passwordRef"
                  v-model="form.password"
                  outlined
                  :type="verPassword ? 'text' : 'password'"
                  label="Contraseña (mínimo 6 caracteres)"
                  autocomplete="new-password"
                  :rules="reglasFormulario.password"
                  lazy-rules="ondemand"
                  :disable="enviando"
                  :error="!!errores.password"
                  :error-message="errores.password"
                  @focus="enfocado = 'password'"
                  @blur="enfocado = ''"
                  @update:model-value="() => limpiarError('password')"
                >
                  <template #prepend>
                    <q-icon name="lock" :color="colorIcono('password')" />
                  </template>
                  <template #append>
                    <Transition name="pop">
                      <q-icon v-if="valido.password" name="check_circle" color="positive" size="20px" />
                    </Transition>
                    <q-btn
                      flat
                      round
                      dense
                      :icon="verPassword ? 'visibility_off' : 'visibility'"
                      :aria-label="verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                      @click="verPassword = !verPassword"
                    />
                  </template>
                  <template #hint>
                    <div class="hint-password">
                      <div v-if="form.password" class="fuerza" :class="fuerza.clase">
                        <div
                          class="fuerza-barra"
                          role="progressbar"
                          :aria-valuenow="fuerza.puntos"
                          aria-valuemin="0"
                          aria-valuemax="4"
                          aria-label="Seguridad de la contraseña"
                        >
                          <span v-for="n in 4" :key="n" :class="{ lleno: n <= fuerza.puntos }" />
                        </div>
                        <small class="fuerza-texto">{{ fuerza.texto }}</small>
                      </div>
                      <span class="pista" :class="{ ok: valido.password }">{{ pistaPassword }}</span>
                    </div>
                  </template>
                </q-input>
              </div>

              <div class="campo" :class="{ sacudir: sacudir && !valido.confirmaPassword }" style="--i: 3">
                <q-input
                  ref="confirmaRef"
                  v-model="form.confirmaPassword"
                  outlined
                  :type="verPassword ? 'text' : 'password'"
                  label="Confirmar contraseña"
                  autocomplete="new-password"
                  :rules="reglasFormulario.confirmaPassword"
                  lazy-rules="ondemand"
                  :disable="enviando"
                  @focus="enfocado = 'confirmaPassword'"
                  @blur="enfocado = ''"
                  @update:model-value="() => limpiarError('confirmaPassword')"
                >
                  <template #prepend>
                    <q-icon name="lock" :color="colorIcono('confirmaPassword')" />
                  </template>
                  <template #append>
                    <Transition name="pop">
                      <q-icon v-if="valido.confirmaPassword" name="check_circle" color="positive" size="20px" />
                    </Transition>
                  </template>
                  <template #hint>
                    <span class="pista" :class="{ ok: valido.confirmaPassword }">{{ pistaConfirmacion }}</span>
                  </template>
                </q-input>
              </div>
            </div>

            <div class="acciones">
              <small class="nota">{{ requisitosCumplidos }}/4 requisitos · La cuenta se crea con rol USER.</small>
              <q-btn
                type="submit"
                color="primary"
                class="btn-glow boton-registrar"
                unelevated
                no-caps
                :icon="exito ? 'check' : 'person_add'"
                :label="exito ? 'Listo' : 'Registrar'"
                :loading="enviando"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>

    <div class="mini-notas">
      <section class="tarjeta mini aparece" style="--i: 0">
        <q-icon name="badge" size="20px" color="primary" />
        <div>
          <h3>Rol USER</h3>
          <p>Todas las cuentas nuevas se crean con este rol.</p>
        </div>
      </section>

      <section class="tarjeta mini aparece" style="--i: 1">
        <q-icon name="check_circle" size="20px" color="positive" />
        <div>
          <h3>Acceso completo</h3>
          <p>Cursos y aprendices, sin permisos de administración.</p>
        </div>
      </section>

      <section class="tarjeta mini aparece" style="--i: 2">
        <q-icon name="block" size="20px" color="warning" />
        <div>
          <h3>Sección restringida</h3>
          <p>El registro de cuentas queda limitado a administradores en la interfaz.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useSesionStore } from '../stores/sesion.store.js'
import { useGeneralStore } from '../stores/general.store.js'
import EncabezadoPagina from './EncabezadoPagina.vue'
import { requerido, longitud, correoValido, coinciden } from '../utils/reglas.js'
import { erroresDeCampo } from '../utils/erroresCampo.js'

const sesionStore = useSesionStore()
const generalStore = useGeneralStore()

const formRef = ref(null)
const nombreRef = ref(null)
const emailRef = ref(null)
const passwordRef = ref(null)
const confirmaRef = ref(null)
const refsPorCampo = {
  nombre: nombreRef,
  email: emailRef,
  password: passwordRef,
  confirmaPassword: confirmaRef
}

const form = ref({
  nombre: '',
  email: '',
  password: '',
  confirmaPassword: ''
})
const verPassword = ref(false)
const enviando = ref(false)
const errores = ref({})
const exito = ref(false)
const enfocado = ref('')
const sacudir = ref(false)
let temporizadorExito = null

function limpiarError(campo) {
  if (errores.value[campo]) delete errores.value[campo]
}

const reglasFormulario = {
  nombre: [requerido('El nombre es obligatorio'), longitud(3, 80)],
  email: [requerido('El correo es obligatorio'), correoValido],
  password: [requerido('La contraseña es obligatoria'), longitud(6, 64)],
  confirmaPassword: [requerido('Confirme la contraseña'), coinciden(() => form.value.password)]
}

const textoNombre = computed(() => String(form.value.nombre ?? '').trim())
const textoEmail = computed(() => String(form.value.email ?? '').trim())
const textoPassword = computed(() => String(form.value.password ?? ''))
const textoConfirmacion = computed(() => String(form.value.confirmaPassword ?? ''))

// Estado de validez en vivo de cada campo.
const valido = computed(() => ({
  nombre: textoNombre.value.length >= 3 && textoNombre.value.length <= 80,
  email: textoEmail.value.length > 0 && correoValido(textoEmail.value) === true,
  password: textoPassword.value.length >= 6,
  confirmaPassword:
    textoConfirmacion.value.length > 0 && textoConfirmacion.value === textoPassword.value
}))

const requisitosCumplidos = computed(() => Object.values(valido.value).filter(Boolean).length)

// Anillo de progreso: circunferencia = 2 * PI * 46.
const PERIMETRO_ANILLO = 2 * Math.PI * 46
const desplazamientoAnillo = computed(
  () => PERIMETRO_ANILLO * (1 - requisitosCumplidos.value / 4)
)

function colorIcono(campo) {
  if (valido.value[campo]) return 'positive'
  return enfocado.value === campo ? 'primary' : 'grey-6'
}

const pistaNombre = computed(() => {
  const valor = textoNombre.value
  if (!valor) return 'Entre 3 y 80 caracteres.'
  if (valor.length < 3) return 'Faltan caracteres (mínimo 3).'
  if (valor.length > 80) return 'Máximo 80 caracteres.'
  return 'Nombre válido.'
})

const pistaEmail = computed(() => {
  const valor = textoEmail.value
  if (!valor) return 'Será el usuario con el que inicie sesión.'
  return valido.value.email ? 'Correo válido.' : 'Escriba un correo con formato válido.'
})

const pistaPassword = computed(() => {
  if (!textoPassword.value) return 'Mínimo 6 caracteres.'
  return valido.value.password ? 'Longitud correcta.' : 'Faltan caracteres (mínimo 6).'
})

const pistaConfirmacion = computed(() => {
  if (!textoConfirmacion.value) return 'Repita la contraseña.'
  return valido.value.confirmaPassword ? 'Las contraseñas coinciden.' : 'Todavía no coincide.'
})

// Barra de seguridad de la contraseña (0 a 4 puntos).
const fuerza = computed(() => {
  const password = textoPassword.value
  if (!password) return { puntos: 0, texto: '', clase: '' }

  let puntos = 0
  if (password.length >= 6) puntos += 1
  if (/[A-Z]/.test(password)) puntos += 1
  if (/\d/.test(password)) puntos += 1
  if (/[^A-Za-z0-9]/.test(password)) puntos += 1

  const clase = puntos >= 4 ? 'fuerte' : puntos >= 2 ? 'media' : 'debil'
  const texto =
    puntos >= 4
      ? 'Contraseña segura.'
      : puntos >= 2
        ? 'Media: añada un símbolo o una mayúscula.'
        : 'Débil: use 6+ caracteres, mayúscula, número y símbolo.'

  return { puntos, texto, clase }
})

const iniciales = computed(() =>
  (form.value.nombre || '?')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0])
    .join('')
    .toUpperCase() || '?'
)

const nombreMostrado = computed(() => textoNombre.value || 'Nuevo usuario')
const correoMostrado = computed(() => textoEmail.value || 'correo pendiente')

function mostrarExito() {
  exito.value = true
  clearTimeout(temporizadorExito)
  temporizadorExito = setTimeout(() => {
    exito.value = false
  }, 2600)
}

function limpiarFormulario() {
  form.value = { nombre: '', email: '', password: '', confirmaPassword: '' }
  errores.value = {}
  formRef.value?.resetValidation()
}

async function registrar() {
  const formularioValido = await formRef.value.validate()

  if (!formularioValido) {
    sacudir.value = true
    setTimeout(() => {
      sacudir.value = false
    }, 500)
    const primerInvalido = ['nombre', 'email', 'password', 'confirmaPassword'].find(
      (campo) => !valido.value[campo]
    )
    if (primerInvalido) refsPorCampo[primerInvalido].value?.focus()
    return
  }

  errores.value = {}
  enviando.value = true
  try {
    const respuesta = await sesionStore.registrarUsuario({
      nombre: form.value.nombre.trim(),
      email: form.value.email.trim(),
      password: form.value.password
    })
    generalStore.exito(respuesta.msg || 'Usuario registrado correctamente')
    limpiarFormulario()
    mostrarExito()
  } catch (e) {
    errores.value = erroresDeCampo(e, {
      nombre: [/nombre/i],
      email: [/email/i],
      password: [/contraseña|password/i]
    })
    generalStore.error(e)
  } finally {
    enviando.value = false
  }
}

onBeforeUnmount(() => clearTimeout(temporizadorExito))
</script>

<style scoped>
.rejilla {
  display: grid;
  grid-template-columns: minmax(0, 0.7fr) minmax(0, 1.3fr);
  gap: 16px;
  align-items: start;
}

/* --- Carné en vivo --- */
.carnet {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 20px 18px;
  text-align: center;
  color: #fff;
  border-color: transparent;
  background:
    radial-gradient(circle at 82% 12%, rgba(255, 255, 255, 0.28), transparent 45%),
    linear-gradient(150deg, var(--primary) 0%, var(--primary) 52%, var(--secondary) 100%);
}
.carnet::after {
  content: '';
  position: absolute;
  right: -50px;
  bottom: -60px;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.09);
  pointer-events: none;
}
.avatar-envoltorio {
  position: relative;
  display: grid;
  place-items: center;
  width: 88px;
  height: 88px;
  margin-bottom: 6px;
}
.anillo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.anillo circle {
  fill: none;
  stroke-width: 4;
}
.anillo-fondo {
  stroke: rgba(255, 255, 255, 0.22);
}
.anillo-progreso {
  stroke: #fff;
  stroke-linecap: round;
  stroke-dasharray: 289.03;
  transition: stroke-dashoffset 0.45s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.avatar {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 66px;
  height: 66px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  font: 800 22px var(--font-title);
  letter-spacing: 0.02em;
}
.carnet h2 {
  margin: 0;
  font-size: 17px;
  line-height: 1.25;
  font-family: var(--font-title);
  word-break: break-word;
}
.correo {
  margin: 0;
  max-width: 100%;
  color: rgba(255, 255, 255, 0.82);
  font-size: 12px;
  word-break: break-all;
}
.rol {
  margin-top: 2px;
  padding: 2px 10px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.avance {
  margin: 6px 0 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 11.5px;
}

/* --- Formulario --- */
.formulario {
  width: 100%;
}
.campos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px 16px;
}
.campo {
  animation: entrada 0.35s both;
  animation-delay: calc(var(--i) * 60ms);
}
.campo.sacudir {
  animation: sacudir 0.45s ease;
}

/* Halo al enfocar un campo. */
.campo :deep(.q-field__control) {
  transition: box-shadow 0.25s ease;
}
.campo :deep(.q-field--outlined.q-field--focused .q-field__control) {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 20%, transparent);
}

.pista {
  color: var(--text-dim);
  font-size: 11.5px;
  transition: color 0.25s ease;
}
.pista.ok {
  color: var(--success);
  font-weight: 600;
}
.hint-password {
  width: 100%;
}

/* --- Barra de seguridad de la contraseña --- */
.fuerza {
  margin: 0 0 4px;
}
.fuerza-barra {
  display: flex;
  gap: 4px;
}
.fuerza-barra span {
  flex: 1;
  height: 5px;
  border-radius: 999px;
  background: var(--border);
  transition: background 0.3s ease;
}
.fuerza.debil .fuerza-barra span.lleno {
  background: var(--danger);
}
.fuerza.media .fuerza-barra span.lleno {
  background: var(--warning);
}
.fuerza.fuerte .fuerza-barra span.lleno {
  background: var(--success);
}
.fuerza-texto {
  display: block;
  margin-top: 4px;
  color: var(--text-dim);
  font-size: 11.5px;
}

.acciones {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
}
.nota {
  color: var(--text-dim);
  font-size: 12.5px;
}

.boton-registrar {
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease;
}
.boton-registrar:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px color-mix(in srgb, var(--primary) 35%, transparent);
}

.exito {
  color: var(--success);
  background: color-mix(in srgb, var(--success) 12%, transparent);
  border-color: color-mix(in srgb, var(--success) 40%, transparent);
}

/* --- Mini tarjetas informativas --- */
.mini-notas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 16px;
}
.mini {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  animation: entrada 0.4s both;
  animation-delay: calc(350ms + var(--i) * 70ms);
}
.mini:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--primary) 45%, transparent);
  box-shadow: var(--shadow);
}
.mini h3 {
  margin: 0 0 2px;
  font-size: 13.5px;
  font-weight: 700;
}
.mini p {
  margin: 0;
  color: var(--text-dim);
  font-size: 12.5px;
  line-height: 1.45;
}

@keyframes entrada {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes sacudir {
  10%,
  90% {
    transform: translateX(-2px);
  }
  20%,
  80% {
    transform: translateX(4px);
  }
  30%,
  50%,
  70% {
    transform: translateX(-6px);
  }
  40%,
  60% {
    transform: translateX(6px);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

@media (max-width: 900px) {
  .rejilla {
    grid-template-columns: 1fr;
  }
  .carnet {
    order: 2;
  }
  .formulario {
    order: 1;
  }
}

@media (max-width: 700px) {
  .campos {
    grid-template-columns: 1fr;
  }
}
</style>
