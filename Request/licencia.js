const getLicencias = () => {
    return `${process.env.URLAPIMANAGEMENT}AdmisionDigital/RESTAdapter/AdmDigital/LicenciasMedicas`
  };
  
const postLicencias = () => {
    return `${process.env.URLAPIMANAGEMENT}AdmisionDigital/RESTAdapter/AdmDigital/EstadoLicenciasMedicas`
  };
  
  module.exports = { getLicencias, postLicencias };