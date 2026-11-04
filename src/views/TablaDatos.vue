<template>
  <div class="tarjeta tabla-envoltorio aparece">
    <div class="barra">
      <div class="buscador-grupo">
        <q-select
          v-model="campoBusqueda"
          :options="opcionesBusqueda"
          emit-value
          map-options
          options-dense
          dense
          outlined
          label="Buscar por"
          class="selector-busqueda"
          aria-label="Criterio de búsqueda"
        />

        <q-input
          v-model="busqueda"
          dense
          outlined
          clearable
          debounce="150"
          :disable="!campoBusqueda"
          :placeholder="campoBusqueda ? `Buscar en ${etiquetaBusqueda}…` : 'Elija un criterio'"
          aria-label="Buscar en la tabla"
          class="buscador"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div class="herramientas">
        <q-btn
          flat
          round
          dense
          icon="refresh"
          aria-label="Recargar datos"
          :disable="cargando"
          @click="emit('recargar')"
        >
          <q-tooltip>Recargar</q-tooltip>
        </q-btn>

        <q-btn flat round dense icon="view_column" aria-label="Columnas visibles">
          <q-tooltip>Columnas</q-tooltip>
          <q-menu>
            <q-list dense style="min-width: 190px">
              <q-item-label header>Columnas visibles</q-item-label>
              <q-item
                v-for="col in columnas"
                :key="col.name"
                tag="label"
                clickable
              >
                <q-item-section side>
                  <q-checkbox
                    dense
                    :model-value="!ocultas.includes(col.name)"
                    @update:model-value="(valor) => alternarColumna(col.name, valor)"
                  />
                </q-item-section>
                <q-item-section>{{ col.label }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="format_line_spacing"
          aria-label="Densidad de filas"
        >
          <q-tooltip>Densidad</q-tooltip>
          <q-menu auto-close>
            <q-list dense style="min-width: 170px">
              <q-item-label header>Densidad</q-item-label>
              <q-item
                v-for="opcion in opcionesDensidad"
                :key="opcion.value"
                clickable
                :active="densidad === opcion.value"
                @click="densidad = opcion.value"
              >
                <q-item-section avatar>
                  <q-icon :name="opcion.icon" />
                </q-item-section>
                <q-item-section>{{ opcion.label }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn
          flat
          dense
          no-caps
          icon="download"
          label="CSV"
          aria-label="Exportar a CSV"
          :disable="!filasFiltradas.length"
          @click="exportarCsv"
        />
      </div>
    </div>

    <div
      v-if="cargando && !filas.length"
      class="esqueleto"
      role="status"
      aria-label="Cargando datos"
    >
      <q-skeleton
        v-for="n in 7"
        :key="n"
        type="rect"
        height="40px"
        class="q-mb-sm"
      />
    </div>

    <q-table
      v-else
      v-model:pagination="paginacion"
      flat
      row-key="_id"
      :class="['tabla', `densidad-${densidad}`]"
      :rows="filasFiltradas"
      :columns="columnasTabla"
      :loading="cargando"
      :dense="densidad === 'compacta'"
      :rows-per-page-options="[10, 25, 50, 0]"
      rows-per-page-label="Filas:"
      no-data-label="Sin datos"
      table-header-class="encabezado-tabla"
    >
      <template v-slot:body="props">
        <q-tr
          :props="props"
          :class="{ 'fila-inactiva': props.row.status === 1 }"
        >
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <span
              v-if="col.name === 'estado'"
              :class="['chip-estado', props.row.status === 0 ? 'activo' : 'inactivo']"
            >
              <i class="punto" />{{ props.row.status === 0 ? 'Activo' : 'Inactivo' }}
            </span>
            <slot
              v-else-if="col.name === 'acciones'"
              name="acciones"
              :fila="props.row"
            />
            <template v-else>{{ col.value }}</template>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:no-data>
        <div class="vacio" role="status">
          <q-icon name="inbox" size="44px" />
          <strong>{{ busqueda ? 'Sin coincidencias' : textoVacio }}</strong>
          <span v-if="busqueda">Pruebe con otro término de búsqueda.</span>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, computed, watch, useSlots } from 'vue'

const props = defineProps({
  filas: { type: Array, default: () => [] },
  columnas: { type: Array, required: true },
  cargando: { type: Boolean, default: false },
  nombreArchivo: { type: String, default: 'datos' },
  textoVacio: { type: String, default: 'No hay registros para mostrar' }
})

const emit = defineEmits(['recargar'])
const slots = useSlots()

const busqueda = ref('')
// Columna por la que se busca. Es obligatoria: mientras esté vacía el campo
// de texto queda deshabilitado.
const campoBusqueda = ref('')
const densidad = ref('normal')
const paginacion = ref({ page: 1, rowsPerPage: 10, sortBy: null, descending: false })
const ocultas = ref([])

const haySlotAcciones = computed(() => !!slots.acciones)

// Opciones del selector: todas las columnas visibles, salvo las marcadas con
// `noBuscar` (por ejemplo, el rol en Usuarios).
const opcionesBusqueda = computed(() =>
  props.columnas
    .filter((col) => !ocultas.value.includes(col.name) && !col.noBuscar)
    .map((col) => ({ value: col.name, label: col.label }))
)

const columnaBusqueda = computed(
  () => props.columnas.find((col) => col.name === campoBusqueda.value) || null
)

const etiquetaBusqueda = computed(() => columnaBusqueda.value?.label || '')

// Al cambiar de criterio se descarta el texto anterior para no filtrar con
// una columna distinta a la que se muestra.
watch(campoBusqueda, () => {
  busqueda.value = ''
})

// Si la columna elegida se oculta desde "Columnas visibles", se limpia.
watch(ocultas, (lista) => {
  if (campoBusqueda.value && lista.includes(campoBusqueda.value)) {
    campoBusqueda.value = ''
  }
})

const opcionesDensidad = [
  { label: 'Compacta', value: 'compacta', icon: 'density_small' },
  { label: 'Normal', value: 'normal', icon: 'density_medium' },
  { label: 'Amplia', value: 'amplia', icon: 'density_large' }
]

const normalizar = (valor) =>
  String(valor ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

function valorCrudo(col, fila) {
  const valor = typeof col.field === 'function' ? col.field(fila) : fila[col.field ?? col.name]
  return col.format ? col.format(valor, fila) : valor
}

function valorCelda(col, fila) {
  if (col.name === 'estado') return fila.status === 0 ? 'Activo' : 'Inactivo'
  return valorCrudo(col, fila) ?? ''
}

const filasFiltradas = computed(() => {
  const texto = normalizar(busqueda.value.trim())
  const col = columnaBusqueda.value
  // Sin criterio (o sin texto) no se filtra: se muestra todo.
  if (!texto || !col) return props.filas
  return props.filas.filter((fila) => normalizar(valorCelda(col, fila)).includes(texto))
})

const columnasTabla = computed(() => {
  const cols = props.columnas
    .filter((col) => !ocultas.value.includes(col.name))
    // `noBuscar` solo lo usa el selector; no debe llegar a la tabla.
    .map(({ format, noBuscar, ...resto }) => ({
      align: 'left',
      sortable: true,
      ...resto,
      field: (fila) => valorCelda({ ...resto, format }, fila)
    }))

  if (haySlotAcciones.value) {
    cols.push({
      name: 'acciones',
      label: 'Acciones',
      field: () => '',
      align: 'right',
      sortable: false,
      classes: 'col-acciones',
      headerClasses: 'col-acciones'
    })
  }

  return cols
})

function alternarColumna(nombre, visible) {
  ocultas.value = visible
    ? ocultas.value.filter((n) => n !== nombre)
    : [...ocultas.value, nombre]
}

const entreComillas = (valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`

function exportarCsv() {
  const cols = props.columnas.filter((col) => !ocultas.value.includes(col.name))
  const lineas = [cols.map((col) => entreComillas(col.label)).join(',')]
  filasFiltradas.value.forEach((fila) => {
    lineas.push(cols.map((col) => entreComillas(valorCelda(col, fila))).join(','))
  })

  const blob = new Blob(['\ufeff' + lineas.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = `${props.nombreArchivo}-${new Date().toISOString().slice(0, 10)}.csv`
  enlace.click()
  URL.revokeObjectURL(url)
}
</script>

<style>
.tabla-envoltorio {
  min-width: 0;
  overflow: hidden;
}
.tabla-envoltorio .barra {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
}
.tabla-envoltorio .buscador-grupo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.tabla-envoltorio .selector-busqueda {
  width: 190px;
  max-width: 100%;
}
.tabla-envoltorio .buscador {
  width: 300px;
  max-width: 100%;
}
.tabla-envoltorio .herramientas {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
}
.tabla-envoltorio .esqueleto {
  padding: 16px;
}
.tabla-envoltorio .tabla {
  color: var(--text);
  background: transparent;
}
.tabla-envoltorio .tabla thead tr {
  background: var(--bg-elev);
}
.tabla-envoltorio .tabla th {
  color: var(--text-title);
  white-space: nowrap;
  font-size: 13px;
  font-weight: 700;
}
.tabla-envoltorio .tabla td {
  border-color: var(--border);
  color: var(--text);
}
.tabla-envoltorio .tabla tbody tr:hover td {
  background: color-mix(in srgb, var(--border) 45%, transparent);
}
.tabla-envoltorio .tabla .q-table__bottom {
  border-color: var(--border);
  color: var(--text);
}
.tabla-envoltorio .tabla .q-table__bottom .q-field__native {
  color: var(--text-title) !important;
}
.tabla-envoltorio .fila-inactiva td {
  opacity: 0.72;
}
.tabla-envoltorio .densidad-amplia td {
  height: 62px;
}
.tabla-envoltorio .densidad-normal td {
  height: 50px;
}
.tabla-envoltorio .vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 36px 12px;
  color: var(--text-dim);
}
.tabla-envoltorio .vacio strong {
  color: var(--text-title);
}
.tabla-envoltorio .tabla th.col-acciones,
.tabla-envoltorio .tabla td.col-acciones {
  position: sticky;
  right: 0;
  z-index: 2;
  background: var(--bg-card);
  white-space: nowrap;
  box-shadow: -10px 0 12px -10px #00000073;
}
.tabla-envoltorio .tabla thead th.col-acciones,
.tabla-envoltorio .tabla tbody tr:hover td.col-acciones {
  background: var(--bg-elev);
}
@media (max-width: 599px) {
  .tabla-envoltorio .buscador,
  .tabla-envoltorio .selector-busqueda {
    width: 100%;
  }
}
</style>
