module.exports = {

  friendlyName: 'Descontar Stock',

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

    if (variante.stock < inputs.cantidad) {
      throw new Error('Stock insuficiente');
    }

    return await VarianteProducto.updateOne({
      id: variante.id
    }).set({
      stock: variante.stock - inputs.cantidad
    });

  }

};