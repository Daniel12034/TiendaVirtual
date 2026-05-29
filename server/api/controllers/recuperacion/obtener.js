module.exports = {
  friendlyName: 'Obtener recuperacion',
  description: 'Obtiene el detalle de un enlace de recuperacion por token.',
  inputs: {
    token: {
      type: 'string',
      required: true
    }
  },
  exits: {},
  fn: async function (inputs) {
    const ActionService = require('../../services/ActionService');
    const PasswordRecoveryService = require('../../services/PasswordRecoveryService');

    return await ActionService.handleResponse(this.res, async () => {
      return await PasswordRecoveryService.getRecoveryByToken(inputs.token);
    });
  }
};
