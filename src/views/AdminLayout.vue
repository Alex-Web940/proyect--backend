<template>
  <q-layout view="hHh LpR lFf">
    <a href="#" class="saltar" @click.prevent="saltarAlContenido">Saltar al contenido</a>

    <q-header>
      <q-toolbar class="barra-superior">
        <q-btn flat round dense icon="menu" aria-label="Abrir o cerrar el menú" @click="alternarMenu" />

        <nav class="migas" aria-label="Ruta de navegación">
          <span class="raiz">Repfora</span>
          <q-icon name="chevron_right" size="18px" />
          <span class="actual" aria-current="page">{{ ruta.meta.titulo }}</span>
        </nav>

        <q-space />

        <q-btn
          flat
          dense
          no-caps
          class="btn-busqueda"
          icon="search"
          aria-label="Buscar (Ctrl K)"
          @click="generalStore.busquedaAbierta = true"
        >
          <span class="texto-busqueda">Buscar</span>
          <kbd class="atajo">Ctrl K</kbd>
        </q-btn>

        <ThemeToggle />
        <UserMenu />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawerAbierto"
      show-if-above
      :mini="modoMini"
      :width="262"
      :mini-width="76"
      :breakpoint="1024"
      aria-label="Menú principal"
    >
      <div class="drawer" :class="{ mini: modoMini }">
        <div class="logo" :class="{ solo: modoMini }">
          <span class="logo-icono">R</span>
          <span v-if="!modoMini" class="logo-texto q-mini-drawer-hide">Repfora</span>
        </div>

        <nav aria-label="Secciones">
          <q-list padding class="menu">
            <q-item
              v-for="(item, indice) in rutasMenu"
              :key="item.nombre"
              v-ripple
              :to="{ name: item.nombre }"
              exact
              clickable
              class="item-menu"
              :style="{ '--i': indice }"
              active-class="activo"
              @click="!esEscritorio && (drawerAbierto = false)"
            >
              <q-item-section avatar>
                <q-icon :name="item.icono" />
              </q-item-section>
              <q-item-section v-if="!modoMini" class="q-mini-drawer-hide">
                {{ item.titulo }}
              </q-item-section>
              <q-tooltip v-if="modoMini" anchor="center right" self="center left" :offset="[10, 0]">
                {{ item.titulo }}
              </q-tooltip>
            </q-item>
          </q-list>
        </nav>

        <q-space />

        <div class="pie-usuario" :class="{ solo: modoMini }">
          <div v-if="!modoMini" class="info q-mini-drawer-hide">
            <strong>{{ sesionStore.usuario?.nombre }}</strong>
            <small>{{ sesionStore.usuario?.rol }}</small>
          </div>
          <q-btn flat round dense icon="logout" aria-label="Cerrar sesión" @click="salidaAbierta = true">
            <q-tooltip>Cerrar sesión</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <q-page>
        <main id="contenido-principal" class="pagina" tabindex="-1">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </main>
      </q-page>
    </q-page-container>

    <GlobalSearch v-model="generalStore.busquedaAbierta" />
    <ConfirmarSalida v-model="salidaAbierta" @confirmar="cerrarSesion" />
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useSesionStore } from '../stores/sesion.store.js'
import { useGeneralStore } from '../stores/general.store.js'
import ThemeToggle from './ThemeToggle.vue'
import UserMenu from './UserMenu.vue'
import GlobalSearch from './GlobalSearch.vue'
import ConfirmarSalida from './ConfirmarSalida.vue'

const quasar = useQuasar()
const ruta = useRoute()
const router = useRouter()
const sesionStore = useSesionStore()
const generalStore = useGeneralStore()

// Estado del drawer en móvil (en escritorio manda menuColapsado del store).
const drawerAbierto = ref(true)
const salidaAbierta = ref(false)
const esEscritorio = computed(() => quasar.screen.width >= 1024)
const modoMini = computed(() => esEscritorio.value && generalStore.menuColapsado)

// Rutas visibles en el menú lateral (las de admin solo para admin).
const rutasMenu = computed(() =>
  router
    .getRoutes()
    .filter((r) => r.meta?.menu && (!r.meta.requiereAdmin || sesionStore.esAdmin))
    .map((r) => ({
      nombre: r.name,
      titulo: r.meta.titulo,
      icono: r.meta.menu.icono
    }))
)

function alternarMenu() {
  if (esEscritorio.value) generalStore.menuColapsado = !generalStore.menuColapsado
  else drawerAbierto.value = !drawerAbierto.value
}

function cerrarSesion() {
  sesionStore.cerrarSesion()
  router.replace({ name: 'login' })
}

function saltarAlContenido() {
  document.getElementById('contenido-principal')?.focus()
}

// Atajo Ctrl/Cmd + K para abrir la búsqueda global.
function alTeclear(evento) {
  if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === 'k') {
    evento.preventDefault()
    generalStore.busquedaAbierta = true
  }
}

onMounted(() => window.addEventListener('keydown', alTeclear))
onBeforeUnmount(() => window.removeEventListener('keydown', alTeclear))
</script>

<style scoped>
.barra-superior {
  gap: 6px;
  min-height: 56px;
}

.migas {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  margin-left: 8px;
  font-size: 14.5px;
}
.raiz {
  color: var(--text-dim);
}
.actual {
  color: var(--text-title);
  font-weight: 700;
  font-family: var(--font-title);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.btn-busqueda {
  color: var(--text-dim);
  border: 1px solid var(--border);
  background: var(--bg-elev);
}
.texto-busqueda {
  margin: 0 8px 0 6px;
}
.atajo {
  font: inherit;
  border: 1px solid var(--border);
  border-radius: 5px;
  padding: 1px 6px;
  font-size: 11px;
}

@media (max-width: 599px) {
  .texto-busqueda,
  .atajo,
  .raiz,
  .migas .q-icon {
    display: none;
  }
}

.drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 14px 12px 12px;
}
/* En modo mini Quasar calcula los ítems al ancho completo del drawer:
   el padding interno los desplazaría y recortaría. */
.drawer.mini {
  padding-inline: 0;
}
.drawer.mini .logo {
  padding-inline: 0;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px 14px;
}
.logo.solo {
  justify-content: center;
  padding-inline: 0;
}
.logo-icono {
  width: 38px;
  height: 38px;
  font: 800 21px var(--font-title);
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: var(--on-primary);
  box-shadow: var(--glow);
  border-radius: 12px;
  flex: none;
  display: grid;
  place-items: center;
}
.logo-texto {
  font: 800 22px var(--font-title);
  color: var(--text-title);
}

.menu {
  display: grid;
  gap: 4px;
  padding: 0;
}
.item-menu {
  border-radius: var(--radius-sm);
  min-height: 46px;
  color: var(--text);
  animation: 0.4s both aparecer;
  animation-delay: calc(var(--i) * 55ms);
}
.item-menu:hover {
  background: var(--bg-elev);
  color: var(--text-title);
}
.item-menu.activo {
  background: color-mix(in srgb, var(--primary) 17%, transparent);
  color: var(--primary);
  box-shadow: inset 3px 0 0 var(--primary);
  font-weight: 700;
}

.pie-usuario {
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 10px 6px 0;
}
/* Con el drawer colapsado solo queda el botón: se centra. */
.pie-usuario.solo {
  justify-content: center;
  padding-inline: 0;
}
.pie-usuario .info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}
.pie-usuario strong {
  color: var(--text-title);
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 14px;
  overflow: hidden;
}
.pie-usuario small {
  color: var(--text-dim);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
