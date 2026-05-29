module.exports = {
  friendlyName: 'Logout',
  description: 'Logout usuario.',
  inputs: {
    token: {
      type: 'string',
      required: false
    },
    sessionId: {
      type: 'string',
      required: false
    }
  },
  exits: {},
  fn: async function (inputs) {
    const ActionService = require('../../services/ActionService');
    const AuthService = require('../../services/AuthService');

    return await ActionService.handleResponse(this.res, async () => {
      return await AuthService.logout(inputs);
    });
  }
};
