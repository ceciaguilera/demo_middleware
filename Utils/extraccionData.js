const normalizar = require("./ApiUtil/String");
const get = require("./ApiUtil/http");
const getConfigComunas = require("../Request/comunas");
const { getLocalDateTime } = require("./DateUtil");

function extraerNumeroDireccion(direccionParticular) {
  if (direccionParticular) {
    let numberPattern = /(\d+[a-zA-Z]{0,2})[,|$]/;
    const result = direccionParticular.match(numberPattern);

    return result ? result[1] : "";
  }

  return "";
}

function extraerCalleDireccion(direccionParticular) {
  if (direccionParticular) {
    let numberPattern = /\d+/g;
    const result = String(direccionParticular)
      .replace(numberPattern, "")
      .trim();

    return result ? result : "";
  }

  return "";
}

function extraerDatosDireccion(direccion) {
  if (direccion) {
    const direccionSiniestro = String(direccion).split(",");
    const numero2 = extraerNumeroDireccion(direccionSiniestro[0]);
    const calle = extraerCalleDireccion(direccionSiniestro[0]);

    return {
      calle: String(calle).trim(), // Calle
      numero: String(numero2).trim(),
      comuna: String(direccionSiniestro[1]).trim()
    };
  }

  return "";
}

const extraerRegionDireccion = async (comuna) => {
  return get(getConfigComunas()).then(result => {
    const comunas = result.data.d.results;
    let comuna_element = comunas.find(cmna => cmna.TEXTO_COMUNA === String(comuna).trim().toUpperCase())

    return comuna_element.COD_COMUNA.substring(7, 9) || "";
  })
  .catch(() => "")
}

/**
 * Formatea una fecha en formato ISO a dd.mm.yyyy
 * @param {*} fecha
 */
function formatearFecha(fecha) {
  if (fecha) {
    const fechaInput = fecha.split("T");
    if (fechaInput[0].includes("-")){
      fecha = fechaInput[0].split("-")

      return (fecha[0].length === 4)?fecha.reverse().join("."):fecha.join(".");
    }

    else if (fechaInput[0].includes("/")){
      fecha = fechaInput[0].split("/")

      return (fecha[0].length === 4)?fecha.reverse().join("."):fecha.join(".");
    }
  }

  return "";
}

