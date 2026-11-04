import { Router } from "express";
import { usuarioCtrl } from "../controller/usuario.controller.js";
import { usuarioVali } from "../validations/usuario.validation.js";
import { validateJWT } from "../middlewares/validateJWT.js";
import { validateAdmin } from "../middlewares/validateAdmin.js";

const { validateRegisterUsuario, validateLogin, validateUpdateUsuario, validateExistUsuario } =
  usuarioVali;
const {
  registerUsuario,
  loginUsuario,
  getUsuarios,
  getUsuarioId,
  updateUsuario,
  activeUsuario,
  inactiveUsuario,
} = usuarioCtrl;

const routerUsuario = Router();

// El LOGIN es la unica ruta publica de todo el backend: es la puerta por la que
// se consigue el token. Si tambien pidiera token, nadie podria entrar nunca
// (el clasico problema del huevo y la gallina).
//
// POST /api/usuarios/login    -> iniciar sesion y recibir el token
routerUsuario.post("/login", validateLogin, loginUsuario);

// El REGISTRO es interno: crear cuentas es una tarea de administracion, no
// algo que cualquiera pueda hacer desde afuera. Por eso lleva validateJWT
// (autenticado) y validateAdmin (con rol ADMIN).
//
// ¿Y el primer usuario? Lo crea el seed (npm run seed), que escribe
// directamente en la base de datos sin pasar por la API.
//
// POST /api/usuarios/register -> crear cuenta (requiere token ADMIN)
routerUsuario.post(
  "/register",
  validateJWT,
  validateAdmin,
  validateRegisterUsuario,
  registerUsuario
);

// Rutas de gestion de usuarios: todas requieren token ADMIN, igual que el
// registro. El login de arriba es la unica ruta publica.
//
// Nota: validateAdmin va DESPUES de validateJWT porque necesita req.usuario.
// Asi un USER autenticado recibe 403 y no puede listar, editar ni cambiarse
// el rol a si mismo.

// GET /api/usuarios            -> lista todos (opcional ?status=0|1)
routerUsuario.get("/", validateJWT, validateAdmin, getUsuarios);

// GET /api/usuarios/:id        -> uno por id
routerUsuario.get(
  "/:id",
  validateJWT,
  validateAdmin,
  validateExistUsuario,
  getUsuarioId
);

// PUT /api/usuarios/update/:id -> actualizar
routerUsuario.put(
  "/update/:id",
  validateJWT,
  validateAdmin,
  validateUpdateUsuario,
  updateUsuario
);

// PUT /api/usuarios/active/:id -> activar
routerUsuario.put(
  "/active/:id",
  validateJWT,
  validateAdmin,
  validateExistUsuario,
  activeUsuario
);

// PUT /api/usuarios/inactive/:id -> desactivar
routerUsuario.put(
  "/inactive/:id",
  validateJWT,
  validateAdmin,
  validateExistUsuario,
  inactiveUsuario
);

export { routerUsuario };
