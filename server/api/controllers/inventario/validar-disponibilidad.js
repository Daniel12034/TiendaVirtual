module.exports = {
  friendlyName: 'Validar disponibilidad',
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
      return {
        productoId: inputs.productoId,
        varianteId: inputs.varianteId,
        disponible: await InventoryService.validarDisponibilidad(
          {
            productoId: inputs.productoId,
            varianteId: inputs.varianteId
          },
          inputs.cantidad
        )
      };
    });
  }
};
