module.exports = {

    friendlyName: 'Obtener Carrito Cliente',

    inputs: {

        clienteId: {
            type: 'string',
            required: true
        }

    },

    fn: async function (inputs) {

        return await Carrito.findOne({
            cliente: inputs.clienteId
        }).populate('items');

    }

};