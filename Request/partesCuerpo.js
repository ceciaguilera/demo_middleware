
const getPartesCuerpo = () => {
    return {
        hostname: process.env.URLAPIMANAGEMENT,
        path: `AdmisionDigital/api/Dominios/ObtenerListaUbicacionLesion`,
        headers: {
            headers: {
                "Ocp-Apim-Subscription-Key": process.env.KEY,
                "Ocp-Apim-Trace": "true"
            }
        }
    };
};

  module.exports = {
      getPartesCuerpo
  }
  ;
  