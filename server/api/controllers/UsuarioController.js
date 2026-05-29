const { createCrudController } = require('../services/CrudControllerFactory');
const AuthService = require('../services/AuthService');

module.exports = createCrudController(Usuario, {
  populate: ['sesiones'],
  beforeCreate: async (payload) => {
    if (payload.password) {
      payload.password = await AuthService.hashPassword(payload.password);
    }

    if (!payload.estado) {
      payload.estado = 'ACTIVO';
    }

    return payload;
  },
  beforeUpdate: async (payload) => {
    if (payload.password) {
      payload.password = await AuthService.hashPassword(payload.password);
    }

    return payload;
  }
});

