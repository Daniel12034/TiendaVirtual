const jwt = require('jsonwebtoken');

module.exports = {

  friendlyName: 'Verify JWT',

  inputs: {
    token: {
      type: 'string',
      required: true
    }
  },

  fn: async function (inputs) {

    return jwt.verify(
      inputs.token,
      sails.config.custom.jwtSecret
    );

  }

};