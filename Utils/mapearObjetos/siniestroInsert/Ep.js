const {
    DatosGenerales,
    AntecedentesAccidentes,
    Denunciante,
    CabeceraSiniestro,
    OcupasionSin,
} = require("../../formatear/objetos/datosInsert");

const {
    AlertaEnfermedadProf
} = require("../../formatear/objetos/alertas")

const {
  getListaLicenciasMedicas

} = require("../../extraccionData");

  const MapearEPInsert = async (episodioID, datos) => {
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
        tipoSiniestro,
        sucursalCargo,
        tipoAdmision,
        licencias,
        fechaHoraPoliclinico,
        AtencionMedicaTrabEP
    } = datos;


    let json = {
        Usuario_Sap: usuarioSAP ? String(usuarioSAP).toUpperCase().trim() : "",

        Datos_Generales_Siniestro: DatosGenerales(episodioID, tipoSiniestro.Id, (tipoAdmision && Object.keys(tipoAdmision).length>0 && tipoAdmision.Id && tipoAdmision.Id == 4) ? "2" : "1", fechaHoraPoliclinico),

        Antecedentes_accidente: AntecedentesAccidentes(datos),

        Alerta_Cal_enferm_prof: AlertaEnfermedadProf(razonAlertaForm),

        cabecera_sin: CabeceraSiniestro(SucursalEmpresaObjeto, razonSocial.name, sucursalCargo),

        Denunciante: Denunciante(datos),

        ocupacion_sin: OcupasionSin(tipoJornadaForm.id,
                                    inicioJornadaLaboral,
                                    finJornadaLaboral,
                                    cargoForm,
                                    profesionForm.codigo,
                                    ingresoTrabajoActual,
                                    tipoDeContrato.id,
                                    categoriaOcupacionalForm,
                                    tipoRemuneracion.id,
                                    isapreSeleccionado.id,
                                    afpForm.codigo
                                    )
    }

    if (AtencionMedicaTrabEP && AtencionMedicaTrabEP.Si.toLowerCase() === 'x') {
      json.Pac_cen_ext = 'X'
    }

    if(tipoAdmision && Object.keys(tipoAdmision).length>0 && tipoAdmision.Id && tipoAdmision.Id == 4){ //solo se agregan para ley 19394
      json.Datos_Licencia =getListaLicenciasMedicas(licencias,usuarioSAP)
    }

    return json
  }



module.exports = MapearEPInsert;