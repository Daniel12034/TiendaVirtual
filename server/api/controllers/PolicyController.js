const ActionService = require('../services/ActionService');
const SessionService = require('../services/SessionService');

module.exports = {
  isAuthenticated: async function (req, res) {
    return await ActionService.handleResponse(res, async () => {
      const bodyToken = req.body && req.body.token ? req.body.token : '';
      const queryToken = req.query && req.query.token ? req.query.token : '';
      const token = (req.headers.authorization || '')
        .replace(/^Bearer\s+/i, '')
        .trim() || String(queryToken || bodyToken || '').trim();

      if (!token) {
        throw Object.assign(new Error('No autorizado'), {
          statusCode: 401
        });
      }

      const authenticated = await SessionService.isValid(token);

      if (!authenticated) {
        throw Object.assign(new Error('No autorizado'), {
          statusCode: 401
        });
      }

      return { authenticated: true };
    });
  }
};

