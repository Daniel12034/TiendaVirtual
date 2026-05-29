const dayjs = require('dayjs');
const { v4: uuidv4 } = require('uuid');
const { badRequest, notFound, unauthorized } = require('./HttpError');

function buildExpirationDate() {
  const durationHours = Number(sails.config.custom.sessionDurationHours || 168);
  return dayjs().add(durationHours, 'hour').toDate();
}

async function createSession(usuarioId) {
  if (!usuarioId) {
    throw badRequest('El usuario es obligatorio para crear una sesion');
  }

  const token = await sails.helpers.jwt.generateToken.with({
    payload: {
      sub: usuarioId,
      typ: 'session'
    }
  });

  return await Sesion.create({
    id: uuidv4(),
    token,
    fecha_inicio: new Date(),
    fecha_expiracion: buildExpirationDate(),
    estado: 'ACTIVA',
    usuario: usuarioId
  }).fetch();
}

async function getByTokenOrId({ token, sessionId }) {
  if (!token && !sessionId) {
    throw badRequest('Debes proporcionar un token o sessionId');
  }

  const criteria = sessionId ? { id: sessionId } : { token };
  const sesion = await Sesion.findOne(criteria);

  if (!sesion) {
    throw notFound('Sesion no encontrada');
  }

  return sesion;
}

async function isValid(token) {
  if (!token) {
    return false;
  }

  const sesion = await Sesion.findOne({ token });

  if (!sesion) {
    return false;
  }

  if (sesion.estado !== 'ACTIVA') {
    return false;
  }

  const vigente = new Date(sesion.fecha_expiracion) > new Date();

  if (!vigente) {
    await Sesion.updateOne({ id: sesion.id }).set({ estado: 'EXPIRADA' });
  }

  return vigente;
}

async function refreshSession(sessionId) {
  const sesion = await Sesion.findOne({ id: sessionId });

  if (!sesion) {
    throw notFound('Sesion no encontrada');
  }

  if (sesion.estado !== 'ACTIVA') {
    throw unauthorized('La sesion no esta activa');
  }

  return await Sesion.updateOne({ id: sessionId }).set({
    fecha_expiracion: buildExpirationDate()
  });
}

async function invalidate({ token, sessionId }) {
  const sesion = await getByTokenOrId({ token, sessionId });

  return await Sesion.updateOne({ id: sesion.id }).set({
    estado: 'INVALIDA',
    fecha_expiracion: new Date()
  });
}

module.exports = {
  createSession,
  getByTokenOrId,
  isValid,
  refreshSession,
  invalidate
};
