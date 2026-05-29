const { createCrudController } = require('../services/CrudControllerFactory');

module.exports = createCrudController(Carrito, {
  populate: ['cliente', 'items']
});

