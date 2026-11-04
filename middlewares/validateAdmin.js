/**
 * @fileoverview Middleware que restringe una ruta a los usuarios con rol ADMIN.
 *
 * Se pone SIEMPRE despues de validateJWT, porque necesita que ese middleware
 * haya dejado el usuario autenticado en req.usuario:
 *
 *   router.get("/", validateJWT, validateAdmin, getUsuarios);
 *
 * Codigos de estado:
 * - 401 (Unauthorized) = "no se quien eres" -> lo devuelve validateJWT.
 * - 403 (Forbidden)    = "se quien eres, pero no tienes permiso" -> este.
 *
 * @module middlewares/validateAdmin
 */

/**
 * Comprueba que el usuario autenticado tenga rol ADMIN.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const validateAdmin = (req, res, next) => {
  // req.usuario lo deja validateJWT. Si por error se usa este middleware sin
  // el otro, no habra usuario y se responde 403 (nunca se deja pasar).
  if (req.usuario?.rol !== "ADMIN") {
    return res
      .status(403)
      .json({ msg: "No tiene permisos para realizar esta operacion" });
  }

  next();
};

export { validateAdmin };
