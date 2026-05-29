module.exports = {
  friendlyName: 'Descontar stock',
  description: '',
  inputs: {
    productoId: {
      type: 'string',
      required: false
    },
    varianteId: {
      type: 'string',
      required: false
    },
    cantidad: {
      type: 'number',
      required: true
    }
  },
  exits: {},
  fn: async function (inputs) {
    const ActionService = require('../../services/ActionService');
    const InventoryService = require('../../services/InventoryService');

    return await ActionService.handleResponse(this.res, async () => {
      return await InventoryService.descontarStock(
        {
          productoId: inputs.productoId,
          varianteId: inputs.varianteId
        },
        inputs.cantidad
      );
    });
  }
};
