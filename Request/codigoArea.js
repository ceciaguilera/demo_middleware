
const getCodigoArea = () => {
    return {
        hostname: process.env.URLAPIMANAGEMENT,
        path: `AdmisionDigital/api/Dominios/ObtenerListaArea`,
        headers: {
            headers: {
                "Ocp-Apim-Subscription-Key": process.env.KEY,
                "Ocp-Apim-Trace": "true"
            }
        }
    };
};

module.exports = {
    getCodigoArea
};
  