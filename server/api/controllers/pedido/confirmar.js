module.exports = {
  friendlyName: 'Confirmar',
  description: 'Confirmar pedido.',
  inputs: {
    pedidoId: {
      type: 'string',
      required: true
    }
  },
  exits: {},
  fn: async function (inputs) {
    const ActionService = require('../../services/ActionService');
    const PedidoService = require('../../services/PedidoService');

    return await ActionService.handleResponse(this.res, async () => {
      return await PedidoService.confirmarPedido(inputs.pedidoId);
    });
  }
};
