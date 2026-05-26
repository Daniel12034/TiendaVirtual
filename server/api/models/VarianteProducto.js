// api/models/VarianteProducto.js

module.exports = {

  tableName: 'variantes_producto',

  attributes: {

    id: {
      type: 'string',
      columnType: 'uuid',
      required: true,
      unique: true
    },

    nombre: {
      type: 'string',
      required: true
    },

    valor: {
      type: 'string',
      required: true
    },

    stock: {
      type: 'number',
      required: true,
      min: 0,
      defaultsTo: 0
    },

    producto: {
      model: 'producto',
      required: true
    }

  }

};