const { createCrudController } = require('../services/CrudControllerFactory');

module.exports = createCrudController(Cliente, {
  populate: ['usuario', 'carrito', 'pedidos']
});

