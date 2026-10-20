/**
 * Funciones de apoyo para las validaciones de instructor.
 * Un helper solo consulta la base de datos y lanza un Error si algo no cumple.
 * @namespace instructorHelper
 */
import Instructor from "../models/Instructor.js";

const instructorHelper = {};

/**
 * Valida que exista un instructor con ese id.
 * @param {string} id
 * @throws {Error} Si el instructor no existe.
 */
instructorHelper.validateExistInstructorById = async (id) => {
  const instructor = await Instructor.findById(id);
  if (!instructor) {
    throw new Error("El instructor no existe");
  }
};

/**
 * Valida que la cedula no este repetida.
 * @param {string} cedula
 * @param {string} [id=null] - Id a excluir (se usa al actualizar).
 * @throws {Error} Si la cedula ya esta registrada.
 */
instructorHelper.validateExistCedula = async (cedula, id = null) => {
  const instructor = await Instructor.findOne({ cedula: cedula.toUpperCase().trim() });
  if (instructor) {
    if (!id || instructor._id.toString() !== id.toString()) {
      throw new Error("La cedula del instructor ya esta registrada");
    }
  }
};

export { instructorHelper };
