const { v4: uuidv4 } = require('uuid');
const {
  badRequest,
  conflict,
  forbidden,
  unauthorized
} = require('./HttpError');
const SessionService = require('./SessionService');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizeText(value) {
  return String(value || '').trim();
}

async function hashPassword(password) {
  return await sails.helpers.auth.hashPassword.with({
    password: String(password || '')
  });
}

async function comparePassword(password, hashedPassword) {
  return await sails.helpers.auth.comparePassword.with({
    password: String(password || ''),
    hashedPassword: String(hashedPassword || '')
  });
}

async function register(payload) {
  const nombre = normalizeText(payload.nombre);
  const email = normalizeEmail(payload.email);
  const password = normalizeText(payload.password);

  if (!nombre || !email || !password) {
    throw badRequest('Nombre, email y password son obligatorios');
  }

  const fecha_nacimiento_raw = payload.fecha_nacimiento;
  const fecha_nacimiento = fecha_nacimiento_raw ? new Date(fecha_nacimiento_raw) : null;

  if (fecha_nacimiento && Number.isNaN(fecha_nacimiento.getTime())) {
    throw badRequest('La fecha de nacimiento no es valida');
  }

  const existingUser = await Usuario.findOne({ email });

  if (existingUser) {
    throw conflict('Ya existe un usuario con ese email');
  }

  const passwordHash = await hashPassword(password);

  let usuario;
  let cliente;
  let carrito;

  try {
    usuario = await Usuario.create({
      id: uuidv4(),
      nombre,
      email,
      password: passwordHash,
      fecha_nacimiento,
      estado: 'ACTIVO'
    }).fetch();

    cliente = await Cliente.create({
      id: uuidv4(),
      usuario: usuario.id,
      telefono: normalizeText(payload.telefono),
      direccion: normalizeText(payload.direccion)
    }).fetch();

    carrito = await Carrito.create({
      id: uuidv4(),
      cliente: cliente.id
    }).fetch();

    cliente = await Cliente.updateOne({ id: cliente.id }).set({
      carrito: carrito.id
    });

    return {
      usuario,
      cliente,
      carrito
    };
  } catch (error) {
    if (carrito?.id) {
      await Carrito.destroyOne({ id: carrito.id });
    }

    if (cliente?.id) {
      await Cliente.destroyOne({ id: cliente.id });
    }

    if (usuario?.id) {
      await Usuario.destroyOne({ id: usuario.id });
    }

    throw error;
  }
}

async function login(payload) {
  const email = normalizeEmail(payload.email);
  const password = normalizeText(payload.password);

  if (!email || !password) {
    throw badRequest('Email y password son obligatorios');
  }

  const usuario = await Usuario.findOne({ email }).select([
    'id',
    'nombre',
    'email',
    'password',
    'fecha_nacimiento',
    'estado'
  ]);

  if (!usuario) {
    throw unauthorized('Credenciales invalidas');
  }

  if (usuario.estado !== 'ACTIVO') {
    throw forbidden('El usuario no esta activo');
  }

  const passwordValida = await comparePassword(password, usuario.password);

  if (!passwordValida) {
    throw unauthorized('Credenciales invalidas');
  }

  const sesion = await SessionService.createSession(usuario.id);
  const cliente = await Cliente.findOne({ usuario: usuario.id });

  return {
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      fecha_nacimiento: usuario.fecha_nacimiento,
      estado: usuario.estado
    },
    cliente,
    sesion
  };
}

async function logout(payload) {
  const token = payload.token ? String(payload.token).trim() : null;
  const sessionId = payload.sessionId ? String(payload.sessionId).trim() : null;

  if (!token && !sessionId) {
    throw badRequest('Debes proporcionar token o sessionId');
  }

  return await SessionService.invalidate({ token, sessionId });
}

async function changePassword(usuarioId, passwordActual, nuevaPassword) {
  if (!usuarioId || !passwordActual || !nuevaPassword) {
    throw badRequest('Faltan datos para cambiar la contrasena');
  }

  const usuario = await Usuario.findOne({ id: usuarioId }).select([
    'id',
    'password'
  ]);

  if (!usuario) {
    throw unauthorized('Usuario no encontrado');
  }

  const esValida = await comparePassword(passwordActual, usuario.password);

  if (!esValida) {
    throw unauthorized('La contrasena actual no es correcta');
  }

  return await Usuario.updateOne({ id: usuarioId }).set({
    password: await hashPassword(nuevaPassword)
  });
}

async function deactivate(usuarioId) {
  if (!usuarioId) {
    throw badRequest('El usuario es obligatorio');
  }

  return await Usuario.updateOne({ id: usuarioId }).set({
    estado: 'ELIMINADO'
  });
}

module.exports = {
  hashPassword,
  comparePassword,
  register,
  login,
  logout,
  changePassword,
  deactivate
};
