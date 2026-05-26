// api/models/Categoria.js

module.exports = {

  tableName: 'categorias',

  attributes: {

    id: {
      type: 'string',
      columnType: 'uuid',
      required: true,
      unique: true
    },

    nombre: {
      type: 'string',
      required: true,
      unique: true
    },

    descripcion: {
      type: 'string',
      allowNull: true
    },

    productos: {
      collection: 'producto',
      via: 'categoria'
    }

  }

};