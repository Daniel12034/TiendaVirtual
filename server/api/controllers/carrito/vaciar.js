module.exports = {
  friendlyName: 'Vaciar',
  description: 'Vaciar carrito.',
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
      return await CartService.vaciarCarrito(inputs.carritoId);
    });
  }
};
