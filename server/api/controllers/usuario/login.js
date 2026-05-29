module.exports = {
  friendlyName: 'Login',
  description: 'Login usuario.',
  inputs: {
    email: {
      type: 'string',
      required: true
    },
    password: {
      type: 'string',
      required: true
    }
  },
  exits: {},
  fn: async function (inputs) {
    const ActionService = require('../../services/ActionService');
    const AuthService = require('../../services/AuthService');

    return await ActionService.handleResponse(this.res, async () => {
      return await AuthService.login(inputs);
    });
  }
};
