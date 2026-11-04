<template>
  <div>
    <EncabezadoPagina
      titulo="Usuarios"
      icono="manage_accounts"
      descripcion="Cuentas de acceso a la plataforma"
      texto-boton="Nuevo usuario"
      @accion="irARegistro"
    />

    <div v-if="errorCarga" class="banner error q-mb-md" role="alert">
      <q-icon name="error" size="20px" />
      <span>{{ errorCarga }}</span>
    </div>

    <q-select
      v-model="filtroEstado"
      :options="opcionesEstado"
      emit-value
      map-options
      options-dense
      dense
      outlined
      label="Estado"
      class="filtro-estado q-mb-md"
      style="max-width: 200px"
      aria-label="Filtrar usuarios por estado"
      :disable="cargando"
    />

    <TablaDatos
      :filas="usuariosFiltrados"
      :columnas="columnas"
      :cargando="cargando"
      nombre-archivo="usuarios"
      texto-vacio="Aún no hay usuarios registrados"
      @recargar="cargarUsuarios"
    >
      <template #acciones="{ fila }">
        <q-btn
          flat
          round
          dense
          icon="visibility"
          color="grey-7"
          :aria-label="`Ver detalle de ${fila.nombre}`"
          @click="abrirDetalle(fila)"
        >
          <q-tooltip>Detalle</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          dense
          icon="edit"
          color="primary"
          :aria-label="`Editar usuario ${fila.nombre}`"
          @click="abrirDialogoEditar(fila)"
        >
          <q-tooltip>Editar</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          dense
          :icon="fila.status === 0 ? 'toggle_on' : 'toggle_off'"
          :color="fila.status === 0 ? 'positive' : undefined"
          :aria-label="`${fila.status === 0 ? 'Desactivar' : 'Activar'} usuario ${fila.nombre}`"
          @click="abrirConfirmacion(fila)"
        >
          <q-tooltip>{{ fila.status === 0 ? 'Desactivar' : 'Activar' }}</q-tooltip>
        </q-btn>
      </template>
    </TablaDatos>

    <!-- Edición -->
    <q-dialog v-model="dialogoAbierto" persistent>
      <q-card class="dialogo">
        <q-form ref="formRef" greedy novalidate @submit.prevent="guardar">
          <q-card-section class="dialogo-titulo">
            <q-icon name="manage_accounts" color="primary" />
            Editar usuario
          </q-card-section>

          <q-card-section class="column q-gutter-y-sm">
            <q-input
              v-model="form.nombre"
              outlined
              label="Nombre completo"
              :rules="reglas.nombre"
              lazy-rules="ondemand"
              :disable="guardando"
              :error="!!errores.nombre"
              :error-message="errores.nombre"
              autofocus
              @update:model-value="limpiarError('nombre')"
            />
            <q-input
              v-model="form.email"
              outlined
              type="email"
              label="Correo electrónico"
              :rules="reglas.email"
              lazy-rules="ondemand"
              :disable="guardando"
              :error="!!errores.email"
              :error-message="errores.email"
              @update:model-value="limpiarError('email')"
            />
            <q-select
              v-model="form.rol"
              outlined
              emit-value
              map-options
              :options="opcionesRol"
              label="Rol"
              :rules="reglas.rol"
              lazy-rules="ondemand"
              :disable="guardando"
              :error="!!errores.rol"
              :error-message="errores.rol"
              no-error-icon
              @update:model-value="limpiarError('rol')"
            />
            <q-input
              v-model="form.password"
              outlined
              :type="verPassword ? 'text' : 'password'"
              label="Nueva contraseña (opcional)"
              autocomplete="new-password"
              :rules="reglas.password"
              lazy-rules="ondemand"
              :disable="guardando"
              :error="!!errores.password"
              :error-message="errores.password"
              @update:model-value="limpiarError('password')"
            >
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
              <template #hint>
                <span class="pista">Déjela vacía para conservar la contraseña actual.</span>
              </template>
            </q-input>
            <p v-if="editandoPropiaCuenta" class="aviso-propia">
              <q-icon name="info" size="16px" />
              Está editando su propia cuenta.
            </p>
          </q-card-section>

          <q-card-actions align="right" class="dialogo-acciones">
            <q-btn flat no-caps label="Cancelar" :disable="guardando" @click="dialogoAbierto = false" />
            <q-btn
              type="submit"
              color="primary"
              class="btn-glow"
              unelevated
              no-caps
              label="Actualizar"
              :loading="guardando"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Detalle -->
    <q-dialog v-model="detalleAbierto">
      <q-card class="dialogo">
        <q-card-section class="dialogo-titulo">
          <q-icon name="manage_accounts" color="primary" />Detalle del usuario
        </q-card-section>

        <q-card-section v-if="detalleCargando" class="column q-gutter-sm">
          <q-skeleton v-for="n in 5" :key="n" type="text" width="70%" class="q-mb-sm" />
        </q-card-section>

        <q-card-section v-else-if="detalle" class="column q-gutter-y-sm">
          <div class="detalle-fila">
            <span class="etiqueta">Nombre</span>
            <span>{{ detalle.nombre }}</span>
          </div>
          <div class="detalle-fila">
            <span class="etiqueta">Correo</span>
            <span>{{ detalle.email }}</span>
          </div>
          <div class="detalle-fila">
            <span class="etiqueta">Rol</span>
            <span>{{ detalle.rol }}</span>
          </div>
          <div class="detalle-fila">
            <span class="etiqueta">Estado</span>
            <span>{{ detalle.status === 0 ? 'Activo' : 'Inactivo' }}</span>
          </div>
          <div class="detalle-fila">
            <span class="etiqueta">Creado</span>
            <span>{{ formatearFecha(detalle.createdAt) }}</span>
          </div>
          <div class="detalle-fila">
            <span class="etiqueta">Actualizado</span>
            <span>{{ formatearFecha(detalle.updatedAt) }}</span>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialogo-acciones">
          <q-btn flat no-caps label="Cerrar" @click="detalleAbierto = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Confirmación de estado -->
    <q-dialog v-model="confirmacion.abierto">
      <q-card class="dialogo" role="alertdialog">
        <q-card-section class="dialogo-titulo">
          <q-icon
            :name="esActivo ? 'toggle_off' : 'toggle_on'"
            :color="esActivo ? 'warning' : 'positive'"
          />
          {{ esActivo ? 'Desactivar' : 'Activar' }} usuario
        </q-card-section>

        <q-card-section>
          ¿Desea {{ esActivo ? 'desactivar' : 'activar' }} a
          <strong>{{ confirmacion.fila?.nombre }}</strong>?
          <span v-if="esActivo"> Dejará de poder iniciar sesión.</span>
        </q-card-section>

        <q-card-actions align="right" class="dialogo-acciones">
          <q-btn
            flat
            no-caps
            label="Cancelar"
            :disable="confirmacion.cargando"
            @click="confirmacion.abierto = false"
          />
          <q-btn
            :color="esActivo ? 'negative' : 'positive'"
            unelevated
            no-caps
            :label="esActivo ? 'Desactivar' : 'Activar'"
            :loading="confirmacion.cargando"
            @click="confirmarAccion"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSesionStore } from '../stores/sesion.store.js'
