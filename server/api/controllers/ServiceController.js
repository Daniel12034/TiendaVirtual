/**
 * ServiceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  

  /**
   * `ServiceController.AuthService()`
   */
  AuthService: async function (req, res) {
    return res.json({
      todo: 'AuthService() is not implemented yet!'
    });
  }

};

