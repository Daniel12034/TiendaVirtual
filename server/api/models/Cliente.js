// api/models/Cliente.js

module.exports = {

  tableName: 'clientes',

  attributes: {

    id: {
      type: 'string',
      columnType: 'uuid',
      required: true,
      unique: true
    },

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
