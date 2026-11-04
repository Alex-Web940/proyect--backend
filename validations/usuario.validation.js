/**
 * @fileoverview Cadenas de validacion para las rutas de usuario.
 * Mismo patron que curso.validation.js: todas las reglas de un campo van
 * encadenadas y separadas por .bail(). Ver la explicacion completa alla.
 * @module validations/usuario.validation
 */
import { check } from "express-validator";
import { validateFields } from "../middlewares/validateFields.js";
import { usuarioHelper } from "../helpers/usuario.helper.js";

const { validateExistEmail, validateExistUsuarioById } = usuarioHelper;

const usuarioVali = {};

/**
 * Valida los datos para registrar un usuario.
 */
usuarioVali.validateRegisterUsuario = [
  check("nombre", "El nombre es obligatorio").notEmpty(),
  check("email", "El email es obligatorio")
    .notEmpty()
    .bail()
    .isEmail()
    .withMessage("El email no es valido")
    .bail()
    .custom(async (email) => {
      await validateExistEmail(email);
    }),
  check("password", "La contraseña es obligatoria")
    .notEmpty()
    .bail()
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
  validateFields,
];

/**
 * Valida los datos para iniciar sesion.
 *
 * Ojo: aqui NO se consulta la base de datos. Si el email existe o no, y si la
 * contraseña coincide, se resuelve en el controlador y con un mensaje generico.
 * Decir "ese email no existe" le confirmaria a un atacante que correos SI estan
 * registrados.
 */
usuarioVali.validateLogin = [
  check("email", "El email es obligatorio")
    .notEmpty()
    .bail()
    .isEmail()
    .withMessage("El email no es valido"),
  check("password", "La contraseña es obligatoria").notEmpty(),
  validateFields,
];

/**
 * Valida los datos para actualizar un usuario.
 *
 * - El email se valida como unico pero excluyendo al propio usuario, para que
 *   guardar sin cambiar el correo no falle.
 * - La contraseña es opcional: si no viene, se conserva la actual.
 */
usuarioVali.validateUpdateUsuario = [
  check("id", "El id no es valido")
    .isMongoId()
    .bail()
    .custom(async (id) => {
      await validateExistUsuarioById(id);
    }),
  check("nombre", "El nombre es obligatorio").notEmpty(),
  check("email", "El email es obligatorio")
    .notEmpty()
    .bail()
    .isEmail()
    .withMessage("El email no es valido")
    .bail()
    .custom(async (email, { req }) => {
      await validateExistEmail(email, req.params.id);
    }),
  check("rol", "El rol es obligatorio")
    .notEmpty()
    .bail()
    .isIn(["ADMIN", "USER"])
    .withMessage("El rol no es valido"),
  check("password")
    .optional({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
  validateFields,
];

/**
 * Valida que el id enviado por la url corresponda a un usuario existente.
 */
usuarioVali.validateExistUsuario = [
  check("id", "El id no es valido")
    .isMongoId()
    .bail()
    .custom(async (id) => {
      await validateExistUsuarioById(id);
    }),
  validateFields,
];

export { usuarioVali };
