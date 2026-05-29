module.exports = {
  friendlyName: 'Obtener carrito',
  description: 'Obtiene el carrito por id con sus items.',
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
      return await CartService.obtenerCarrito({ carritoId: inputs.carritoId });
    });
  }
};
