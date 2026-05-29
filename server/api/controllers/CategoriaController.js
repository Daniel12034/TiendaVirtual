const { createCrudController } = require('../services/CrudControllerFactory');

module.exports = createCrudController(Categoria, {
  populate: ['productos']
});

