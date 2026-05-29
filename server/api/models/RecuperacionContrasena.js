module.exports = {

  tableName: 'recuperaciones_contrasena',

  attributes: {

    id: {
      type: 'string',
      columnType: 'uuid',
      required: true,
      unique: true
    },

    email: {
      type: 'string',
      required: true,
      isEmail: true
    },

    token: {
      type: 'string',
      required: true,
      unique: true
    },

    fecha_solicitud: {
      type: 'ref',
      columnType: 'datetime',
      autoCreatedAt: true
    },

    fecha_expiracion: {
      type: 'ref',
      columnType: 'datetime',
      required: true
    },

    fecha_consumo: {
      type: 'ref',
      columnType: 'datetime',
    },

    estado: {
      type: 'string',
      isIn: ['PENDIENTE', 'EXPIRADA', 'USADA'],
      defaultsTo: 'PENDIENTE'
    },

    usuario: {
      model: 'usuario',
    }

  }

};
