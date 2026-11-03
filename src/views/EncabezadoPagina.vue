<template>
  <header class="encabezado aparece">
    <div class="izq">
      <span v-if="icono" class="ico">
        <q-icon :name="icono" size="26px" />
      </span>
      <div class="textos">
        <h1>{{ titulo }}</h1>
        <p v-if="descripcion">{{ descripcion }}</p>
      </div>
    </div>
    <div class="der">
      <slot />
      <q-btn
        v-if="textoBoton"
        color="primary"
        class="btn-glow"
        icon="add"
        unelevated
        no-caps
        :label="textoBoton"
        @click="$emit('accion')"
      />
    </div>
  </header>
</template>

<script setup>
defineProps({
  titulo: { type: String, required: true },
  icono: { type: String, default: '' },
  descripcion: { type: String, default: '' },
  textoBoton: { type: String, default: '' }
})

defineEmits(['accion'])
</script>

<style scoped>
.encabezado {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 18px;
}
.izq {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}
.ico {
  display: grid;
  place-items: center;
  flex: none;
  width: 50px;
  height: 50px;
  border-radius: 15px;
  color: var(--primary);
  background: color-mix(in srgb, var(--primary) 15%, transparent);
}
h1 {
  margin: 0;
  font-size: clamp(24px, 3vw, 31px);
  font-weight: 800;
  line-height: 1.15;
}
p {
  margin: 2px 0 0;
  color: var(--text-dim);
}
.der {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
