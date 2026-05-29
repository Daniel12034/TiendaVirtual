module.exports = {
  friendlyName: 'Agregar producto',
  description: '',
  inputs: {
    clienteId: {
      type: 'string',
      required: false
    },
    carritoId: {
      type: 'string',
      required: false
    },
    productoId: {
      type: 'string',
      required: true
    },
    varianteId: {
      type: 'string',
      required: false
    },
    cantidad: {
      type: 'number',
      required: false,
      defaultsTo: 1
    }
  },
  exits: {},
  fn: async function (inputs) {
    const ActionService = require('../../services/ActionService');
    const CartService = require('../../services/CartService');

    return await ActionService.handleResponse(this.res, async () => {
      return await CartService.agregarProducto(inputs);
    });
  }
};
