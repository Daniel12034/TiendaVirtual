// api/models/Cliente.js

module.exports = {

  tableName: 'clientes',

  attributes: {

    telefono: {
      type: 'string',
      maxLength: 20
    },

    direccion: {
      type: 'string',
      maxLength: 255
    },

    usuario: {
      model: 'usuario',
      required: true,
      unique: true
    },

    carrito: {
      model: 'carrito'
    },

    pedidos: {
      collection: 'pedido',
      via: 'cliente'
    }

  }

};