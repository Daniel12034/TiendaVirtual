module.exports = {

  friendlyName: 'Vaciar Carrito',

  inputs: {

    carritoId: {
      type: 'string',
      required: true
    }

  },

  fn: async function(inputs) {

    await ItemCarrito.destroy({
      carrito: inputs.carritoId
    });

    return true;

  }

};