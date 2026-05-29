const dayjs = require('dayjs');
const { createCrudController } = require('../services/CrudControllerFactory');

module.exports = createCrudController(Sesion, {
  populate: ['usuario'],
  beforeCreate: async (payload) => {
    if (!payload.fecha_inicio) {
      payload.fecha_inicio = new Date();
    }

    if (!payload.fecha_expiracion) {
      const durationHours = Number(sails.config.custom.sessionDurationHours || 168);
      payload.fecha_expiracion = dayjs(payload.fecha_inicio).add(durationHours, 'hour').toDate();
    }

    if (!payload.estado) {
      payload.estado = 'ACTIVA';
    }

    return payload;
  }
});