function formatDateToSap(date) {
  return `${String(date.getDate()).padStart(2, '0')}.${String((date.getMonth()) + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

function formatTimeToSap(date) {
  if(!date)
    date = getLocalDateTime();
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
}

function formatearTelefono(telefono) {
  if (telefono) {
    const telefonoNoSpace = telefono.trim().replace(/\s/g, "");
    if (String(telefonoNoSpace).length > 10)
      return telefonoNoSpace.substring(telefonoNoSpace.length, 3);
    else return telefonoNoSpace;
  }

  return "";
}
function formatearFechaSiniestro(fechaHoraSiniestro) {
  const { days, month, year } = fechaHoraSiniestro;
  return `${days}.${
    parseInt(month) < 10 ? "0" + month : month
  }.${year}`;
}

function formatearHoraSiniestro(fechaHoraSiniestro) {
  const { horas, minutos } = fechaHoraSiniestro;
  return `${
    horas < 10 && horas != "00" ? `0${String(horas)}` : String(horas)
  }:${
    minutos === 0
      ? "00".trim()
      : minutos < 10 && minutos != "00"
      ? ("0" + String(minutos)).trim()
      : String(minutos).trim()
  }:00`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Formatear fecha y hora responsable
 * @param {*} fechaHoraResponsable
 */
function formatearFechaHoraResponsable(fechaHoraResponsable) {
  const { days, month, year, horas, minutos } = fechaHoraResponsable;
  const fechaResponsable = `${days < 10 ? `0${String(days)}` : String(days)}.${
    month < 10 ? `0${String(month)}` : String(month)
  }.${String(year)}`;
  const horaResponsable = `${horas < 10 ? `0${String(horas)}` : horas}:${
    minutos < 10 ? `0${String(minutos)}` : String(minutos)
  }:00`;

  return { fechaResponsable, horaResponsable };
}

function concatenarRelatoToSAP(
  relato,
  testigo,
  responsable,
  fechaHoraResponsable,
  testigoTrabajo
) {
  // "Resumen relato" + la información de testigo  + la información de responsable
  let datosTestigo = "";
  let datosResponsable = "";

  let fechaResponsable = typeof fechaHoraResponsable === 'string' ? `${fechaHoraResponsable.split(" ")[0].replace(/[-]/g, '.')}` : "00.00.0000";
  let horaResponsable = typeof fechaHoraResponsable === 'string' ? `${fechaHoraResponsable.split(" ")[1]}:00` : "00:00:00";

  if (testigo.nombre && testigo.cargo)
      datosTestigo = `Tiene testigos de su accidente, el nombre y el cargo es ${normalizar(String(testigo.nombre))} ${normalizar(String(testigo.cargo))}`;

  else if (testigo.nombre && !testigo.cargo)
    datosTestigo = `Tiene testigos de su accidente, el nombre  es ${normalizar(String(testigo.nombre))}`;

  else if (testigoTrabajo)
    datosTestigo = "Tiene testigos de su accidente";

  else
    datosTestigo = "No tiene testigos de su accidente";

  if (responsable.nombre && responsable.cargo)
    { datosResponsable = `Avisó a la empresa, el nombre y cargo  de la persona es ${normalizar(
      String(responsable.nombre)
    )}, ${normalizar(
      String(responsable.cargo)
    )}, fecha y hora en que aviso a su empresa sobre el accidente: ${String(
      fechaResponsable
    )} a las ${String(horaResponsable)}`; }
  else if (fechaHoraResponsable !== "")
      { datosResponsable = `Avisó a la empresa, fecha y hora en que aviso a su empresa sobre el accidente: ${String(
        fechaResponsable
      )} a las ${String(horaResponsable)}`; }
  else { datosResponsable = "No avisó a su empresa"; }

  return `${relato}, ${datosTestigo}, ${datosResponsable}`;

}

// Mapear el parametro dependencia en SAP
function mapearCategoriaOcupacional({ id }) {
  return (id === 2) | (id === 4) | (id === 5) ? "1" : "2";
}

// Obtener nombre las UM y UT, campos Unidad_organizativa y Unidad_Org_medica
function mappingCamposUTMUT({ CentroData }) {
  const UT = CentroData.find((x) => x.OBJCAT === "UT");
  const UM = CentroData.find((x) => x.OBJCAT === "UM");

  return { UT: UT.SHORT, UM: UM.SHORT };
}

// Alertas calificacion, no tiene alerta por defecto
function alertaPorDefecto(razonAlertaForm) {
  return (!razonAlertaForm || Object.keys(razonAlertaForm).length == 0 || razonAlertaForm.glosa === "No registra alerta".trim()) ? "X" : "";
}
  

function restarFechas (inicio, fin){
  let fecha1 = new Date(inicio);
  let fecha2 = new Date(fin)
  let resta = fecha2.getTime() - fecha1.getTime()
  return Math.round(resta/ (1000*60*60*24));
}

const numeralDigitalizacion = (numeral, place) => {
  return (place)?`#${numeral}`:'';
}

const searchSecuencia = (secuenciaList, tipoSAP) => {
  const sec = secuenciaList.find(x => x.tipo_documento === tipoSAP);
  return sec.secuencia;
}

