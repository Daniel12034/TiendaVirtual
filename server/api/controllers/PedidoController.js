const { createCrudController } = require('../services/CrudControllerFactory');

module.exports = createCrudController(Pedido, {
  populate: ['cliente', 'detalles']
});

