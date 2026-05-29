const { createCrudController } = require('../services/CrudControllerFactory');

module.exports = createCrudController(DetallePedido, {
  populate: ['pedido', 'producto', 'variante']
});
