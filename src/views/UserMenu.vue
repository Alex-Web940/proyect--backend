<template>
  <q-btn flat round dense aria-label="Menú de usuario">
    <span class="avatar">{{ iniciales }}</span>

    <q-menu anchor="bottom right" self="top right">
      <div class="usuario-menu">
        <div class="avatar grande">{{ iniciales }}</div>
        <div class="nombre">{{ sesionStore.usuario?.nombre }}</div>
        <div class="correo">{{ sesionStore.usuario?.email }}</div>
        <span class="rol" :class="{ admin: sesionStore.esAdmin }">{{ sesionStore.usuario?.rol }}</span>
      </div>

      <q-separator />

      <q-list>
        <q-item v-close-popup clickable @click="salidaAbierta = true">
          <q-item-section avatar>
            <q-icon name="logout" color="negative" />
          </q-item-section>
          <q-item-section>Cerrar sesión</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>

  <ConfirmarSalida v-model="salidaAbierta" @confirmar="cerrarSesion" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSesionStore } from '../stores/sesion.store.js'
import ConfirmarSalida from './ConfirmarSalida.vue'

const sesionStore = useSesionStore()
const router = useRouter()
const salidaAbierta = ref(false)

// Iniciales del usuario (máximo 2 palabras) para el avatar.
const iniciales = computed(() =>
  (sesionStore.usuario?.nombre || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0])
    .join('')
    .toUpperCase()
)

function cerrarSesion() {
  sesionStore.cerrarSesion()
  router.replace({ name: 'login' })
}
</script>

<style scoped>
.avatar {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  width: 34px;
  height: 34px;
  color: var(--on-primary);
  font-size: 13px;
  font-weight: 800;
  font-family: var(--font-title);
  border-radius: 50%;
  display: grid;
  place-items: center;
}
.avatar.grande {
  width: 52px;
  height: 52px;
  margin-bottom: 8px;
  font-size: 18px;
}

.usuario-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 230px;
  max-width: 86vw;
  padding: 18px 22px 14px;
}
.nombre {
  font-family: var(--font-title);
  color: var(--text-title);
  font-size: 16px;
  font-weight: 700;
}
.correo {
  color: var(--text-dim);
  word-break: break-all;
  margin: 2px 0 8px;
  font-size: 13px;
}
.rol {
  letter-spacing: 0.04em;
  color: var(--info);
  background: color-mix(in srgb, var(--info) 15%, transparent);
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 11.5px;
  font-weight: 800;
}
.rol.admin {
  color: var(--secondary);
  background: color-mix(in srgb, var(--secondary) 16%, transparent);
}
</style>
