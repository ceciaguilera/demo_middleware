const getConfigVigencia = (rut) => {
  return {
    hostname: process.env.URLAPIMANAGEMENT,
    path: `AdmisionDigital/api/BP/ObtenerVigenciaEmpresa?rutEmpresa=${rut}`,
    headers: {
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.KEY,
        "Ocp-Apim-Trace": "true"
      }
    }
  };
};

const getConfigSucursalesVigentes = (rut) => {
  return {
    hostname: process.env.URLAPIMANAGEMENT,
    path: `AdmisionDigital/api/BP/ObtenerSucursalesVigentesEmpresaPorRUT?rut=${rut}`,
    headers: {
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.KEY,
        "Ocp-Apim-Trace": "true"
      }
    }
  };
};

module.exports = {
  getConfigVigencia,
  getConfigSucursalesVigentes
};
