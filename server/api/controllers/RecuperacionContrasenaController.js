const { createCrudController } = require('../services/CrudControllerFactory');

module.exports = createCrudController(RecuperacionContrasena, {
  populate: ['usuario']
});
