<template>
  <div>
    <EncabezadoPagina
      titulo="Cursos"
      icono="school"
      descripcion="Programas de formación disponibles"
      texto-boton="Nuevo curso"
      @accion="abrirDialogoCrear"
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
      aria-label="Filtrar cursos por estado"
      :disable="cargando"
      @update:model-value="cargarCursos"
    />

    <TablaDatos
      :filas="cursos"
      :columnas="columnas"
      :cargando="cargando"
      nombre-archivo="cursos"
      texto-vacio="Aún no hay cursos registrados"
      @recargar="cargarCursos"
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
          :aria-label="`Editar curso ${fila.nombre}`"
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
          :aria-label="`${fila.status === 0 ? 'Desactivar' : 'Activar'} curso ${fila.nombre}`"
          @click="abrirConfirmacion(fila)"
        >
          <q-tooltip>{{ fila.status === 0 ? 'Desactivar' : 'Activar' }}</q-tooltip>
        </q-btn>
      </template>
    </TablaDatos>

    <!-- Diálogo de creación / edición -->
    <q-dialog v-model="dialogoAbierto" persistent>
      <q-card class="dialogo">
        <q-form ref="formRef" greedy novalidate @submit.prevent="guardar">
          <q-card-section class="dialogo-titulo">
            <q-icon name="school" color="primary" />
            {{ cursoId ? 'Editar curso' : 'Nuevo curso' }}
          </q-card-section>

          <q-card-section class="column q-gutter-y-sm">
            <q-input
              v-model="form.codigo"
              outlined
              label="Código"
              :rules="reglasFormulario.codigo"
              lazy-rules="ondemand"
              :disable="guardando"
              :error="!!errores.codigo"
              :error-message="errores.codigo"
              autofocus
              @update:model-value="(v) => { form.codigo = (v ?? '').toString().toUpperCase(); limpiarError('codigo') }"
            />
            <q-input
              v-model="form.nombre"
              outlined
              label="Nombre"
              :rules="reglasFormulario.nombre"
              lazy-rules="ondemand"
              :disable="guardando"
              :error="!!errores.nombre"
              :error-message="errores.nombre"
              @update:model-value="() => limpiarError('nombre')"
            />
            <q-input
              v-model="form.duracion"
              outlined
              type="number"
              min="1"
              label="Duración (horas)"
              :rules="reglasFormulario.duracion"
              lazy-rules="ondemand"
              :disable="guardando"
              :error="!!errores.duracion"
              :error-message="errores.duracion"
              @update:model-value="() => limpiarError('duracion')"
            />
          </q-card-section>

          <q-card-actions align="right" class="dialogo-acciones">
            <q-btn flat no-caps label="Cancelar" :disable="guardando" @click="dialogoAbierto = false" />
            <q-btn
              type="submit"
              color="primary"
              class="btn-glow"
              unelevated
              no-caps
              :label="cursoId ? 'Actualizar' : 'Crear'"
              :loading="guardando"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Diálogo de detalle -->
    <q-dialog v-model="dialogoDetalle">
      <q-card class="dialogo">
        <q-card-section class="dialogo-titulo">
          <q-icon name="school" color="primary" />Detalle del curso
        </q-card-section>

        <q-card-section v-if="cargandoDetalle" class="column q-gutter-sm">
          <q-linear-progress v-for="n in 4" :key="n" type="text" width="70%" class="q-mb-sm" />
        </q-card-section>

        <q-card-section v-else-if="detalle" class="column q-gutter-y-sm">
          <div class="detalle-fila">
            <span class="etiqueta">Código</span>
            <span>{{ detalle.codigo }}</span>
          </div>
          <div class="detalle-fila">
            <span class="etiqueta">Nombre</span>
            <span>{{ detalle.nombre }}</span>
          </div>
          <div class="detalle-fila">
            <span class="etiqueta">Duración</span>
            <span>{{ detalle.duracion }} h</span>
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
          <q-btn flat no-caps label="Cerrar" @click="dialogoDetalle = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo de confirmación para activar / desactivar -->
    <q-dialog v-model="confirmacion.abierto">
      <q-card class="dialogo" role="alertdialog">
        <q-card-section class="dialogo-titulo">
          <q-icon
            :name="esDesactivar ? 'toggle_off' : 'toggle_on'"
            :color="esDesactivar ? 'warning' : 'positive'"
          />
          {{ esDesactivar ? 'Desactivar curso' : 'Activar curso' }}
        </q-card-section>

        <q-card-section>
          ¿Desea {{ esDesactivar ? 'desactivar' : 'activar' }} el curso <strong>{{ confirmacion.fila?.nombre }}</strong>? <span v-if="esDesactivar"> Dejará de aparecer al asignar aprendices.</span>
        </q-card-section>

        <q-card-actions align="right" class="dialogo-acciones">
          <q-btn flat no-caps label="Cancelar" :disable="confirmacion.cargando" @click="confirmacion.abierto = false" />
          <q-btn
            :color="esDesactivar ? 'negative' : 'positive'"
            unelevated
            no-caps
            :label="esDesactivar ? 'Desactivar' : 'Activar'"
            :loading="confirmacion.cargando"
            @click="ejecutarConfirmacion"
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
import { cursosService } from '../services/cursos.service.js'
import { requerido, longitud, entero, unico } from '../utils/reglas.js'
import { erroresDeCampo } from '../utils/erroresCampo.js'
import EncabezadoPagina from './EncabezadoPagina.vue'
import TablaDatos from './TablaDatos.vue'

const generalStore = useGeneralStore()

const cursos = ref([])
// Lista completa (sin filtro de estado) solo para validar códigos duplicados.
const cursosParaValidar = ref([])
const cargando = ref(false)
const errorCarga = ref('')
const filtroEstado = ref('todos')

