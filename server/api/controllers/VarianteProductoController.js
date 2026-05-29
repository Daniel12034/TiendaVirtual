const { createCrudController } = require('../services/CrudControllerFactory');

module.exports = createCrudController(VarianteProducto, {
  populate: ['producto']
});

