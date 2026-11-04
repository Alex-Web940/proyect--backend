<template>
  <div>
    <EncabezadoPagina
      titulo="Aprendices"
      icono="groups"
      descripcion="Estudiantes matriculados en los cursos"
      texto-boton="Nuevo aprendiz"
      @accion="abrirDialogoCrear"
    />

    <div v-if="errorCarga" class="banner error q-mb-md" role="alert">
      <q-icon name="error" size="20px" />
      <span>{{ errorCarga }}</span>
    </div>

    <div class="row q-gutter-sm q-mb-md items-end">
      <q-select
        v-model="filtroCurso"
        :options="opcionesCurso"
        emit-value
        map-options
        options-dense
        dense
        outlined
        label="Filtrar por curso"
        style="min-width: 260px"
        aria-label="Filtrar aprendices por curso"
        :disable="cargando"
      />
      <q-select
        v-model="filtroEstado"
        :options="opcionesEstado"
        emit-value
        map-options
        options-dense
        dense
        outlined
        label="Estado"
        style="min-width: 160px"
        aria-label="Filtrar aprendices por estado"
        :disable="cargando"
      />
    </div>

    <TablaDatos
      :filas="aprendicesFiltrados"
      :columnas="columnas"
      :cargando="cargando"
      nombre-archivo="aprendices"
      texto-vacio="Aún no hay aprendices registrados"
      @recargar="cargarAprendices"
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
          :aria-label="`Editar aprendiz ${fila.nombre}`"
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
          :aria-label="`${fila.status === 0 ? 'Desactivar' : 'Activar'} aprendiz ${fila.nombre}`"
          @click="abrirConfirmacion(fila)"
        >
          <q-tooltip>{{ fila.status === 0 ? 'Desactivar' : 'Activar' }}</q-tooltip>
        </q-btn>
      </template>
    </TablaDatos>

    <!-- Alta / edición -->
    <q-dialog v-model="dialogoAbierto" persistent>
      <q-card class="dialogo">
        <q-form ref="formRef" greedy novalidate @submit.prevent="guardar">
          <q-card-section class="dialogo-titulo">
            <q-icon name="groups" color="primary" />
            {{ aprendizId ? 'Editar aprendiz' : 'Nuevo aprendiz' }}
          </q-card-section>

          <q-card-section class="column q-gutter-y-sm">
            <q-input
              v-model="form.documento"
              outlined
              label="Documento"
              :rules="reglas.documento"
              lazy-rules="ondemand"
              :disable="guardando"
              :error="!!errores.documento"
              :error-message="errores.documento"
              autofocus
              @update:model-value="limpiarError('documento')"
            />
            <q-input
              v-model="form.nombre"
              outlined
              label="Nombre completo"
              :rules="reglas.nombre"
              lazy-rules="ondemand"
              :disable="guardando"
              :error="!!errores.nombre"
              :error-message="errores.nombre"
              @update:model-value="limpiarError('nombre')"
            />
            <q-input
              v-model="form.email"
              outlined
              type="email"
              label="Email"
              :rules="reglas.email"
              lazy-rules="ondemand"
              :disable="guardando"
              :error="!!errores.email"
              :error-message="errores.email"
              @update:model-value="limpiarError('email')"
            />
            <q-select
              v-model="form.curso"
              outlined
              emit-value
              map-options
              :options="opcionesCursosFormulario"
              label="Curso"
              :rules="reglas.curso"
              lazy-rules="ondemand"
              :disable="guardando"
              no-error-icon
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No hay cursos activos
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-card-section>

          <q-card-actions align="right" class="dialogo-acciones">
            <q-btn
              flat
              no-caps
              label="Cancelar"
              :disable="guardando"
              @click="dialogoAbierto = false"
            />
            <q-btn
              type="submit"
              color="primary"
              class="btn-glow"
              unelevated
              no-caps
              :label="aprendizId ? 'Actualizar' : 'Crear'"
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
          <q-icon name="groups" color="primary" />
          Detalle del aprendiz
        </q-card-section>

        <q-card-section v-if="detalleCargando" class="column q-gutter-sm">
          <q-skeleton
            v-for="n in 5"
            :key="n"
            type="text"
            width="70%"
            class="q-mb-sm"
          />
        </q-card-section>

        <q-card-section v-else-if="detalle" class="column q-gutter-y-sm">
          <div class="detalle-fila">
            <span class="etiqueta">Documento</span>
            <span>{{ detalle.documento }}</span>
          </div>
          <div class="detalle-fila">
            <span class="etiqueta">Nombre</span>
            <span>{{ detalle.nombre }}</span>
          </div>
          <div class="detalle-fila">
            <span class="etiqueta">Email</span>
            <span>{{ detalle.email }}</span>
          </div>
          <div class="detalle-fila">
            <span class="etiqueta">Curso</span>
            <span>
              {{
                detalle.curso && typeof detalle.curso === 'object'
                  ? [detalle.curso.codigo, detalle.curso.nombre].filter(Boolean).join(' · ')
                  : detalle.curso || '—'
              }}
            </span>
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
          {{ esActivo ? 'Desactivar' : 'Activar' }} aprendiz
        </q-card-section>

        <q-card-section>
          ¿Desea {{ esActivo ? 'desactivar' : 'activar' }} a
          <strong>{{ confirmacion.fila?.nombre }}</strong>?
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
import { useGeneralStore } from '../stores/general.store.js'
import { mapearError } from '../services/clienteApi.js'
import { aprendicesService } from '../services/aprendices.service.js'
import { cursosService, normalizarId } from '../services/cursos.service.js'
import {
  requerido,
  longitud,
  correoValido,
  digitos,
  unico,
  minusculas
} from '../utils/reglas.js'
import { erroresDeCampo } from '../utils/erroresCampo.js'
import EncabezadoPagina from './EncabezadoPagina.vue'
import TablaDatos from './TablaDatos.vue'