// Opciones del filtro de estado.
const opcionesEstado = [
  { value: 'todos', label: 'Todos' },
  { value: '0', label: 'Activos' },
  { value: '1', label: 'Inactivos' }
]

const dialogoAbierto = ref(false)
const guardando = ref(false)
// Id del curso en edición; null cuando se está creando.
const cursoId = ref(null)
const formRef = ref(null)
const form = ref({ codigo: '', nombre: '', duracion: '' })

// Confirmación de activar / desactivar: { abierto, fila, cargando }.
const confirmacion = ref({ abierto: false, fila: null, cargando: false })

const dialogoDetalle = ref(false)
const cargandoDetalle = ref(false)
const detalle = ref(null)

const columnas = [
  { name: 'codigo', label: 'Código', field: 'codigo' },
  { name: 'nombre', label: 'Nombre', field: 'nombre' },
  {
    name: 'duracion',
    label: 'Duración',
    field: 'duracion',
    format: (valor) => (valor || valor === 0 ? `${valor} h` : '')
  },
  { name: 'estado', label: 'Estado', field: (fila) => fila.status }
]

// Reglas de validación de cada campo del formulario.
const reglasFormulario = {
  codigo: [
    requerido('El código es obligatorio'),
    longitud(2, 20),
    unico({
      obtenerLista: () => cursosParaValidar.value,
      obtenerIdPropio: () => cursoId.value,
      obtenerId: (fila) => fila._id,
      obtenerValor: (fila) => fila.codigo,
      normalizar: (valor) => String(valor ?? '').toUpperCase(),
      mensaje: 'Este código ya está registrado'
    })
  ],
  nombre: [requerido('El nombre es obligatorio'), longitud(3, 100)],
  duracion: [entero(10000, 'La duración es obligatoria')]
}

// Mensajes por campo que devuelve el backend (erroresDeCampo).
const errores = ref({})

function limpiarError(campo) {
  if (errores.value[campo]) delete errores.value[campo]
}

async function cargarCursos() {
  cargando.value = true
  errorCarga.value = ''
  try {
    const status = filtroEstado.value === 'todos' ? undefined : Number(filtroEstado.value)
    cursos.value = await cursosService.listar(status)
  } catch (e) {
    errorCarga.value = e.sesionExpirada ? '' : mapearError(e)
    generalStore.error(e)
  } finally {
    cargando.value = false
  }
}

// Mantiene fresca la lista usada por la regla de código único.
async function cargarCursosParaValidar() {
  try {
    cursosParaValidar.value = await cursosService.listar()
  } catch {
    // Si falla, la validación de duplicados la seguirá haciendo el backend.
  }
}

// Las validaciones se limpian recién cuando el diálogo ya está montado.
function resetearValidacion() {
  nextTick(() => formRef.value?.resetValidation())
}

function formatearFecha(valor) {
  if (!valor) return '—'
  try {
    return new Date(valor).toLocaleString('es-CO')
  } catch {
    return String(valor)
  }
}

async function abrirDetalle(curso) {
  dialogoDetalle.value = true
  cargandoDetalle.value = true
  detalle.value = null
  try {
    detalle.value = await cursosService.obtener(curso._id)
  } catch (e) {
    generalStore.error(e)
    dialogoDetalle.value = false
  } finally {
    cargandoDetalle.value = false
  }
}

function abrirDialogoCrear() {
  cursoId.value = null
  form.value = { codigo: '', nombre: '', duracion: '' }
  errores.value = {}
  dialogoAbierto.value = true
  resetearValidacion()
}

function abrirDialogoEditar(curso) {
  cursoId.value = curso._id
  form.value = { codigo: curso.codigo, nombre: curso.nombre, duracion: curso.duracion }
  errores.value = {}
  dialogoAbierto.value = true
  resetearValidacion()
}

async function guardar() {
  if (!(await formRef.value.validate())) return
  errores.value = {}
  guardando.value = true
  const datos = {
    codigo: form.value.codigo.trim(),
    nombre: form.value.nombre.trim(),
    duracion: Number(form.value.duracion)
  }
  try {
    const respuesta = cursoId.value
      ? await cursosService.actualizar(cursoId.value, datos)
      : await cursosService.crear(datos)
    generalStore.exito(respuesta.msg || 'Curso guardado correctamente')
    dialogoAbierto.value = false
    await Promise.all([cargarCursos(), cargarCursosParaValidar()])
  } catch (e) {
    errores.value = erroresDeCampo(e, {
      codigo: [/código|codigo/i],
      nombre: [/nombre/i],
      duracion: [/duración|duracion/i]
    })
    generalStore.error(e)
  } finally {
    guardando.value = false
  }
}

function abrirConfirmacion(curso) {
  confirmacion.value = { abierto: true, fila: curso, cargando: false }
}

async function ejecutarConfirmacion() {
  const curso = confirmacion.value.fila
  confirmacion.value.cargando = true
  try {
    const respuesta = curso.status === 0
      ? await cursosService.desactivar(curso._id)
      : await cursosService.activar(curso._id)
    generalStore.exito(respuesta.msg)
    confirmacion.value.abierto = false
    await Promise.all([cargarCursos(), cargarCursosParaValidar()])
  } catch (e) {
    generalStore.error(e)
  } finally {
    confirmacion.value.cargando = false
  }
}

// true => se va a desactivar (status 0); false => se va a activar.
const esDesactivar = computed(() => confirmacion.value.fila?.status === 0)

onMounted(() => {
  cargarCursos()
  cargarCursosParaValidar()
})
</script>

<style scoped>
/* Filas del detalle dentro del diálogo. */
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
