const dayjs = require('dayjs');
const { v4: uuidv4 } = require('uuid');
const { badRequest, notFound, conflict } = require('./HttpError');
const AuthService = require('./AuthService');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function buildExpirationDate() {
  const durationHours = Number(sails.config.custom.sessionDurationHours || 168);
  return dayjs().add(durationHours, 'hour').toDate();
}

function resolveStatus(request) {
  if (request.fecha_consumo || request.estado === 'USADA') {
    return 'USADA';
  }

  if (request.estado === 'EXPIRADA' || new Date(request.fecha_expiracion) <= new Date()) {
    return 'EXPIRADA';
  }

  return 'PENDIENTE';
}

async function requestRecovery(email) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    throw badRequest('El email es obligatorio');
  }

  const usuario = await Usuario.findOne({ email: normalizedEmail });

  if (!usuario) {
    return {
      requested: true,
      recovery: null
    };
  }

  const recovery = await RecuperacionContrasena.create({
    id: uuidv4(),
    email: normalizedEmail,
    token: uuidv4(),
    fecha_solicitud: new Date(),
    fecha_expiracion: buildExpirationDate(),
    fecha_consumo: null,
    estado: 'PENDIENTE',
    usuario: usuario.id
  }).fetch();

  return {
    requested: true,
    recovery: {
      ...recovery,
      status: resolveStatus(recovery)
    }
  };
}

async function listRecoveriesByEmail(email) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return [];
  }

  const recoveries = await RecuperacionContrasena.find({
    email: normalizedEmail
  }).sort('fecha_solicitud DESC');

  return recoveries.map((recovery) => ({
    ...recovery,
    status: resolveStatus(recovery)
  }));
}

async function getRecoveryByToken(token) {
  const normalizedToken = String(token || '').trim();

  if (!normalizedToken) {
    throw badRequest('El token es obligatorio');
  }

  const recovery = await RecuperacionContrasena.findOne({ token: normalizedToken });

  if (!recovery) {
    throw notFound('Enlace de recuperacion no encontrado');
  }

  const status = resolveStatus(recovery);

  if (status !== recovery.estado) {
    await RecuperacionContrasena.updateOne({ id: recovery.id }).set({
      estado: status
    });
  }

  return {
    ...recovery,
    status
  };
}

async function resetPassword(token, password, confirmPassword) {
  const recovery = await getRecoveryByToken(token);

  if (recovery.status !== 'PENDIENTE') {
    throw conflict('El enlace de recuperacion ya no esta disponible');
  }

  const nuevaPassword = String(password || '');
  const confirmarPassword = String(confirmPassword || '');

  if (nuevaPassword.length < 8) {
    throw badRequest('La contrasena debe tener al menos 8 caracteres');
  }

  if (nuevaPassword !== confirmarPassword) {
    throw badRequest('Las contrasenas no coinciden');
  }

  const usuario = await Usuario.findOne({ id: recovery.usuario });

  if (!usuario) {
    throw notFound('Usuario no encontrado');
  }

  const hashedPassword = await AuthService.hashPassword(nuevaPassword);

  await Usuario.updateOne({ id: usuario.id }).set({
    password: hashedPassword
  });

  return await RecuperacionContrasena.updateOne({ id: recovery.id }).set({
    fecha_consumo: new Date(),
    estado: 'USADA'
  });
}

module.exports = {
  requestRecovery,
  listRecoveriesByEmail,
  getRecoveryByToken,
  resetPassword
};
