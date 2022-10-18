const getConfigRegiones = () => {
  return {
    hostname: process.env.URLAPIMANAGEMENT,
    path: `AdmisionDigital/api/Dominios/ObtenerListadoRegiones`,
    headers: {
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.KEY,
        "Ocp-Apim-Trace": "true"
      }
    }
  };
};
module.exports = getConfigRegiones;
