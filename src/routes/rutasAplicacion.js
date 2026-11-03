import { createRouter, createWebHashHistory } from 'vue-router'
import { useSesionStore } from '../stores/sesion.store.js'
import { useGeneralStore } from '../stores/general.store.js'

// Todas las vistas se cargan bajo demanda (import dinámico).
const LoginView = () => import('../views/LoginView.vue')
const AdminLayout = () => import('../views/AdminLayout.vue')
const DashboardView = () => import('../views/DashboardView.vue')
const CursosView = () => import('../views/CursosView.vue')
const AprendicesView = () => import('../views/AprendicesView.vue')
const RegistroView = () => import('../views/RegistroView.vue')
const AcercaView = () => import('../views/AcercaView.vue')
const ErrorNoEncontradoView = () => import('../views/ErrorNoEncontradoView.vue')

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { titulo: 'Iniciar sesión', soloInvitados: true }
  },
  {
    path: '/',
    component: AdminLayout,
    meta: { requiereAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardView,
        meta: { titulo: 'Inicio', menu: { icono: 'space_dashboard', descripcion: 'Resumen general de la plataforma' } }
      },
      {
        path: 'cursos',
        name: 'cursos',
        component: CursosView,
        meta: { titulo: 'Cursos', menu: { icono: 'school', descripcion: 'Programas de formación' } }
      },
      {
        path: 'aprendices',
        name: 'aprendices',
        component: AprendicesView,
        meta: { titulo: 'Aprendices', menu: { icono: 'groups', descripcion: 'Estudiantes matriculados' } }
      },
      {
        path: 'registro',
        name: 'registro',
        component: RegistroView,
        meta: { titulo: 'Registro de usuarios', requiereAdmin: true, menu: { icono: 'person_add', descripcion: 'Crear cuentas de acceso' } }
      },
      {
        path: 'acerca',
        name: 'acerca',
        component: AcercaView,
        meta: { titulo: 'Acerca de', menu: { icono: 'info', descripcion: 'Información de Repfora' } }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'no-encontrado',
    component: ErrorNoEncontradoView,
    meta: { titulo: 'Página no encontrada' }
  }
]

// Se recibe el pinia para poder leer la sesión fuera del contexto de un setup().
export function crearRouter(pinia) {
  const router = createRouter({ routes, history: createWebHashHistory() })

  router.beforeEach((to) => {
    const sesionStore = useSesionStore(pinia)

    if (to.matched.some((registro) => registro.meta.requiereAuth) && !sesionStore.estaAutenticado) {
      return { name: 'login' }
    }

    if (to.meta.soloInvitados && sesionStore.estaAutenticado) {
      return { name: 'dashboard' }
    }

    if (to.meta.requiereAdmin && !sesionStore.esAdmin) {
      useGeneralStore(pinia).aviso('No tiene permisos para acceder a esa sección.')
      return { name: 'dashboard' }
    }
  })

  router.afterEach((to) => {
    document.title = to.meta.titulo ? `${to.meta.titulo} · Repfora` : 'Repfora'
  })

  return router
}
