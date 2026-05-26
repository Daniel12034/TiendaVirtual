module.exports = {

  friendlyName: 'Aumentar Stock',

  inputs: {

    varianteId: {
      type: 'string',
      required: true
    },

    cantidad: {
      type: 'number',
      required: true
    }

  },

  fn: async function(inputs) {

    const variante = await VarianteProducto.findOne({
      id: inputs.varianteId
    });

    if (!variante) {
      throw new Error('Variante no encontrada');
    }

    return await VarianteProducto.updateOne({
      id: variante.id
    }).set({
      stock: variante.stock + inputs.cantidad
    });

  }

};