const jwt = require('jsonwebtoken');

module.exports = {

  friendlyName: 'Generate JWT',

  inputs: {
    payload: {
      type: 'ref',
      required: true
    }
  },

  fn: async function (inputs) {

    return jwt.sign(
      inputs.payload,
      sails.config.custom.jwtSecret,
      {
        expiresIn: '7d'
      }
    );

  }

};