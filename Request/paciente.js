const getConfigPaciente = (rut) => {
  return {
    hostname: process.env.URLAPIMANAGEMENT,
    path: `AdmisionDigital/api/BP/ObtenerBPDatosGenerales?RutPer=${rut}`,
    headers: {
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.KEY,
        "Ocp-Apim-Trace": "true"
      }
    }
  };
};

const setCorreoPaciente = () => {
  return `${process.env.URLAPIMANAGEMENT}AdmisionDigital/RESTAdapter/AdmDigitalActEmail`
};

module.exports = { getConfigPaciente,  setCorreoPaciente };
