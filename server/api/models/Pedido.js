// api/models/Pedido.js

module.exports = {

  tableName: 'pedidos',

  attributes: {

    id: {
      type: 'string',
      columnType: 'uuid',
      required: true,
      unique: true
    },

    fecha: {
      type: 'ref',
      columnType: 'datetime',
      autoCreatedAt: true
    },

    total: {
      type: 'number',
      columnType: 'decimal(10,2)',
      required: true,
      defaultsTo: 0
    },

    estado: {
      type: 'string',
      isIn: [
        'PENDIENTE',
        'PAGADO',
        'ENVIADO',
        'ENTREGADO',
        'CANCELADO'
      ],
      defaultsTo: 'PENDIENTE'
    },

    cliente: {
      model: 'cliente',
      required: true
    },

    detalles: {
      collection: 'detallepedido',
      via: 'pedido'
    }

  }

};