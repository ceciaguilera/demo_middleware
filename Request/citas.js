const getConfigCitasFuturas = (IPBpPersona) => {
  return {
    hostname: `${process.env.URLAPIMANAGEMENT}`,
    path: `AdmisionDigital/api/Salud/ObternerCitasFuturasporBP?IPBpPersona=${IPBpPersona}`,
    headers: {
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.KEY,
        "Ocp-Apim-Trace": "true"
      }
    }
  };
};
module.exports = getConfigCitasFuturas;
