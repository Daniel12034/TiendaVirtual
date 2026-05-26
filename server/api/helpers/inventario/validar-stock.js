module.exports = {

  friendlyName: 'Validar Stock',

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

  fn: async function (inputs) {

    const variante = await VarianteProducto.findOne({
      id: inputs.varianteId
    });

    if (!variante) {
      throw new Error('Variante no encontrada');
    }

    return variante.stock >= inputs.cantidad;

  }

};