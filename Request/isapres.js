const getIsapres = () => {
  return {
    hostname: process.env.URLAPIMANAGEMENT,
    path: `AdmisionDigital/api/Dominios/ObtenerListadoIsapres`,
    headers: {
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.KEY,
        "Ocp-Apim-Trace": "true"
      }
    }
  };
};
module.exports = getIsapres;
