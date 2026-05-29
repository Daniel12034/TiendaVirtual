module.exports = {

    friendlyName: 'Calcular Subtotal',

    inputs: {

        cantidad: {
            type: 'number',
            required: true
        },

        precio_unitario: {
            type: 'number',
            required: true
        }

    },

    fn: async function (inputs) {

        return (
            inputs.cantidad *
            inputs.precio_unitario
        );

    }

};
