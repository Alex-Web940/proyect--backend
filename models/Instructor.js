/**
 * @typedef {Object} Instructor
 * @property {string} cedula - Numero de cedula (unico).
 * @property {string} nombre - Nombre completo del instructor.
 * @property {string} email - Correo del instructor.
 * @property {Schema.Types.ObjectId} especialidad - Curso que dicta (relacion con Curso).
 * @property {number} status - 0 = activo, 1 = inactivo.
 * @property {Date} createdAt - Fecha de creacion.
 * @property {Date} updatedAt - Fecha de ultima actualizacion.
 */
import { Schema, model } from "mongoose";

const InstructorSchema = new Schema(
  {
    cedula: {
      type: String,
      required: true,
    },
    nombre: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    especialidad: {
      type: Schema.Types.ObjectId,
      ref: "Curso", // relacion: permite usar .populate("especialidad")
      required: true,
    },
    status: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Instructor", InstructorSchema);
