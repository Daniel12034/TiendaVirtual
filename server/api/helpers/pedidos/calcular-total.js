module.exports = {

  friendlyName: 'Calcular Total Pedido',

  inputs: {
    items: {
      type: 'ref',
      required: true
    }
  },

  fn: async function (inputs) {

    let total = 0;

    for (const item of inputs.items) {

      total += (
        item.cantidad *
        item.precio_unitario
      );

    }

    return total;

  }

};
