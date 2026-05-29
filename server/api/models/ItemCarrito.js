// api/models/ItemCarrito.js

module.exports = {

  tableName: 'items_carrito',

  attributes: {

    id: {
      type: 'string',
      columnType: 'uuid',
      required: true,
      unique: true
    },

    cantidad: {
      type: 'number',
      required: true,
      min: 1
    },

    precio_unitario: {
      type: 'number',
      columnType: 'decimal(10,2)',
      required: true
    },

    producto: {
      model: 'producto',
      required: true
    },

    carrito: {
      model: 'carrito',
      required: true
    },

    variante: {
      model: 'varianteproducto',
    }

  }

};
