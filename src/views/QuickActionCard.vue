<template>
  <router-link :to="to" class="accion tarjeta" :style="{ '--acento': `var(--${color})` }">
    <span class="ico">
      <q-icon :name="icono" size="22px" />
    </span>
    <span class="txt">
      <span class="t">{{ titulo }}</span>
      <span class="d">{{ descripcion }}</span>
    </span>
    <q-icon name="chevron_right" class="flecha" size="20px" />
  </router-link>
</template>

<script setup>
// Acceso rápido del Dashboard hacia una vista del menú.
defineProps({
  icono: { type: String, required: true },
  titulo: { type: String, required: true },
  descripcion: { type: String, default: '' },
  to: { type: [String, Object], required: true },
  color: { type: String, default: 'primary' }
})
</script>

<style scoped>
.accion {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 14px 16px;
  text-decoration: none;
  transition:
    border-color 0.2s,
    transform 0.2s;
}
.accion:hover {
  border-color: var(--acento);
  transform: translateY(-2px);
}
.ico {
  width: 42px;
  height: 42px;
  color: var(--acento);
  background: color-mix(in srgb, var(--acento) 15%, transparent);
  border-radius: 12px;
  flex: none;
  display: grid;
  place-items: center;
}
.txt {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.t {
  color: var(--text-title);
  font-weight: 700;
}
.d {
  color: var(--text-dim);
  font-size: 13px;
}
.flecha {
  color: var(--text-dim);
  transition: transform 0.2s;
}
.accion:hover .flecha {
  color: var(--acento);
  transform: translate(3px);
}
</style>
