const { createCrudController } = require('../services/CrudControllerFactory');

module.exports = createCrudController(ItemCarrito, {
  populate: ['carrito', 'producto', 'variante']
});