import { useGeneralStore } from '../stores/general.store.js'
import { mapearError } from '../services/clienteApi.js'
import { usuariosService } from '../services/usuarios.service.js'
import { requerido, longitud, correoValido, unico } from '../utils/reglas.js'
import { erroresDeCampo } from '../utils/erroresCampo.js'
import EncabezadoPagina from './EncabezadoPagina.vue'
import TablaDatos from './TablaDatos.vue'

const router = useRouter()
const sesionStore = useSesionStore()
const generalStore = useGeneralStore()

const usuarios = ref([])
const cargando = ref(false)
const errorCarga = ref('')
const filtroEstado = ref('todos')

const opcionesEstado = [
  { value: 'todos', label: 'Todos' },
  { value: '0', label: 'Activos' },
  { value: '1', label: 'Inactivos' }
]

const opcionesRol = [
  { value: 'ADMIN', label: 'ADMIN — administración total' },
  { value: 'USER', label: 'USER — cursos y aprendices' }
]

const dialogoAbierto = ref(false)
const guardando = ref(false)
const usuarioId = ref(null)
const formRef = ref(null)
const verPassword = ref(false)

const form = ref({ nombre: '', email: '', rol: 'USER', password: '' })
const errores = ref({})

const detalleAbierto = ref(false)
const detalleCargando = ref(false)
const detalle = ref(null)

const confirmacion = ref({ abierto: false, fila: null, cargando: false })

function formularioVacio() {
  return { nombre: '', email: '', rol: 'USER', password: '' }
}

const columnas = [
  { name: 'nombre', label: 'Nombre', field: 'nombre' },
  { name: 'email', label: 'Correo', field: 'email' },
  {
    name: 'rol',
    label: 'Rol',
    field: 'rol',
    format: (valor) => valor || 'USER',
    // El rol se muestra en la tabla, pero no se ofrece como criterio de búsqueda.
    noBuscar: true
  },
  { name: 'estado', label: 'Estado', field: (fila) => fila.status },
  {
    name: 'creado',
    label: 'Creado',
    field: 'createdAt',
    format: (valor) => formatearFecha(valor)
  }
]

// El backend filtra por estado; de todos modos se filtra en cliente para que
// el cambio de filtro sea inmediato y funcione igual que en las otras vistas.
const usuariosFiltrados = computed(() => {
  if (filtroEstado.value === 'todos') return usuarios.value
  return usuarios.value.filter((fila) => String(fila.status) === filtroEstado.value)
})

