module.exports = {
  friendlyName: 'Solicitar recuperacion',
  description: 'Genera un enlace de recuperacion de contrasena.',
  inputs: {
    email: {
      type: 'string',
      required: true
    }
  },
  exits: {},
  fn: async function (inputs) {
    const ActionService = require('../../services/ActionService');
    const PasswordRecoveryService = require('../../services/PasswordRecoveryService');

    return await ActionService.handleResponse(this.res, async () => {
      return await PasswordRecoveryService.requestRecovery(inputs.email);
    });
  }
};
