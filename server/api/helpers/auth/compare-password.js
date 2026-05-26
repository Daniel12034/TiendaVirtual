const bcrypt = require('bcryptjs');

module.exports = {

  friendlyName: 'Compare Password',

  description: 'Compara contraseña',

  inputs: {
    password: {
      type: 'string',
      required: true
    },

    hashedPassword: {
      type: 'string',
      required: true
    }
  },

  exits: {},

  fn: async function (inputs) {

    return await bcrypt.compare(
      inputs.password,
      inputs.hashedPassword
    );

  }

};