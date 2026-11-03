<template>
  <q-btn
    flat
    round
    dense
    :icon="actual.icono"
    :aria-label="`Tema: ${actual.etiqueta}. Cambiar tema`"
  >
    <q-tooltip>Tema: {{ actual.etiqueta }}</q-tooltip>

    <q-menu auto-close anchor="bottom right" self="top right">
      <q-list style="min-width: 170px" role="menu">
        <q-item
          v-for="opcion in opciones"
          :key="opcion.valor"
          clickable
          role="menuitemradio"
          :aria-checked="modo === opcion.valor"
          @click="setModo(opcion.valor)"
        >
          <q-item-section avatar>
            <q-icon :name="opcion.icono" :color="modo === opcion.valor ? 'primary' : undefined" />
          </q-item-section>
          <q-item-section :class="{ 'text-primary text-weight-bold': modo === opcion.valor }">
            {{ opcion.etiqueta }}
          </q-item-section>
          <q-item-section v-if="modo === opcion.valor" side>
            <q-icon name="check" color="primary" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup>
import { computed } from 'vue'
import { useTema } from '../composables/use-tema.js'

const { modo, setModo } = useTema()

const opciones = [
  { valor: 'light', etiqueta: 'Claro', icono: 'light_mode' },
  { valor: 'dark', etiqueta: 'Oscuro', icono: 'dark_mode' },
  { valor: 'auto', etiqueta: 'Automático', icono: 'brightness_auto' }
]

const actual = computed(() => opciones.find((opcion) => opcion.valor === modo.value))
</script>
