const getPaises = () => {
  return {
    hostname: process.env.URLAPIMANAGEMENT,
    path: `AdmisionDigital/api/Dominios/ObtenerListadoPais`,
    headers: {
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.KEY,
        "Ocp-Apim-Trace": "true"
      }
    }
  };
};
module.exports = getPaises;
