
const getLugarOcurrencia = () => {
    return {
        hostname: process.env.URLAPIMANAGEMENT,
        path: `AdmisionDigital/api/Dominios/ObtenerListaLugarAccidente`,
        headers: {
            headers: {
                "Ocp-Apim-Subscription-Key": process.env.KEY,
                "Ocp-Apim-Trace": "true"
            }
        }
    };
};

  module.exports = {
      getLugarOcurrencia
  }
  ;
  