const generalStore = useGeneralStore()

const aprendices = ref([])
const cursos = ref([])
const cargando = ref(false)
const errorCarga = ref('')

const dialogoAbierto = ref(false)
const guardando = ref(false)
const detalleAbierto = ref(false)
const detalleCargando = ref(false)
const formRef = ref(null)
const cursoOriginal = ref(null)
const aprendizId = ref(null)
const detalle = ref(null)

const confirmacion = ref({ abierto: false, fila: null, cargando: false })

function formularioVacio() {
  return { documento: '', nombre: '', email: '', curso: null }
}

const etiquetaCurso = (curso) =>
  curso && typeof curso === 'object'
    ? [curso.codigo, curso.nombre].filter(Boolean).join(' · ')
    : ''

// El backend hace populate("curso"): puede llegar el objeto o solo el id.
function cursoDeFila(aprendiz) {
  const relacion = aprendiz.curso
  if (relacion && typeof relacion === 'object') return etiquetaCurso(relacion)
  const encontrado = cursos.value.find((curso) => curso._id === normalizarId(relacion))
  return encontrado ? etiquetaCurso(encontrado) : ''
}

const columnas = [
  { name: 'documento', label: 'Documento', field: 'documento' },
  { name: 'nombre', label: 'Nombre', field: 'nombre' },
  { name: 'email', label: 'Email', field: 'email' },
  { name: 'curso', label: 'Curso', field: cursoDeFila },
  { name: 'estado', label: 'Estado', field: (fila) => fila.status }
]

const opcionesCursosFormulario = computed(() => {
  const opciones = cursos.value
    .filter((curso) => curso.status === 0)
    .map((curso) => ({
      value: curso._id,
      label: etiquetaCurso(curso)
    }))
  const original = cursoOriginal.value
  if (
    original &&
    typeof original === 'object' &&
    original._id &&
    !opciones.some((opcion) => opcion.value === original._id)
  ) {
    opciones.unshift({ value: original._id, label: `${etiquetaCurso(original)} (inactivo)` })
  }
  return opciones
})

const reglas = {
  documento: [
    requerido('El documento es obligatorio'),
    digitos(4, 15),
    unico({
      obtenerLista: () => aprendices.value,
      obtenerIdPropio: () => aprendizId.value,
      obtenerId: (fila) => fila._id,
      obtenerValor: (fila) => fila.documento,
      mensaje: 'Este documento ya está registrado'
    })
  ],
  nombre: [requerido('El nombre es obligatorio'), longitud(3, 80)],
  email: [
    requerido('El email es obligatorio'),
    correoValido,
    unico({
      obtenerLista: () => aprendices.value,
      obtenerIdPropio: () => aprendizId.value,
      obtenerId: (fila) => fila._id,
      obtenerValor: (fila) => fila.email,
      normalizar: minusculas,
      mensaje: 'Este email ya está registrado'
    })
  ],
  curso: [(valor) => !!valor || 'Seleccione un curso']
}

