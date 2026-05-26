// api/hooks/uuid-hook/index.js

const { v4: uuidv4 } = require('uuid');

module.exports = function () {

    return {

        initialize(done) {

            const models = sails.models;

            Object.keys(models).forEach(modelName => {

                const model = models[modelName];

                const originalBeforeCreate = model.beforeCreate;

                model.beforeCreate = async function (values, proceed) {

                    if (!values.id) {
                        values.id = uuidv4();
                    }

                    if (originalBeforeCreate) {
                        return originalBeforeCreate(values, proceed);
                    }

                    return proceed();
                };

            });

            return done();
        }

    };

};