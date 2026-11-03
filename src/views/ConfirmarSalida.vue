<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="(valor) => emit('update:modelValue', valor)"
  >
    <q-card class="dialogo" role="alertdialog">
      <q-card-section class="dialogo-titulo">
        <q-icon name="logout" color="negative" />
        Cerrar sesión
      </q-card-section>

      <q-card-section>
        ¿Desea cerrar la sesión actual?
      </q-card-section>

      <q-card-actions align="right" class="dialogo-acciones">
        <q-btn
          flat
          no-caps
          label="Cancelar"
          @click="emit('update:modelValue', false)"
        />
        <q-btn
          color="negative"
          unelevated
          no-caps
          label="Cerrar sesión"
          @click="confirmar"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'confirmar'])

function confirmar() {
  emit('update:modelValue', false)
  emit('confirmar')
}
</script>
