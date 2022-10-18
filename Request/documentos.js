const getBase64 = (idStorage) => {
    return {
        hostname: process.env.URLDOCUMENTS,
        path: `/api/documentos/v1/archivo/${idStorage}`
    };
};

const postDigitalizacion = () => {
    return `${process.env.URLAPIMANAGEMENT}FirmaDigitalAdmision/RESTAdapter/FirmaDigital/Recep`;
}

const postGenerateCodigoBarra = () => {
    return `${process.env.URLAPIMANAGEMENT}AdmisionDigital/RESTAdapter/AdmisionDigital/CodigoBarra`;
}

const postActualizaEstadoDigitalizacion = () => {
    return {
        hostname: process.env.URLDB,
        path: `api/firmadigital/updateDocumentosDigitalizacionByID`
      };
}

const getDocumentosSAP = (siniestro) => {
    return {
        hostname: process.env.URLAPIMANAGEMENT,
        path: `AdmisionDigital/api/Siniestros/ObtenerDocumentosPorSiniestro?IdSiniestro=${siniestro}`
    };
}

const getDiatDiepByRut = () => {
    return `${process.env.URLAPIMANAGEMENT}AdmisionDigital/RESTAdapter/AdmDigital/ConsultaDiatDiep`
}

const vincularDiatDiepEmpresa = () => {
    return `${process.env.URLAPIMANAGEMENT}AdmisionDigital/RESTAdapter/AdmDigital/VinculaDIATDIEP`
}

module.exports = {
    getBase64,
    postDigitalizacion,
    postActualizaEstadoDigitalizacion,
    postGenerateCodigoBarra,
    getDocumentosSAP,
    getDiatDiepByRut,
    vincularDiatDiepEmpresa
}
