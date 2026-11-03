<template>
  <div class="login">
    <a href="#" class="saltar" @click.prevent="enfocarFormulario">Saltar al formulario</a>

    <aside class="marca">
      <div class="logo">
        <span class="logo-icono">R</span>
        <span class="logo-texto">Repfora</span>
      </div>
      <h1>Formación que se gestiona sola.</h1>
      <p class="lema">Cursos y aprendices del SENA, en una sola consola.</p>
      <ul>
        <li v-for="item in destacados" :key="item.texto">
          <q-icon :name="item.icono" size="22px" />
          <span>{{ item.texto }}</span>
        </li>
      </ul>
    </aside>

    <main class="panel" id="contenido-principal">
      <div class="tema">
        <ThemeToggle />
      </div>

      <q-form ref="formRef" class="formulario aparece" novalidate @submit.prevent="enviar" greedy>
        <div class="logo movil">
          <span class="logo-icono">R</span>
          <span class="logo-texto">Repfora</span>
        </div>

        <h2>Iniciar sesión</h2>
        <p class="sub">Ingrese con su cuenta institucional.</p>

        <div v-if="mensajeError" class="banner error" role="alert">
          <q-icon name="error" size="20px" />
          <span>{{ mensajeError }}</span>
        </div>

        <q-input
          v-model="email"
          outlined
          type="email"
          label="Correo electrónico"
          autocomplete="username"
          :disable="cargando"
          :rules="[requerido('Ingrese su correo'), correoValido]"
          lazy-rules="ondemand"
        >
          <template #prepend><q-icon name="mail" /></template>
        </q-input>

        <q-input
          v-model="password"
          outlined
          :type="verPassword ? 'text' : 'password'"
          label="Contraseña"
          autocomplete="current-password"
          :disable="cargando"
          :rules="[(v) => !!v || 'Ingrese su contraseña']"
          lazy-rules="ondemand"
        >
          <template #prepend><q-icon name="lock" /></template>
          <template #append>
            <q-btn
              flat
              round
              dense
              :icon="verPassword ? 'visibility_off' : 'visibility'"
              :aria-label="verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="verPassword = !verPassword"
            />
          </template>
        </q-input>

        <q-btn
          type="submit"
          color="primary"
          class="btn-glow full-width"
          size="lg"
          no-caps
          label="Entrar"
          :loading="cargando"
          unelevated
        />
      </q-form>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSesionStore } from '../stores/sesion.store.js'
import { useGeneralStore } from '../stores/general.store.js'
import { mapearError } from '../services/clienteApi.js'
import { requerido, correoValido } from '../utils/reglas.js'
import ThemeToggle from './ThemeToggle.vue'

const sesionStore = useSesionStore()
const generalStore = useGeneralStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const verPassword = ref(false)
const cargando = ref(false)
const mensajeError = ref('')
const formRef = ref(null)

const destacados = [
  { icono: 'school', texto: 'Cursos y programas de formación al día' },
  { icono: 'groups', texto: 'Aprendices y cursos en un solo lugar' },
  { icono: 'download', texto: 'Exporte listados a CSV en un clic' }
]

// Enlace de salto (accesibilidad): lleva el foco al primer campo.
function enfocarFormulario() {
  document.querySelector('#contenido-principal input')?.focus()
}

async function enviar() {
  mensajeError.value = ''
  if (await formRef.value.validate()) {
    cargando.value = true
    try {
      await sesionStore.iniciarSesion(email.value.trim(), password.value)
      generalStore.exito(`Bienvenido, ${sesionStore.usuario.nombre}`)
      router.replace({ name: 'dashboard' })
    } catch (e) {
      mensajeError.value = mapearError(e)
      generalStore.error(e)
    } finally {
      cargando.value = false
    }
  }
}
</script>

<style scoped>
.login {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  min-height: 100dvh;
}

.marca {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
  padding: 56px 64px;
  overflow: hidden;
  background:
    radial-gradient(600px 420px at 20% 10%, color-mix(in srgb, var(--primary) 20%, transparent), transparent 70%),
    radial-gradient(520px 380px at 90% 90%, color-mix(in srgb, var(--secondary) 20%, transparent), transparent 70%),
    var(--bg-card);
  border-right: 1px solid var(--border);
}
.marca h1 {
  max-width: 14ch;
  margin: 18px 0 0;
  font-size: clamp(32px, 3.4vw, 48px);
  font-weight: 800;
  line-height: 1.08;
}
.lema {
  max-width: 42ch;
  margin: 0;
  font-size: 17px;
}
.marca ul {
  display: grid;
  gap: 14px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
}
.marca li {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-title);
}
.marca li .q-icon {
  color: var(--primary);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo-icono {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  font: 800 22px var(--font-title);
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: var(--on-primary);
  box-shadow: var(--glow);
  border-radius: 12px;
}
.logo-texto {
  font: 800 24px var(--font-title);
  color: var(--text-title);
}
.logo.movil {
  display: none;
  margin-bottom: 8px;
}

.panel {
  position: relative;
  display: grid;
  place-items: center;
  min-width: 0;
  padding: 32px 24px;
}
.tema {
  position: absolute;
  top: calc(14px + env(safe-area-inset-top));
  right: 16px;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 420px;
  max-width: 100%;
}
.formulario h2 {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
}
.sub {
  color: var(--text-dim);
  margin: 0 0 12px;
}
.banner {
  margin-bottom: 10px;
}

@media (max-width: 899px) {
  .login {
    grid-template-columns: minmax(0, 1fr);
  }
  .marca {
    display: none;
  }
  .logo.movil {
    display: flex;
  }
}
</style>
