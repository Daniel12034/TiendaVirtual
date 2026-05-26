// api/models/Producto.js

module.exports = {

  tableName: 'productos',

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

    descripcion: {
      type: 'string'
    },

    precio: {
      type: 'number',
      columnType: 'decimal(10,2)',
      required: true
    },

    estado: {
      type: 'string',
      isIn: ['ACTIVO', 'INACTIVO', 'AGOTADO'],
      defaultsTo: 'ACTIVO'
    },

    categoria: {
      model: 'categoria',
      required: true
    },

    variantes: {
      collection: 'varianteproducto',
      via: 'producto'
    }

  }

};