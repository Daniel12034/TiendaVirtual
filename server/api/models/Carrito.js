// api/models/Carrito.js

module.exports = {

  tableName: 'carritos',

  attributes: {

    id: {
      type: 'string',
      columnType: 'uuid',
      required: true,
      unique: true
    },

    fecha_creacion: {
      type: 'ref',
      columnType: 'datetime',
      autoCreatedAt: true
    },

    cliente: {
      model: 'cliente',
      unique: true
    },

    items: {
      collection: 'itemcarrito',
      via: 'carrito'
    }

  }

};
