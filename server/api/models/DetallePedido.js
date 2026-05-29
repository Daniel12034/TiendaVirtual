// api/models/DetallePedido.js

module.exports = {

  tableName: 'detalle_pedido',

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

    pedido: {
      model: 'pedido',
      required: true
    },

    variante: {
      model: 'varianteproducto',
    }

  }

};