const reglas = {
  nombre: [requerido('El nombre es obligatorio'), longitud(3, 80)],
  email: [
    requerido('El correo es obligatorio'),
    correoValido,
    unico({
      obtenerLista: () => usuarios.value,
      obtenerIdPropio: () => usuarioId.value,
      obtenerId: (fila) => fila._id,
      obtenerValor: (fila) => fila.email,
      normalizar: (valor) => String(valor ?? '').trim().toLowerCase(),
      mensaje: 'Este correo ya está registrado'
    })
  ],
  rol: [(valor) => !!valor || 'Seleccione un rol'],
  password: [(valor) => {
    const texto = String(valor ?? '')
    if (!texto) return true
    if (texto.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
    if (texto.length > 64) return 'Máximo 64 caracteres'
    return true
  }]
}

// true cuando el usuario de la sesión es el que se está editando.
const editandoPropiaCuenta = computed(
  () => !!usuarioId.value && usuarioId.value === sesionStore.usuario?._id
)

function limpiarError(campo) {
  if (errores.value[campo]) delete errores.value[campo]
}

function formatearFecha(valor) {
  if (!valor) return '—'
  try {
    return new Date(valor).toLocaleString('es-CO')
  } catch {
    return String(valor)
  }
}

function irARegistro() {
  router.push({ name: 'registro' })
}

async function cargarUsuarios() {
  cargando.value = true
  errorCarga.value = ''
  try {
    // Se trae la lista completa y el filtro de estado se aplica en cliente.
    usuarios.value = await usuariosService.listar()
  } catch (error) {
    errorCarga.value = error.sesionExpirada ? '' : mapearError(error)
    generalStore.error(error)
  } finally {
    cargando.value = false
  }
}

function limpiarValidacion() {
  nextTick(() => formRef.value?.resetValidation())
}

async function abrirDetalle(fila) {
  detalleAbierto.value = true
  detalleCargando.value = true
  detalle.value = null
  try {
    detalle.value = await usuariosService.obtener(fila._id)
  } catch (error) {
    generalStore.error(error)
    detalleAbierto.value = false
  } finally {
    detalleCargando.value = false
  }
}

function abrirDialogoEditar(fila) {
  usuarioId.value = fila._id
  form.value = {
    nombre: fila.nombre,
    email: fila.email,
    rol: fila.rol || 'USER',
    password: ''
  }
  verPassword.value = false
  errores.value = {}
  dialogoAbierto.value = true
  limpiarValidacion()
}

async function guardar() {
  if (!(await formRef.value.validate())) return
  errores.value = {}
  guardando.value = true

  const datos = {
    nombre: form.value.nombre.trim(),
    email: form.value.email.trim(),
    rol: form.value.rol
  }
  // Solo se envía la contraseña si se escribió algo: vacío = conservar la actual.
  if (form.value.password) datos.password = form.value.password

  try {
    const respuesta = await usuariosService.actualizar(usuarioId.value, datos)
    generalStore.exito(respuesta.msg || 'Usuario actualizado correctamente')
    dialogoAbierto.value = false
    await cargarUsuarios()
  } catch (error) {
    errores.value = erroresDeCampo(error, {
      nombre: [/nombre/i],
      email: [/email|correo/i],
      rol: [/rol/i],
      password: [/contraseña|password/i]
    })
    generalStore.error(error)
  } finally {
    guardando.value = false
  }
}

function abrirConfirmacion(fila) {
  // Evita que un administrador se deje fuera de la plataforma a sí mismo.
  if (fila.status === 0 && fila._id === sesionStore.usuario?._id) {
    generalStore.aviso('No puede desactivar su propia cuenta.')
    return
  }
  confirmacion.value = { abierto: true, fila, cargando: false }
}

async function confirmarAccion() {
  const fila = confirmacion.value.fila
  confirmacion.value.cargando = true
  try {
    const respuesta =
      fila.status === 0
        ? await usuariosService.desactivar(fila._id)
        : await usuariosService.activar(fila._id)
    generalStore.exito(respuesta.msg)
    confirmacion.value.abierto = false
    await cargarUsuarios()
  } catch (error) {
    generalStore.error(error)
  } finally {
    confirmacion.value.cargando = false
  }
}

const esActivo = computed(() => confirmacion.value.fila?.status === 0)

onMounted(cargarUsuarios)
</script>

<style scoped>
.detalle-fila {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
}
.detalle-fila:last-child {
  border-bottom: 0;
}
.etiqueta {
  color: var(--text-dim);
  font-weight: 600;
}
.pista {
  color: var(--text-dim);
  font-size: 11.5px;
}
.aviso-propia {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 4px 0 0;
  color: var(--text-dim);
  font-size: 12.5px;
}
</style>
