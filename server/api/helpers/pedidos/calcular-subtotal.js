module.exports = {

    friendlyName: 'Calcular Subtotal',

    inputs: {

        cantidad: {
            type: 'number',
            required: true
        },

        precioUnitario: {
            type: 'number',
            required: true
        }

    },

    fn: async function (inputs) {

        return (
            inputs.cantidad *
            inputs.precioUnitario
        );

    }

};