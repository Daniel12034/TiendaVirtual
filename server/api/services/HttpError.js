class HttpError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

const badRequest = (message, details = null) => new HttpError(400, message, details);
const unauthorized = (message = 'No autorizado', details = null) =>
  new HttpError(401, message, details);
const forbidden = (message = 'Acceso denegado', details = null) =>
  new HttpError(403, message, details);
const notFound = (message = 'Registro no encontrado', details = null) =>
  new HttpError(404, message, details);
const conflict = (message = 'Conflicto de datos', details = null) =>
  new HttpError(409, message, details);
const internal = (message = 'Error interno del servidor', details = null) =>
  new HttpError(500, message, details);

module.exports = {
  HttpError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  internal
};
