<template>
  <div class="kpi tarjeta" :style="{ '--acento': `var(--${color})` }" :aria-busy="cargando">
    <div class="icono">
      <q-icon :name="icono" size="24px" />
    </div>
    <div class="cuerpo">
      <div class="titulo-kpi">{{ titulo }}</div>
      <q-skeleton v-if="cargando" type="text" width="70px" height="36px" />
      <div v-else class="valor">{{ valor }}</div>
      <q-skeleton v-if="cargando" type="text" width="110px" />
      <div v-else class="detalle">{{ detalle }}</div>
    </div>
  </div>
</template>

<script setup>
// Tarjeta de indicador del Dashboard; muestra esqueleto mientras cargando.
defineProps({
  icono: { type: String, required: true },
  titulo: { type: String, required: true },
  valor: { type: [String, Number], default: '–' },
  detalle: { type: String, default: '' },
  color: { type: String, default: 'primary' },
  cargando: { type: Boolean, default: false }
})
</script>

<style scoped>
.kpi {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
  padding: 18px;
  position: relative;
  overflow: hidden;
}
.kpi:before {
  content: "";
  background: var(--acento);
  border-radius: 0 3px 3px 0;
  width: 3px;
  position: absolute;
  top: 14px;
  bottom: 14px;
  left: 0;
}
.icono {
  width: 46px;
  height: 46px;
  color: var(--acento);
  background: color-mix(in srgb, var(--acento) 15%, transparent);
  border-radius: 13px;
  flex: none;
  display: grid;
  place-items: center;
}
.cuerpo {
  min-width: 0;
}
.titulo-kpi {
  color: var(--text-dim);
  font-size: 13.5px;
  font-weight: 600;
}
.valor {
  font-family: var(--font-title);
  color: var(--text-title);
  font-size: 32px;
  font-weight: 800;
  line-height: 1.15;
}
.detalle {
  color: var(--text-dim);
  font-size: 13px;
}
</style>
