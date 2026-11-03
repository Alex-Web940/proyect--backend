<template>
  <div>
    <EncabezadoPagina
      titulo="Acerca de"
      icono="info"
      descripcion="Repfora · gestión de formación del SENA"
    />

    <div class="rejilla">
      <section class="tarjeta bloque aparece">
        <h2>¿Qué es Repfora?</h2>
        <p>Repfora centraliza la administración de cursos y aprendices del SENA en una sola consola.</p>
        <p>Cada registro puede activarse o desactivarse: el sistema conserva el histórico y no elimina información. Los nombres y códigos se almacenan en mayúsculas, tal como los entrega el servidor.</p>
        <p class="atajo">Pulse <kbd>Ctrl</kbd> + <kbd>K</kbd> en cualquier momento para saltar a otra vista.</p>
      </section>

      <section class="tarjeta bloque aparece">
        <h2>¿Qué puedes hacer?</h2>
        <ul>
          <li v-for="item in funciones" :key="item.nombre">
            <q-icon :name="item.icono" size="22px" color="primary" />
            <span>
              <strong>{{ item.nombre }}</strong>
              <small>{{ item.detalle }}</small>
            </span>
          </li>
        </ul>
      </section>

      <section class="tarjeta bloque aparece">
        <h2>Cómo funciona</h2>
        <ul>
          <li v-for="item in claves" :key="item.nombre">
            <q-icon :name="item.icono" size="22px" color="secondary" />
            <span>
              <strong>{{ item.nombre }}</strong>
              <small>{{ item.detalle }}</small>
            </span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import EncabezadoPagina from './EncabezadoPagina.vue'

const funciones = [
  {
    icono: 'space_dashboard',
    nombre: 'Panel',
    detalle: 'Resumen de cursos, aprendices y matrículas por curso.'
  },
  {
    icono: 'school',
    nombre: 'Cursos',
    detalle: 'Cree, edite, active o desactive programas de formación.'
  },
  {
    icono: 'groups',
    nombre: 'Aprendices',
    detalle: 'Registre estudiantes, asígneles curso y controle su estado.'
  },
  {
    icono: 'person_add',
    nombre: 'Cuentas de acceso',
    detalle: 'Los administradores crean usuarios para entrar a la plataforma.'
  }
]

const claves = [
  {
    icono: 'toggle_on',
    nombre: 'Activo e inactivo',
    detalle: 'Lo inactivo deja de ofrecerse al asignar aprendices, pero no se elimina.'
  },
  {
    icono: 'admin_panel_settings',
    nombre: 'Roles',
    detalle: 'ADMIN gestiona todo, incluido el registro de usuarios; USER accede a cursos y aprendices.'
  },
  {
    icono: 'lock_clock',
    nombre: 'Acceso',
    detalle: 'Se entra con correo y contraseña; cuando la sesión caduca se vuelve al inicio de sesión.'
  }
]
</script>

<style scoped>
.rejilla {
  grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr));
  gap: 14px;
  display: grid;
  align-items: start;
}

.bloque {
  min-width: 0;
  padding: 22px;
}

h2 {
  margin: 0 0 10px;
  font-size: 20px;
}

p {
  line-height: 1.6;
}

ul {
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
}

li {
  align-items: flex-start;
  gap: 12px;
  display: flex;
}

li span {
  flex-direction: column;
  display: flex;
}

li small {
  color: var(--text-dim);
}

kbd {
  font: inherit;
  border: 1px solid var(--border);
  background: var(--bg-elev);
  border-radius: 6px;
  padding: 1px 7px;
  font-size: 12px;
}
</style>
