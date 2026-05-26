// api/models/Sesion.js

module.exports = {

  tableName: 'sesiones',

  attributes: {

    id: {
      type: 'string',
      columnType: 'uuid',
      required: true,
      unique: true
    },

    token: {
      type: 'string',
      required: true,
      unique: true
    },

    fechaInicio: {
      type: 'ref',
      columnType: 'datetime',
      required: true
    },

    fechaExpiracion: {
      type: 'ref',
      columnType: 'datetime',
      required: true
    },

    estado: {
      type: 'string',
      isIn: ['ACTIVA', 'EXPIRADA', 'INVALIDA'],
      defaultsTo: 'ACTIVA'
    },

    usuario: {
      model: 'usuario',
      required: true
    }

  }

};