const form = ref(formularioVacio())
const errores = ref({})

function limpiarError(campo) {
  if (errores.value[campo]) delete errores.value[campo]
}

const filtroCurso = ref('todos')
const opcionesCurso = computed(() => [
  { value: 'todos', label: 'Todos los cursos' },
  ...cursos.value.map((curso) => ({ value: curso._id, label: etiquetaCurso(curso) }))
])
const filtroEstado = ref('todos')
const opcionesEstado = [
  { value: 'todos', label: 'Todos' },
  { value: '0', label: 'Activos' },
  { value: '1', label: 'Inactivos' }
]

// El backend solo devuelve activos al consultar por curso, así que el filtro
// por curso y estado se aplica en cliente sobre la lista completa.
const aprendicesFiltrados = computed(() => {
  const porCurso =
    filtroCurso.value === 'todos'
      ? aprendices.value
      : aprendices.value.filter((fila) => normalizarId(fila.curso) === filtroCurso.value)
  if (filtroEstado.value === 'todos') return porCurso
  return porCurso.filter((fila) => String(fila.status) === filtroEstado.value)
})

async function cargarAprendices() {
  cargando.value = true
  errorCarga.value = ''
  try {
    const [filas, todosCursos] = await Promise.all([
      aprendicesService.listar(),
      cursosService.listar()
    ])
    aprendices.value = filas
    cursos.value = todosCursos
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

function formatearFecha(fecha) {
  if (!fecha) return '—'
  try {
    return new Date(fecha).toLocaleString('es-CO')
  } catch {
    return String(fecha)
  }
}

async function abrirDetalle(fila) {
  detalleAbierto.value = true
  detalleCargando.value = true
  detalle.value = null
  try {
    detalle.value = await aprendicesService.obtener(fila._id)
  } catch (error) {
    generalStore.error(error)
    detalleAbierto.value = false
  } finally {
    detalleCargando.value = false
  }
}

function abrirDialogoCrear() {
  aprendizId.value = null
  cursoOriginal.value = null
  form.value = formularioVacio()
  errores.value = {}
  dialogoAbierto.value = true
  limpiarValidacion()
}

function abrirDialogoEditar(fila) {
  aprendizId.value = fila._id
  cursoOriginal.value = fila.curso
  form.value = {
    documento: fila.documento,
    nombre: fila.nombre,
    email: fila.email,
    curso: normalizarId(fila.curso)
  }
  errores.value = {}
  dialogoAbierto.value = true
  limpiarValidacion()
}

async function guardar() {
  if (!(await formRef.value.validate())) return
  errores.value = {}
  guardando.value = true
  const datos = {
    documento: String(form.value.documento).trim(),
    nombre: form.value.nombre.trim(),
    email: form.value.email.trim(),
    curso: form.value.curso
  }
  try {
    const respuesta = aprendizId.value
      ? await aprendicesService.actualizar(aprendizId.value, datos)
      : await aprendicesService.crear(datos)
    generalStore.exito(respuesta.msg || 'Aprendiz guardado correctamente')
    dialogoAbierto.value = false
    await cargarAprendices()
  } catch (error) {
    errores.value = erroresDeCampo(error, {
      documento: [/documento/i],
      nombre: [/nombre/i],
      email: [/email/i],
      curso: [/curso/i]
    })
    generalStore.error(error)
  } finally {
    guardando.value = false
  }
}

function abrirConfirmacion(fila) {
  confirmacion.value = { abierto: true, fila, cargando: false }
}

async function confirmarAccion() {
  const fila = confirmacion.value.fila
  confirmacion.value.cargando = true
  try {
    const respuesta =
      fila.status === 0
        ? await aprendicesService.desactivar(fila._id)
        : await aprendicesService.activar(fila._id)
    generalStore.exito(respuesta.msg)
    confirmacion.value.abierto = false
    await cargarAprendices()
  } catch (error) {
    generalStore.error(error)
  } finally {
    confirmacion.value.cargando = false
  }
}

const esActivo = computed(() => confirmacion.value.fila?.status === 0)

onMounted(cargarAprendices)
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
</style>
