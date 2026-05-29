module.exports = {
  friendlyName: 'Eliminar producto',
  description: '',
  inputs: {
    itemId: {
      type: 'string',
      required: true
    }
  },
  exits: {},
  fn: async function (inputs) {
    const ActionService = require('../../services/ActionService');
    const CartService = require('../../services/CartService');

    return await ActionService.handleResponse(this.res, async () => {
      return await CartService.eliminarProducto(inputs.itemId);
    });
  }
};
