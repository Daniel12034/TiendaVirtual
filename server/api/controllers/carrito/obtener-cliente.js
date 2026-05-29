module.exports = {
  friendlyName: 'Obtener carrito del cliente',
  description: 'Obtiene o crea el carrito de un cliente.',
  inputs: {
    clienteId: {
      type: 'string',
      required: true
    }
  },
  exits: {},
  fn: async function (inputs) {
    const ActionService = require('../../services/ActionService');
    const CartService = require('../../services/CartService');

    return await ActionService.handleResponse(this.res, async () => {
      return await CartService.obtenerCarritoCliente(inputs.clienteId);
    });
  }
};
