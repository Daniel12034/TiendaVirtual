module.exports = {
  friendlyName: 'Register',
  description: 'Register usuario.',
  inputs: {
    nombre: {
      type: 'string',
      required: true
    },
    email: {
      type: 'string',
      required: true
    },
    password: {
      type: 'string',
      required: true
    },
    fecha_nacimiento: {
      type: 'ref',
      required: false
    },
    telefono: {
      type: 'string',
      required: false
    },
    direccion: {
      type: 'string',
      required: false
    }
  },
  exits: {},
  fn: async function (inputs) {
    const ActionService = require('../../services/ActionService');
    const AuthService = require('../../services/AuthService');

    return await ActionService.handleResponse(this.res, async () => {
      return await AuthService.register(inputs);
    });
  }
};
