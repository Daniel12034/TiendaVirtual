// api/models/Usuario.js

module.exports = {

  tableName: 'usuarios',

  attributes: {

    id: {
      type: 'string',
      columnType: 'uuid',
      required: true,
      unique: true,
      autoMigrations: {
        autoIncrement: false
      }
    },

    nombre: {
      type: 'string',
      required: true,
      maxLength: 120
    },

    email: {
      type: 'string',
      required: true,
      unique: true,
      isEmail: true
    },

    password: {
      type: 'string',
      required: true,
      protect: true
    },

    fecha_nacimiento: {
      type: 'ref',
      columnType: 'datetime'
    },

    estado: {
      type: 'string',
      isIn: ['ACTIVO', 'SUSPENDIDO', 'ELIMINADO'],
      defaultsTo: 'ACTIVO'
    },

    sesiones: {
      collection: 'sesion',
      via: 'usuario'
    }

  }

};
