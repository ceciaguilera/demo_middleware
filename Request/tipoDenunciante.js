const getConfigTipoDenunciante = () => {
    return {
        hostname: process.env.URLAPIMANAGEMENT,
        path: `AdmisionDigital/api/Dominios/ObtenerListadoTipoDenunciante`,
        headers: {
            headers: {
                "Ocp-Apim-Subscription-Key": process.env.KEY,
                "Ocp-Apim-Trace": "true"
            }
        }
    }
}
module.exports = getConfigTipoDenunciante