import { Router } from "express";
import { instructorCtrl } from "../controller/instructor.controller.js";
import { instructorVali } from "../validations/instructor.validation.js";

const {
  validateRegisterInstructor,
  validateUpdateInstructor,
  validateExistInstructor,
} = instructorVali;

const {
  registerInstructor,
  getInstructores,
  getInstructorId,
  getInstructoresByCurso,
  updateInstructor,
  activeInstructor,
  inactiveInstructor,
} = instructorCtrl;

const routerInstructor = Router();

// GET /api/instructores                 -> lista todos
routerInstructor.get("/", getInstructores);

// OJO: esta ruta va ANTES de "/:id", de lo contrario Express interpretaria
// la palabra "curso" como si fuera un id.
// GET /api/instructores/curso/:curso    -> instructores de un curso
routerInstructor.get("/curso/:curso", getInstructoresByCurso);

// GET /api/instructores/:id             -> uno por id
routerInstructor.get("/:id", validateExistInstructor, getInstructorId);

// POST /api/instructores/register       -> crear
routerInstructor.post("/register", validateRegisterInstructor, registerInstructor);

// PUT /api/instructores/update/:id      -> actualizar
routerInstructor.put("/update/:id", validateUpdateInstructor, updateInstructor);

// PUT /api/instructores/active/:id      -> activar
routerInstructor.put("/active/:id", validateExistInstructor, activeInstructor);

// PUT /api/instructores/inactive/:id    -> desactivar
routerInstructor.put("/inactive/:id", validateExistInstructor, inactiveInstructor);

export { routerInstructor };
