/**
 * ResponsesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  

  /**
   * `ResponsesController.unauthorized()`
   */
  unauthorized: async function (req, res) {
    return res.json({
      todo: 'unauthorized() is not implemented yet!'
    });
  }

};

