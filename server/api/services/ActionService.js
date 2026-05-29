const { HttpError } = require('./HttpError');

function serializeError(error) {
  return {
    error: error.message || 'Error',
    details: error.details ?? undefined
  };
}

async function handleResponse(res, operation) {
  try {
    const result = await operation();

    if (res && typeof res.json === 'function') {
      return res.json(result);
    }

    return result;
  } catch (error) {
    const statusCode = error.statusCode || (error instanceof HttpError ? error.statusCode : 500);

    if (res && typeof res.status === 'function') {
      return res.status(statusCode).json(serializeError(error));
    }

    throw error;
  }
}

module.exports = {
  handleResponse
};
