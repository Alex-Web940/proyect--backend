<template>
  <div class="dash">
    <section class="hero tarjeta aparece">
      <div>
        <p class="fecha">{{ fecha }}</p>
        <h1>Repfora</h1>
      </div>
      <q-btn
        flat
        dense
        no-caps
        icon="refresh"
        label="Actualizar"
        :disable="cargando"
        aria-label="Actualizar datos del panel"
        @click="cargar"
      />
    </section>

    <div v-if="errores.length" class="banner aviso" role="alert">
      <q-icon name="warning" size="20px" />
      <span>No se pudo cargar: {{ errores.join(' · ') }}</span>
    </div>

    <section class="kpis" aria-label="Indicadores">
      <KpiCard
        icono="school"
        titulo="Cursos activos"
        :valor="cursosActivos.length"
        :detalle="`de ${cursos.length} en total`"
        color="primary"
        :cargando="cargando"
      />
      <KpiCard
        icono="groups"
        titulo="Aprendices"
        :valor="aprendicesActivos.length"
        :detalle="`activos de ${aprendices.length}`"
        color="success"
        :cargando="cargando"
      />
      <KpiCard
        icono="insights"
        titulo="Aprendices por curso"
        :valor="promedio"
        detalle="promedio en cursos activos"
        color="orange"
        :cargando="cargando"
      />
    </section>

    <div class="columnas">
      <section class="tarjeta panel" aria-labelledby="t-accesos">
        <h2 id="t-accesos">Accesos rápidos</h2>
        <div class="accesos">
          <QuickActionCard
            icono="school"
            titulo="Cursos"
            descripcion="Gestionar programas"
            :to="{ name: 'cursos' }"
            color="primary"
          />
          <QuickActionCard
            icono="groups"
            titulo="Aprendices"
            descripcion="Matrículas y estados"
            :to="{ name: 'aprendices' }"
            color="success"
          />
          <QuickActionCard
            v-if="sesionStore.esAdmin"
            icono="person_add"
            titulo="Registro de usuarios"
            descripcion="Crear cuentas de acceso"
            :to="{ name: 'registro' }"
            color="info"
          />
        </div>
      </section>

      <section class="tarjeta panel" aria-labelledby="t-top">
        <h2 id="t-top">Cursos con más aprendices</h2>
        <div v-if="cargando" role="status" aria-label="Cargando">
          <q-skeleton v-for="n in 5" :key="n" type="text" height="30px" class="q-mb-sm" />
        </div>
        <ol v-else-if="topCursos.length" class="top">
          <li v-for="curso in topCursos" :key="curso.id">
            <div class="fila">
              <span class="nombre">{{ curso.nombre }}</span>
              <strong>{{ curso.total }}</strong>
            </div>
            <q-linear-progress
              :value="curso.total / maximoTop"
              rounded
              size="8px"
              color="primary"
              track-color="grey-9"
              :aria-label="`${curso.nombre}: ${curso.total} aprendices`"
            />
          </li>
        </ol>
        <p v-else class="vacio">Aún no hay aprendices activos asignados a cursos.</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSesionStore } from '../stores/sesion.store.js'
import { mapearError } from '../services/clienteApi.js'
import { cursosService, normalizarId } from '../services/cursos.service.js'
import { aprendicesService } from '../services/aprendices.service.js'
import KpiCard from './KpiCard.vue'
import QuickActionCard from './QuickActionCard.vue'

const sesionStore = useSesionStore()
const cargando = ref(true)
const errores = ref([])
const cursos = ref([])
const aprendices = ref([])

const fechaLarga = new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
}).format(new Date())
const fecha = fechaLarga.charAt(0).toUpperCase() + fechaLarga.slice(1)

// `status === 0` = activo en el backend.
const soloActivos = (lista) => lista.filter((item) => item.status === 0)

const cursosActivos = computed(() => soloActivos(cursos.value))
const aprendicesActivos = computed(() => soloActivos(aprendices.value))

const promedio = computed(() =>
  cursosActivos.value.length
    ? (aprendicesActivos.value.length / cursosActivos.value.length).toFixed(1)
    : '0'
)

// Top 5 de cursos por número de aprendices activos matriculados.
const topCursos = computed(() => {
  const conteo = new Map()
  aprendicesActivos.value.forEach((aprendiz) => {
    const cursoId = normalizarId(aprendiz.curso)
    if (cursoId) {
      conteo.set(cursoId, (conteo.get(cursoId) || 0) + 1)
    }
  })

  const lista = [...conteo.entries()].map(([cursoId, total]) => {
    const curso =
      cursos.value.find((c) => c._id === cursoId) ||
      (typeof aprendicesActivos.value.find((c) => normalizarId(c.curso) === cursoId)?.curso == 'object'
        ? aprendicesActivos.value.find((c) => normalizarId(c.curso) === cursoId).curso
        : null)
    return {
      id: cursoId,
      total,
      nombre: curso?.nombre || 'Curso sin nombre',
      codigo: curso?.codigo || ''
    }
  })

  lista.sort((a, b) => b.total - a.total)
  return lista.slice(0, 5)
})

const maximoTop = computed(() => topCursos.value[0]?.total || 1)

async function cargar() {
  cargando.value = true
  errores.value = []

  const [resCursos, resAprendices] = await Promise.allSettled([
    cursosService.listar(),
    aprendicesService.listar()
  ])
  const nombres = ['cursos', 'aprendices']
  const resultados = [resCursos, resAprendices]

  resultados.forEach((resultado, indice) => {
    if (resultado.status === 'rejected' && !resultado.reason?.sesionExpirada) {
      errores.value.push(`${nombres[indice]}: ${mapearError(resultado.reason)}`)
    }
  })

  cursos.value = resCursos.status === 'fulfilled' ? resCursos.value : []
  aprendices.value = resAprendices.status === 'fulfilled' ? resAprendices.value : []
  cargando.value = false
}

onMounted(cargar)
</script>

<style scoped>
.dash {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}
.hero {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 24px 26px;
  background:
    radial-gradient(
      520px 200px at 0% 0%,
      color-mix(in srgb, var(--primary) 16%, transparent),
      transparent 70%
    ),
    radial-gradient(
      420px 200px at 100% 100%,
      color-mix(in srgb, var(--secondary) 14%, transparent),
      transparent 70%
    ),
    var(--bg-card);
}
.fecha {
  color: var(--text-dim);
  margin: 0;
}
.hero h1 {
  margin: 2px 0 4px;
  font-size: clamp(26px, 4vw, 38px);
  font-weight: 800;
  line-height: 1.1;
  overflow-wrap: anywhere;
}
.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 14px;
}
.columnas {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;
}
.panel {
  min-width: 0;
  padding: 20px;
}
.panel h2 {
  margin: 0 0 14px;
  font-size: 19px;
  font-weight: 700;
}
.accesos {
  display: grid;
  gap: 10px;
}
.top {
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.fila {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}
.nombre {
  color: var(--text-title);
  font-weight: 600;
  overflow-wrap: anywhere;
}
.vacio {
  color: var(--text-dim);
}

@media (max-width: 899px) {
  .columnas {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
