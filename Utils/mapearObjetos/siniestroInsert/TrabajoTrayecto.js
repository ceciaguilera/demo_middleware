const {
  DatosGenerales,
  Denunciante,
  CabeceraSiniestro,
  OcupasionSin,
  Siniestro
} = require("../../formatear/objetos/datosInsert");

const {
  AlertaTrabajo,
  AlertaTrayecto
} = require("../../formatear/objetos/alertas")

const {
  getListaLicenciasMedicas
} = require("../../extraccionData");

const MapearTrabajoTrayectoInsert = async (episodioID, datos) => {
  const {
      razonSocial,
      tipoJornadaForm,
      inicioJornadaLaboral,
      finJornadaLaboral,
      ingresoTrabajoActual,
      tipoDeContrato,
      categoriaOcupacionalForm,
      tipoRemuneracion,
      isapreSeleccionado,
      afpForm,
      profesionForm,
      cargoForm,
      usuarioSAP,
      SucursalEmpresaObjeto,
      razonAlertaForm,
      sucursalCargo,
      tipoSiniestro,        
      tipoAdmision,
      licencias,
      fechaHoraPoliclinico,
      AtencionMedicaTrabEP,
      CamposDocumentos
  } = datos;

  let json = {
      Usuario_Sap: usuarioSAP ? String(usuarioSAP).toUpperCase().trim() : "",

      Datos_Generales_Siniestro: DatosGenerales(episodioID, tipoSiniestro.Id, (tipoAdmision && Object.keys(tipoAdmision).length>0 && tipoAdmision.Id && tipoAdmision.Id == 4) ? "2" : "1", fechaHoraPoliclinico),

      Siniestro: await Siniestro(datos),

      // Alertas
      Alerta_Cal_trabajo: AlertaTrabajo(tipoSiniestro.Id === 1 ? razonAlertaForm : undefined, tipoSiniestro.Id),
      Alerta_Cal_trayecto: AlertaTrayecto(tipoSiniestro.Id === 2 ? razonAlertaForm : undefined),

      cabecera_sin: CabeceraSiniestro(SucursalEmpresaObjeto, razonSocial.name, sucursalCargo),

      Denunciante: Denunciante(datos),
      
      ocupacion_sin: OcupasionSin(tipoJornadaForm.id,
          inicioJornadaLaboral,
          finJornadaLaboral,
          cargoForm,
          profesionForm,
          ingresoTrabajoActual,
          tipoDeContrato.id,
          categoriaOcupacionalForm,
          tipoRemuneracion.id,
          isapreSeleccionado.id,
          afpForm.codigo
      )
  };

  if ((AtencionMedicaTrabEP && AtencionMedicaTrabEP.Si.toLowerCase() === 'x') || (CamposDocumentos && CamposDocumentos.OtroRecintoSi.toLowerCase() === 'x')) {
    json.Pac_cen_ext = 'X'
  }
  
  if(tipoAdmision && Object.keys(tipoAdmision).length>0 && tipoAdmision.Id && tipoAdmision.Id == 4){ //solo se agregan para ley 19394
    json.Datos_Licencia =getListaLicenciasMedicas(licencias,usuarioSAP)
  }
  return json
}

module.exports = MapearTrabajoTrayectoInsert;