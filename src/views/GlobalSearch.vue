<template>
  <q-dialog
    :model-value="modelValue"
    position="top"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="paleta tarjeta" role="dialog" aria-label="Búsqueda global">
      <div class="entrada">
        <q-icon name="search" size="22px" />
        <input
          ref="entrada"
          v-model="consulta"
          type="text"
          placeholder="Ir a una vista…"
          aria-label="Buscar vistas"
          role="combobox"
          aria-expanded="true"
          aria-controls="lista-vistas"
          autocomplete="off"
          @keydown="teclas"
        />
        <kbd>Esc</kbd>
      </div>

      <ul id="lista-vistas" class="lista" role="listbox">
        <li
          v-for="(vista, indice) in filtradas"
          :key="vista.nombre"
          role="option"
          :aria-selected="indice === activo"
          :class="{ activo: indice === activo }"
          @mouseenter="activo = indice"
          @click="irA(vista)"
        >
          <q-icon :name="vista.icono" size="22px" />
          <span class="txt">
            <strong>{{ vista.titulo }}</strong>
            <small>{{ vista.descripcion }}</small>
          </span>
          <q-icon v-if="indice === activo" name="keyboard_return" size="18px" />
        </li>
        <li v-if="!filtradas.length" class="vacio" role="status">Sin resultados para «{{ consulta }}»</li>
      </ul>

      <div class="pie"><kbd>↑</kbd><kbd>↓</kbd> navegar <kbd>Enter</kbd> abrir</div>
    </div>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useSesionStore } from '../stores/sesion.store.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])

const router = useRouter()
const sesionStore = useSesionStore()

const consulta = ref('')
const activo = ref(0)
const entrada = ref(null)

// Quita acentos y pasa a minúsculas para comparar.
const normalizar = (texto) =>
  (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

// Vistas navegables según permisos (las de admin solo para admin).
const vistas = computed(() =>
  router
    .getRoutes()
    .filter(
      (r) =>
        r.meta?.menu &&
        r.meta?.titulo &&
        (!r.meta.requiereAdmin || sesionStore.esAdmin)
    )
    .map((r) => ({
      nombre: r.name,
      titulo: r.meta.titulo,
      icono: r.meta.menu.icono,
      descripcion: r.meta.menu.descripcion
    }))
)

const filtradas = computed(() => {
  const texto = normalizar(consulta.value)
  return vistas.value.filter(
    (vista) => !texto || normalizar(vista.titulo + ' ' + vista.descripcion).includes(texto)
  )
})

// Al abrir: limpia y enfoca. Al escribir: reinicia el resaltado.
watch(
  () => props.modelValue,
  (abierto) => {
    if (abierto) {
      consulta.value = ''
      activo.value = 0
      nextTick(() => entrada.value?.focus())
    }
  }
)
watch(consulta, () => {
  activo.value = 0
})

function cerrar() {
  emit('update:modelValue', false)
}

function irA(vista) {
  if (vista) {
    cerrar()
    router.push({ name: vista.nombre })
  }
}

// Navegación con teclado dentro del listado.
function teclas(evento) {
  const total = filtradas.value.length
  if (evento.key === 'ArrowDown') {
    evento.preventDefault()
    if (total) activo.value = (activo.value + 1) % total
  } else if (evento.key === 'ArrowUp') {
    evento.preventDefault()
    if (total) activo.value = (activo.value - 1 + total) % total
  } else if (evento.key === 'Enter') {
    evento.preventDefault()
    irA(filtradas.value[activo.value])
  } else if (evento.key === 'Escape') {
    cerrar()
  }
}
</script>

<style scoped>
.paleta {
  width: 560px;
  max-width: 94vw;
  margin-top: 8vh;
  overflow: hidden;
}

.entrada {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  color: var(--text-dim);
}
.entrada input {
  min-width: 0;
  flex: 1;
  font: inherit;
  font-size: 16px;
  color: var(--text-title);
  background: 0 0;
  border: 0;
  outline: 0;
}
.entrada:focus-within {
  box-shadow: inset 0 -2px 0 var(--primary);
}

kbd {
  border: 1px solid var(--border);
  background: var(--bg-elev);
  color: var(--text-dim);
  border-radius: 6px;
  margin: 0 3px;
  padding: 2px 7px;
  font-family: inherit;
  font-size: 11.5px;
}

.lista {
  max-height: 50vh;
  margin: 0;
  padding: 8px;
  list-style: none;
  overflow-y: auto;
}
.lista li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text);
}
.lista li.activo {
  background: color-mix(in srgb, var(--primary) 16%, transparent);
  color: var(--text-title);
}
.lista li.activo .q-icon:first-child {
  color: var(--primary);
}

.txt {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.txt small {
  color: var(--text-dim);
}

.vacio {
  color: var(--text-dim);
  justify-content: center;
  cursor: default !important;
}

.pie {
  color: var(--text-dim);
  border-top: 1px solid var(--border);
  padding: 9px 16px;
  font-size: 12px;
}
</style>
