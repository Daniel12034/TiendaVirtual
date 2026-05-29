const ActionService = require('../services/ActionService');

module.exports = {
  unauthorized: async function (req, res) {
    return await ActionService.handleResponse(res, async () => {
      throw Object.assign(new Error('No autorizado'), {
        statusCode: 401
      });
    });
  }
};

