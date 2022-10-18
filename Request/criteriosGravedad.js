const getCriteriosGravedad = () => {
    return {
        hostname: process.env.URLAPIMANAGEMENT,
        path: `AdmisionDigital/api/Dominios/ObtenerListadoCriteriosGravedad`,
        headers: {
            headers: {
                "Ocp-Apim-Subscription-Key": process.env.KEY,
                "Ocp-Apim-Trace": "true"
            }
        }
    };
};
module.exports = getCriteriosGravedad;