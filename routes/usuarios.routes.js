import { Router } from "express";
import { usuarioCtrl } from "../controller/usuario.controller.js";
import { usuarioVali } from "../validations/usuario.validation.js";
import { validateJWT } from "../middlewares/validateJWT.js";

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

// El REGISTRO es interno: crear cuentas es una tarea de alguien que ya entro,
// no algo que cualquiera pueda hacer desde afuera. Por eso lleva validateJWT
// adelante, igual que las rutas de cursos y aprendices.
//
// ¿Y el primer usuario? Lo crea el seed (npm run seed), que escribe
// directamente en la base de datos sin pasar por la API.
//
// POST /api/usuarios/register -> crear cuenta (requiere token)
routerUsuario.post(
  "/register",
  validateJWT,
  validateRegisterUsuario,
  registerUsuario
);

// Rutas de gestion de usuarios: todas requieren token, igual que cursos y
// aprendices. El login de arriba es la unica ruta publica.

// GET /api/usuarios            -> lista todos (opcional ?status=0|1)
routerUsuario.get("/", validateJWT, getUsuarios);

// GET /api/usuarios/:id        -> uno por id
routerUsuario.get("/:id", validateJWT, validateExistUsuario, getUsuarioId);

// PUT /api/usuarios/update/:id -> actualizar
routerUsuario.put("/update/:id", validateJWT, validateUpdateUsuario, updateUsuario);

// PUT /api/usuarios/active/:id -> activar
routerUsuario.put("/active/:id", validateJWT, validateExistUsuario, activeUsuario);

// PUT /api/usuarios/inactive/:id -> desactivar
routerUsuario.put("/inactive/:id", validateJWT, validateExistUsuario, inactiveUsuario);

export { routerUsuario };
