module.exports = {

    friendlyName: 'Sesion Valida',

    inputs: {

        token: {
            type: 'string',
            required: true
        }

    },

    /**
     * Retorna: boolean
     * - true  => la sesión existe, su estado es 'ACTIVA' y la fecha de expiración es mayor que ahora
     * - false => en cualquier otro caso (no existe, no está activa o ya expiró)
     */
    fn: async function (inputs) {

        const sesion = await Sesion.findOne({
            token: inputs.token
        });

        if (!sesion) {
            return false;
        }

        if (sesion.estado !== 'ACTIVA') {
            return false;
        }

        return (
            new Date(sesion.fechaExpiracion) >
            new Date()
        );

    }

};