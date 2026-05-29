const { createCrudController } = require('../services/CrudControllerFactory');

module.exports = createCrudController(Producto, {
  populate: ['categoria', 'variantes']
});

