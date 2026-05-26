const bcrypt = require('bcryptjs');

module.exports = {

  friendlyName: 'Hash Password',

  description: 'Encripta una contraseña',

  inputs: {
    password: {
      type: 'string',
      required: true
    }
  },

  exits: {},

  fn: async function (inputs) {

    return await bcrypt.hash(inputs.password, 10);

  }

};