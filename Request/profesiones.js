const getConfiProfesiones = () => {
  return {
    hostname: `${process.env.URLAPIMANAGEMENT}`,
    path: `AdmisionDigital/api/Dominios/ObtenerListadoProfesionOficio`,
    headers: {
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.KEY,
        "Ocp-Apim-Trace": "true"
      }
    }
  };
};
module.exports = getConfiProfesiones;
