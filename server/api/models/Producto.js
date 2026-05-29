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

    stock: {
      type: 'number',
      min: 0,
      defaultsTo: 0
    },

    etiqueta: {
      type: 'string',
      allowNull: true,
      maxLength: 120
    },

    imagen_url: {
      type: 'string',
      allowNull: true,
      maxLength: 2048
    },

    imagen_alt: {
      type: 'string',
      allowNull: true,
      maxLength: 255
    },

    imagen_source_name: {
      type: 'string',
      allowNull: true,
      maxLength: 120
    },

    imagen_source_page_url: {
      type: 'string',
      allowNull: true,
      maxLength: 2048
    },

    imagen_creator_name: {
      type: 'string',
      allowNull: true,
      maxLength: 191
    },

    imagen_creator_url: {
      type: 'string',
      allowNull: true,
      maxLength: 2048
    },

    imagen_license_label: {
      type: 'string',
      allowNull: true,
      maxLength: 120
    },

    imagen_width: {
      type: 'number',
      allowNull: true
    },

    imagen_height: {
      type: 'number',
      allowNull: true
    },

    imagen_verified_real_photo: {
      type: 'boolean',
      defaultsTo: false
    },

    imagen_verified_hd: {
      type: 'boolean',
      defaultsTo: false
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
