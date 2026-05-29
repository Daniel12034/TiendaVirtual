const ActionService = require('./ActionService');
const CrudService = require('./CrudService');

function sanitizePayload(payload = {}) {
  return { ...payload };
}

function buildCriteria(req) {
  return CrudService.extractCriteria(req.query || {});
}

function createCrudController(model, options = {}) {
  const {
    populate = [],
    beforeCreate = async (payload) => payload,
    beforeUpdate = async (payload) => payload,
    afterCreate = async (record) => record,
    afterUpdate = async (record) => record,
    afterFind = async (record) => record,
    afterFindMany = async (records) => records
  } = options;

  return {
    find: async function (req, res) {
      return await ActionService.handleResponse(res, async () => {
        const criteria = buildCriteria(req);
        const records = await CrudService.findMany(model, {
          where: criteria,
          populate,
          sort: req.query && req.query.sort
        });

        return await afterFindMany(records);
      });
    },

    findOne: async function (req, res) {
      return await ActionService.handleResponse(res, async () => {
        const id = req.params.id;
        const record = await CrudService.findOne(model, id, { populate });
        return await afterFind(record);
      });
    },

    create: async function (req, res) {
      return await ActionService.handleResponse(res, async () => {
        const payload = await beforeCreate(sanitizePayload(req.body || {}), req);
        const record = await CrudService.create(model, payload, { populate });
        return await afterCreate(record);
      });
    },

    update: async function (req, res) {
      return await ActionService.handleResponse(res, async () => {
        const id = req.params.id;
        const payload = await beforeUpdate(sanitizePayload(req.body || {}), req);
        const record = await CrudService.update(model, id, payload, { populate });
        return await afterUpdate(record);
      });
    },

    destroy: async function (req, res) {
      return await ActionService.handleResponse(res, async () => {
        return await CrudService.destroy(model, req.params.id);
      });
    }
  };
}

module.exports = {
  createCrudController
};
