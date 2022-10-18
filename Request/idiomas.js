const getIdiomas = () => {
  return {
    hostname: process.env.URLAPIMANAGEMENT,
    path: `AdmisionDigital/api/Dominios/ObtenerListadoIdiomas`,
    headers: {
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.KEY,
        "Ocp-Apim-Trace": "true"
      }
    }
  };
};
module.exports = getIdiomas;
