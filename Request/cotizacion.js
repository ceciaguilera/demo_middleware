const getConfigCotizacion = (rut, periodoInicial, periodoFinal) => {
  return {
    hostname: process.env.URLAPIMANAGEMENT,
    path: `AdmisionDigital/api/BP/ObtenerCotizacionesTrabajadorRangoFecha?rut=${rut}&periodoInicial=${periodoInicial}&periodoFinal=${periodoFinal}`,
    headers: {
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.KEY,
        "Ocp-Apim-Trace": "true"
      }
    }
  };
};
module.exports = getConfigCotizacion;

