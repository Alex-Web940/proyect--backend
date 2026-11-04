import bcrypt from "bcryptjs";

import Usuario from "../models/Usuario.js";
import { generarJWT } from "../helpers/generarJWT.js";

const usuarioCtrl = {};

// Listar usuarios (opcionalmente filtrados por status: /api/usuarios?status=0).
// El modelo ya elimina el password al serializar con toJSON.
usuarioCtrl.getUsuarios = async (req, res) => {
  const { status } = req.query;
  try {
    const usuarios = await Usuario.find(status ? { status } : {}).sort({
      createdAt: -1,
    });
    res.json(usuarios);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

// Obtener un usuario por id.
usuarioCtrl.getUsuarioId = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await Usuario.findById(id);
    res.json(usuario);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

// Actualizar un usuario. La contraseña es opcional: si no viene, se conserva
// la actual; si viene, se vuelve a hashear antes de guardar.
usuarioCtrl.updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, rol, password } = req.body;
  try {
    const datos = {
      nombre: nombre.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
      rol,
    };

    if (password) {
      const salt = bcrypt.genSaltSync(10);
      datos.password = bcrypt.hashSync(password, salt);
    }

    await Usuario.findByIdAndUpdate(id, datos);
    res.json({ msg: "Usuario actualizado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

// Activar usuario (status 0). No se borra el registro, solo cambia el estado.
usuarioCtrl.activeUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    await Usuario.findByIdAndUpdate(id, { status: 0 });
    res.json({ msg: "Usuario activado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

// Desactivar usuario (status 1).
usuarioCtrl.inactiveUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    await Usuario.findByIdAndUpdate(id, { status: 1 });
    res.json({ msg: "Usuario desactivado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

/**
 * Registrar un nuevo usuario.
 *
 * La contraseña NUNCA se guarda tal cual. Se le aplica un hash con bcrypt:
 *   "123456"  ->  "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
 *
 * El hash va en un solo sentido: de la contraseña se saca el hash, pero del
 * hash no se puede volver a la contraseña. Por eso al iniciar sesion no se
 * "desencripta" nada: se hashea lo que escribio el usuario y se comparan los
 * dos hashes (eso hace bcrypt.compareSync).
 *
 * El "salt" es un texto aleatorio que se mezcla antes de hashear, para que dos
 * personas con la misma contraseña no terminen con el mismo hash.
 */
usuarioCtrl.registerUsuario = async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
    const newUsuario = new Usuario({
      nombre: nombre.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    // Hashear antes de guardar
    const salt = bcrypt.genSaltSync(10);
    newUsuario.password = bcrypt.hashSync(password, salt);

    await newUsuario.save();
    res.json({ msg: "Usuario registrado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

/**
 * Iniciar sesion.
 *
 * Responde { usuario, token }. El "usuario" sale sin password gracias al
 * metodo toJSON del modelo.
 *
 * Fijense que los tres errores posibles (email que no existe, usuario inactivo,
 * contraseña equivocada) responden casi lo mismo. Es a proposito: si dijeramos
 * "ese email no existe", le estariamos confirmando a un atacante cuales correos
 * SI estan registrados.
 */
usuarioCtrl.loginUsuario = async (req, res) => {
  const { email, password } = req.body;
  try {
    const usuario = await Usuario.findOne({ email: email.toLowerCase().trim() });

    if (!usuario) {
      return res.status(400).json({ msg: "Usuario o contraseña incorrectos" });
    }

    if (usuario.status !== 0) {
      return res.status(400).json({ msg: "El usuario esta inactivo" });
    }

    // Compara la contraseña escrita contra el hash guardado.
    const passwordValido = bcrypt.compareSync(password, usuario.password);

    if (!passwordValido) {
      return res.status(400).json({ msg: "Usuario o contraseña incorrectos" });
    }

    // Todo bien: se genera el token con el id del usuario adentro.
    const token = await generarJWT(usuario._id);

    res.json({ usuario, token });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

export { usuarioCtrl };
