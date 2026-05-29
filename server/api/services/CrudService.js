const { v4: uuidv4 } = require('uuid');
const { notFound } = require('./HttpError');

function normalizePopulate(populate) {
  if (!populate) {
    return [];
  }

  return Array.isArray(populate) ? populate : [populate];
}

function applyPopulate(query, populate) {
  let current = query;

  for (const association of normalizePopulate(populate)) {
    current = current.populate(association);
  }

  return current;
}

function resolveLimit(limit) {
  const parsed = Number(limit);

  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }

  return sails.config.custom.defaultPageSize || 25;
}

function resolveSkip(skip) {
  const parsed = Number(skip);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

async function findMany(model, options = {}) {
  const {
    where = {},
    populate = [],
    sort = 'created_at DESC',
    limit,
    skip
  } = options;

  let query = model.find(where);
  query = applyPopulate(query, populate);

  if (sort) {
    query = query.sort(sort);
  }

  query = query.limit(resolveLimit(limit));
  query = query.skip(resolveSkip(skip));

  return await query;
}

async function findOne(model, id, options = {}) {
  const { where = {}, populate = [] } = options;
  const criteria = { ...where, id };
  let query = model.findOne(criteria);
  query = applyPopulate(query, populate);

  const record = await query;

  if (!record) {
    throw notFound('Registro no encontrado');
  }

  return record;
}

async function create(model, data, options = {}) {
  const payload = { ...data };
  const { populate = [] } = options;

  if (!payload.id) {
    payload.id = uuidv4();
  }

  let record = await model.create(payload).fetch();

  if (populate.length > 0) {
    record = await findOne(model, record.id, { populate });
  }

  return record;
}

async function update(model, id, data, options = {}) {
  const { populate = [] } = options;
  const payload = { ...data };
  delete payload.id;

  let record = await model.updateOne({ id }).set(payload);

  if (!record) {
    throw notFound('Registro no encontrado');
  }

  if (populate.length > 0) {
    record = await findOne(model, id, { populate });
  }

  return record;
}

async function destroy(model, id) {
  const record = await model.destroyOne({ id });

  if (!record) {
    throw notFound('Registro no encontrado');
  }

  return record;
}

function extractCriteria(query = {}) {
  const reserved = new Set(['limit', 'skip', 'sort']);
  const criteria = {};

  for (const [key, value] of Object.entries(query)) {
    if (!reserved.has(key) && value !== undefined && value !== null && value !== '') {
      criteria[key] = value;
    }
  }

  return criteria;
}

module.exports = {
  findMany,
  findOne,
  create,
  update,
  destroy,
  extractCriteria,
  resolveLimit,
  resolveSkip
};
