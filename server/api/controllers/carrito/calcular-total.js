module.exports = {
  friendlyName: 'Calcular total',
  description: '',
  inputs: {
    carritoId: {
      type: 'string',
      required: true
    }
  },
  exits: {},
  fn: async function (inputs) {
    const ActionService = require('../../services/ActionService');
    const CartService = require('../../services/CartService');

    return await ActionService.handleResponse(this.res, async () => {
      return {
        carritoId: inputs.carritoId,
        total: await CartService.calcularTotal(inputs.carritoId)
      };
    });
  }
};
