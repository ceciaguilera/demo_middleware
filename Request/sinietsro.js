const getConfigSiniestro = (BPSiniestro) => {
  return {
    hostname: `${process.env.URLAPIMANAGEMENT}`,
    path: `AdmisionDigital/api/Siniestros/ObtenerDatosSiniestrosPorBP?BPSiniestro=${BPSiniestro}`,
    headers: {
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.KEY,
        "Ocp-Apim-Trace": "true"
      }
    }
  };
};
module.exports = getConfigSiniestro;
