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

    precioUnitario: {
      type: 'number',
      columnType: 'decimal(10,2)',
      required: true
    },

    pedido: {
      model: 'pedido',
      required: true
    },

    variante: {
      model: 'varianteproducto',
      required: true
    }

  }

};