const getKeySapDigitalizacion = (doc, numeral = true) => {
  let idDoc, secuencia = ""; 
  if(doc.Tipo === "1" && doc.TipoSAP !== null){
    try {
      if (doc.ClaseDocumento === "ZAFISH46" || doc.ClaseDocumento === "ZAFISH58")
        secuencia = "0002";
      else {
        let secuenciaList = JSON.parse(doc.SecDoc.replace(/\\/g, ''));

        secuencia = searchSecuencia(secuenciaList, doc.TipoSAP);
        if (secuencia === '-')
          secuencia = "0002";
      }
    } catch {
      secuencia = "0001";
    }
    idDoc = `${doc.IdPaciente}SIN${doc.TipoSAP}${doc.IdSiniestro}${secuencia}${numeralDigitalizacion(1, numeral)}`;
  }
  else if(doc.Tipo === "2") {
    idDoc = `A000${doc.IdEpisodio}${numeralDigitalizacion(2, numeral)}`;
  }
  else {
    idDoc = `${doc.IdPaciente}SIN${doc.TipoSAP}${doc.IdSiniestro}000000${numeralDigitalizacion(2, numeral)}`;
  }

  return {
    idDoc,
    secuencia
  }
};


const calculateDiasLicencia = (licenciaFechaInicio, licenciaFechaTermino) => {
  let inicio = licenciaFechaInicio ? licenciaFechaInicio : ""
  if(inicio)
    inicio = inicio.split("-")[2]+"/"+inicio.split("-")[1]+"/"+inicio.split("-")[0]
  let fin = licenciaFechaTermino ? licenciaFechaTermino : ""
  if(fin)
      fin = fin.split("-")[2]+"/"+fin.split("-")[1]+"/"+fin.split("-")[0]        
  if(inicio && fin)
    return (restarFechas(inicio, fin)+1);
  return 0;
}

const validandoErrorsDates = (licencias) => {
  return licencias.map((licencia, index) => {
    let endD = new Date(licencia.endDate).getTime();

    const validando = licencias.map((licenciaCompare, indexCompare) => {
      let stardDateCompare = new Date(licenciaCompare.startDate).getTime();
      let endDateCompare = new Date(licenciaCompare.endDate).getTime();

      let val_return = false;
      if (indexCompare !== index && (indexCompare !== index && (endD === stardDateCompare || (endD > stardDateCompare && endD <= endDateCompare)))) 
        val_return = true

      return val_return;
    });
    if (validando.includes(true))
      return true

    return false
  });
}
const getListaLicenciasMedicas=(licencias, usuarioSAP) => {
  const actualDateTime = new Date();

  const validandoErrors = validandoErrorsDates(licencias)

  let response = {}
  response.error = false;
   if (validandoErrors.includes(true))
    response.error = true;

   response.data = licencias.map((licencia) => {
    return {
        Nrolicencia: licencia.numLicense,
        FechaInicioReposo: licencia.startDate ? licencia.startDate.replace(/[-]/g, '.') : "",
        FechaTerminoReposo: licencia.endDate ? licencia.endDate.replace(/[-]/g, '.') : "",
        TipoAlta: "4",
        FechaIndicacionReposo: formatearFecha(actualDateTime.toISOString()),
        FechaIndicacionAlta: formatearFecha(actualDateTime.toISOString()),
        ResponsableReposo: usuarioSAP ? String(usuarioSAP).toUpperCase().trim() : "",
        ResponsableAlta: usuarioSAP ? String(usuarioSAP).toUpperCase().trim() : "",
        DiasReposo: calculateDiasLicencia(licencia.startDate, licencia.endDate)
     }
  });

  return response;
}

module.exports = {
  extraerNumeroDireccion,
  extraerRegionDireccion,
  extraerCalleDireccion,
  formatearFecha,
  formatearTelefono,
  formatearFechaSiniestro,
  formatearHoraSiniestro,
  extraerDatosDireccion,
  formatearFechaHoraResponsable,
  sleep,
  concatenarRelatoToSAP,
  mapearCategoriaOcupacional,
  mappingCamposUTMUT,
  alertaPorDefecto,
  restarFechas,
  getKeySapDigitalizacion,
  getListaLicenciasMedicas,
  calculateDiasLicencia,
  formatDateToSap,
  formatTimeToSap
};
