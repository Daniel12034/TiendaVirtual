const ActionService = require('../services/ActionService');

module.exports = {
  AuthService: async function (req, res) {
    return await ActionService.handleResponse(res, async () => {
      return {
        ok: true,
        services: [
          'AuthService',
          'SessionService',
          'CartService',
          'PedidoService',
          'InventoryService'
        ]
      };
    });
  }
};

