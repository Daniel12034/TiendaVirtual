module.exports = {
  friendlyName: 'Restablecer contrasena',
  description: 'Actualiza la contrasena usando un token de recuperacion.',
  inputs: {
    token: {
      type: 'string',
      required: true
    },
    password: {
      type: 'string',
      required: true
    },
    confirmPassword: {
      type: 'string',
      required: true
    }
  },
  exits: {},
  fn: async function (inputs) {
    const ActionService = require('../../services/ActionService');
    const PasswordRecoveryService = require('../../services/PasswordRecoveryService');

    return await ActionService.handleResponse(this.res, async () => {
      return await PasswordRecoveryService.resetPassword(
        inputs.token,
        inputs.password,
        inputs.confirmPassword
      );
    });
  }
};
