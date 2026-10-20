/**
 * @fileoverview Cadenas de validacion para las rutas de instructor.
 * Patron usado en cada campo:
 *   check(campo).notEmpty().bail().<formato>().bail().custom(<consulta BD>)
 * @module validations/instructor.validation
 */
import { check } from "express-validator";
import { validateFields } from "../middlewares/validateFields.js";
import { instructorHelper } from "../helpers/instructor.helper.js";
import { cursoHelper } from "../helpers/curso.helper.js";

const { validateExistInstructorById, validateExistCedula } = instructorHelper;
const { validateExistCursoById } = cursoHelper;

const instructorVali = {};

// Valida los datos para registrar un instructor.
instructorVali.validateRegisterInstructor = [
  check("cedula", "La cedula es obligatoria")
    .notEmpty()
    .bail()
    .custom(async (cedula) => {
      await validateExistCedula(cedula);
    }),
  check("nombre", "El nombre es obligatorio").notEmpty(),
  check("email", "El email es obligatorio")
    .notEmpty()
    .bail()
    .isEmail()
    .withMessage("El email no tiene un formato valido"),
  check("especialidad", "La especialidad es obligatoria")
    .notEmpty()
    .bail()
    .isMongoId()
    .withMessage("La especialidad no es un id valido")
    .bail()
    .custom(async (id) => {
      await validateExistCursoById(id);
    }),
  validateFields,
];

// Valida los datos para actualizar un instructor.
instructorVali.validateUpdateInstructor = [
  check("id", "El id no es valido")
    .isMongoId()
    .bail()
    .custom(async (id) => {
      await validateExistInstructorById(id);
    }),
  check("cedula", "La cedula es obligatoria")
    .notEmpty()
    .bail()
    .custom(async (cedula, { req }) => {
      await validateExistCedula(cedula, req.params.id);
    }),
  check("nombre", "El nombre es obligatorio").notEmpty(),
  check("email", "El email es obligatorio")
    .notEmpty()
    .bail()
    .isEmail()
    .withMessage("El email no tiene un formato valido"),
  check("especialidad", "La especialidad es obligatoria")
    .notEmpty()
    .bail()
    .isMongoId()
    .withMessage("La especialidad no es un id valido")
    .bail()
    .custom(async (id) => {
      await validateExistCursoById(id);
    }),
  validateFields,
];

// Valida que el id enviado por la url corresponda a un instructor existente.
instructorVali.validateExistInstructor = [
  check("id", "El id no es valido")
    .isMongoId()
    .bail()
    .custom(async (id) => {
      await validateExistInstructorById(id);
    }),
  validateFields,
];

export { instructorVali };
