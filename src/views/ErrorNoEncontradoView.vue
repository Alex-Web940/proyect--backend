<template>
  <main class="error404">
    <div class="codigo" aria-hidden="true">404</div>
    <h1>Página no encontrada</h1>
    <p>La dirección que busca no existe o fue movida.</p>
    <q-btn
      color="primary"
      class="btn-glow"
      unelevated
      no-caps
      icon="home"
      label="Volver al inicio"
      :to="{ name: 'dashboard' }"
    />
  </main>
</template>

<script setup>
</script>

<style scoped>
.error404 {
  text-align: center;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  min-height: 100dvh;
  padding: 24px;
  display: flex;
}

.codigo {
  font: 800 clamp(84px, 22vw, 168px) var(--font-title);
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  line-height: 1;
}

h1 {
  margin: 0;
  font-size: 28px;
}

p {
  margin: 0 0 14px;
}
</style>
