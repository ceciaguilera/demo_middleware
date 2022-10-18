const { sapHttpPost, sapHttpPostResponse } = require("./ApiUtil/sapHttpPost");
const { httpGetRequest } = require("../Utils/ApiUtil/httpRequests");
const { getInfoAdmisionByIDUnify } = require("../Request/database");
const { sleep } = require("./extraccionData");
const { firmaMedico } = require("../Request/sap");
const { isBase64String } = require("./validaciones");
const { InsightTrace } = require("./ApiUtil/appInsight");

const RETRY = '5000'

const validarPaciente= (datos) => {
    let error=""
    if (datos.tipoDocumento === undefined || !datos.tipoDocumento)
        error+= 'tipoDocumento, ';

    if (datos.rut === undefined || !datos.rut)
        error+= 'rut, ';

    if (datos.direccionParticular === undefined || !datos.direccionParticular)
        error+= 'direccionParticular, ';

    if (datos.centroPacienteForm === undefined || !Object.keys(datos.centroPacienteForm).length>0)
        error+= 'centroPacienteForm, ';

    if (datos.usuarioSAP === undefined || !datos.usuarioSAP)
        error+= 'usuarioSAP, ';

    if (datos.comunaDireccionParticular === undefined || !datos.comunaDireccionParticular)
        error+= 'comunaDireccionParticular, ';

    return error
}

const validarNombre = (datos) => {
    let error=""
    if (datos.datosAdicionalesSAP.apellidoMaterno === undefined || !datos.datosAdicionalesSAP.apellidoMaterno)
        error+= 'datosAdicionalesSAP.apellidoMaterno, ';

    if (datos.datosAdicionalesSAP.apellidoPaterno === undefined || !datos.datosAdicionalesSAP.apellidoPaterno)
        error+= 'datosAdicionalesSAP.apellidoPaterno, ';

    if (datos.datosAdicionalesSAP.nombre === undefined || !datos.datosAdicionalesSAP.nombre)
        error+= 'datosAdicionalesSAP.nombre, ';
    
    return error;
}
const camposDatosAdicionalesSAP = (datos) =>{
    let error=""
    error+= validarNombre(datos)
    if (datos.datosAdicionalesSAP.fechaNacimiento === undefined || !datos.datosAdicionalesSAP.fechaNacimiento)
        error+= 'datosAdicionalesSAP.fechaNacimiento, ';

    if ((datos.datosAdicionalesSAP.masculino === undefined || !datos.datosAdicionalesSAP.masculino) && (datos.datosAdicionalesSAP.femenino === undefined || !datos.datosAdicionalesSAP.femenino))
        error+= 'datosAdicionalesSAP genero, ';

    if (datos.datosAdicionalesSAP.nacionalidad === undefined || !datos.datosAdicionalesSAP.nacionalidad)
        error+= 'datosAdicionalesSAP.nacionalidad, ';

    return error
}

const validarResponsable = (datos) =>{
    let error=""
    if (datos.responsable.nombre || datos.responsable.cargo){ 
        if (datos.responsable.nombre === undefined || !datos.responsable.nombre){
            error+= 'responsable.nombre, ';
        }
        if (datos.responsable.cargo === undefined || !datos.responsable.cargo){
            error+= 'responsable.cargo, ';
        }
        if (datos.fechaHoraResponsable === undefined || !datos.fechaHoraResponsable  || datos.fechaHoraResponsable.includes("null") ){
            error+= 'fechaHoraResponsable, ';
        }
    }
    return error

}

const validarDenunciante = (datos) => {
    let error=""
    if (datos.denuncianteForm !== undefined || datos.denuncianteForm){ //si hay denunciante
        if (datos.denuncianteForm.tipoDenunciante === undefined || !datos.denuncianteForm.tipoDenunciante){
            error+= 'tipoDenunciante.tipoDenunciante, ';
        }
        if (datos.denuncianteForm.rutDenunciante === undefined || !datos.denuncianteForm.rutDenunciante){
            error+= 'tipoDenunciante.rutDenunciante, ';
        }
        if (datos.denuncianteForm.nombreDenunciante === undefined || !datos.denuncianteForm.nombreDenunciante){
            error+= 'tipoDenunciante.nombreDenunciante, ';
        }
        if (datos.denuncianteForm.telDenunciante === undefined || !datos.denuncianteForm.telDenunciante){
            error+= 'tipoDenunciante.telDenunciante, ';
        }
    }
    return error
}

const validarTipoAdmision = (datos) => {
    let error=""
    if (datos.tipoAdmision !== undefined || datos.tipoAdmision){ //si hay tipoadmision
        if (datos.tipoAdmision.Id === undefined || !datos.tipoAdmision.Id){
            error+= 'tipoAdmision.Id, ';
        }
        if (datos.tipoAdmision.Codigo === undefined || !datos.tipoAdmision.Codigo){
            error+= 'tipoAdmision.Codigo, ';
        }
        if(datos.tipoAdmision.Id == 4){ //ley 19394
            if (datos.licencias===undefined || datos.licencias.length<=0){
                error+= 'licencia, ';
            }
        }
    }
    return error
}

const validarSucursalEmpresa= (datos) => {
    let error=""
    if (datos.tipoAdmision.Id === 5)
        return error
    if (datos.SucursalEmpresaObjeto === undefined || !Object.keys(datos.SucursalEmpresaObjeto).length>0){
        error+= 'SucursalEmpresaObjeto, ';
    } else {
        if (datos.SucursalEmpresaObjeto.codigo === undefined || !datos.SucursalEmpresaObjeto.codigo)
            error+= 'SucursalEmpresaObjeto.codigo, ';

        if (datos.SucursalEmpresaObjeto.direccion === undefined || !datos.SucursalEmpresaObjeto.direccion)
            error+= 'SucursalEmpresaObjeto.direccion, ';
    }
    if (datos.sucursalCargo === undefined || !datos.sucursalCargo)
             error+= 'sucursalCargo, ';

    return error
}

const validarComuna = (datos)=> {
    let error=""
    if (datos.tipoAdmision.Id === 5)
        return error
    if (datos.comunaSiniestro === undefined || !Object.keys(datos.comunaSiniestro).length>0){
        error+= 'comunaSiniestro, ';
    } else {
        if (datos.comunaSiniestro.codigo_region === undefined || !datos.comunaSiniestro.codigo_region)
            error+= 'comunaSiniestro.codigo_region, ';

        if (datos.comunaSiniestro.codigo_comuna === undefined || !datos.comunaSiniestro.codigo_comuna)
            error+= 'comunaSiniestro.codigo_comuna, ';

        if (datos.comunaSiniestro.nombre === undefined || !datos.comunaSiniestro.nombre)
            error+= 'comunaSiniestro.nombre, ';
    }
    return error
}

const validarEpMolestias = (datos) => {
    let error=""
    if (datos.mismasMolestias === undefined)
        error+= 'mismasMolestias, ';

    if (datos.molestiasAnterioresEP === undefined)
        error+= 'molestiasAnterioresEP, ';

    if (datos.TrabajoMolestiasEP === undefined || !datos.TrabajoMolestiasEP)
        error+= 'TrabajoMolestiasEP, ';
    
    return error
}
const validarEnfermedadProfesional= (datos) =>{
    let error=""
    if (datos.molestiaEP === undefined || !datos.molestiaEP)
        error+= 'molestiaEP, ';

    if (datos.FechaSintomasEP === undefined || !datos.FechaSintomasEP)
        error+= 'FechaSintomasEP, ';

    if (datos.FechaExposicionAgenteEP === undefined || !datos.FechaExposicionAgenteEP)
        error+= 'FechaExposicionAgenteEP, ';

    if (datos.parteAfectadaEP === undefined || !datos.parteAfectadaEP)
        error+= 'parteAfectadaEP, ';

    if (datos.AgenteCausaEP === undefined || !Object.keys(datos.AgenteCausaEP).length>0){
        error+= 'AgenteCausaEP, ';
    } else {
        if (datos.AgenteCausaEP.id === undefined || !datos.AgenteCausaEP.id)
            error+= 'AgenteCausaEP.id, ';
    }
    error+=validarEpMolestias(datos)

    return error
}

const validarAccidenteTrabajo = (datos) => {
    let error=""
    if (datos.lugarAccidente === undefined || !datos.lugarAccidente)
        error+= 'lugarAccidente, ';

    if (datos.tipoAdmision.Id != 5 && (datos.sucursalEmpresaSiniestro === undefined || !Object.keys(datos.sucursalEmpresaSiniestro).length>0)){
        error+= 'sucursalEmpresaSiniestro, ';
    } 
    else if (datos.sucursalEmpresaSiniestro.description === undefined || !datos.sucursalEmpresaSiniestro.description){
        error+= 'sucursalEmpresaSiniestro.description, ';
    }
    if (datos.desarrollarTrabajoHabitual === undefined)
        error+= 'desarrollarTrabajoHabitual, ';

    if (datos.relatoAccidente === undefined || !datos.relatoAccidente)
        error+= 'relatoAccidente, ';

    if (datos.tipoAdmision.Id != 5 && (datos.lugarReferenciaSiniestro === undefined || !datos.lugarReferenciaSiniestro))
        error+= 'lugarReferenciaSiniestro, ';

    if (datos.AccidenteEnSucursal === undefined)
        error+= 'AccidenteEnSucursal, ';

    return error
}

const validarJornadaLaboral = (datos) => {
    let error=""
    if (datos.tipoAdmision.Id != 5 && (datos.tipoJornadaForm === undefined || !Object.keys(datos.tipoJornadaForm).length>0)){
        error+= 'tipoJornadaForm, ';
    } else {
        if (datos.tipoAdmision.Id != 5 && (datos.tipoJornadaForm.id === undefined || !datos.tipoJornadaForm.id))
            error+= 'tipoJornadaForm.id, ';
    }
    if (datos.inicioJornadaLaboral === undefined || !datos.inicioJornadaLaboral)
        error+= 'inicioJornadaLaboral, ';

    if (datos.finJornadaLaboral === undefined || !datos.finJornadaLaboral)
        error+= 'finJornadaLaboral, ';
    
    return error
}

const validarCriteriosForm = (datos) => {
    let error=""
    if (datos.criteriosForm === undefined || !Object.keys(datos.criteriosForm).length>0){
        error+= 'criteriosForm, ';
    } else {
        if (datos.criteriosForm.id === undefined || !datos.criteriosForm.id)
            error+= 'criteriosForm.id, ';
    }

    return error
}

const validarContratacion = (datos) => {
    let error=""
    if (datos.tipoDeContrato === undefined || !Object.keys(datos.tipoDeContrato).length>0){
        error+= 'tipoDeContrato, ';
    } else {
        if (datos.tipoDeContrato.id === undefined || !datos.tipoDeContrato.id)
            error+= 'tipoDeContrato.id, ';
    }

    if (datos.tipoRemuneracion === undefined || !Object.keys(datos.tipoRemuneracion).length>0){
        error+= 'tipoRemuneracion, ';
    } else if (datos.tipoRemuneracion.id === undefined || !datos.tipoRemuneracion.id){
            error+= 'tipoRemuneracion.id, ';
    }
    return error
}
const validarDatosLaborales = (datos) => {
    let error=""
    if (datos.ingresoTrabajoActual === undefined || !datos.ingresoTrabajoActual)
        error+= 'ingresoTrabajoActual, ';

    error+=validarContratacion(datos)

    if (datos.categoriaOcupacionalForm === undefined || !Object.keys(datos.categoriaOcupacionalForm).length>0){
        error+= 'categoriaOcupacionalForm, ';
    } else {
        if (datos.categoriaOcupacionalForm.id === undefined || !datos.categoriaOcupacionalForm.id)
            error+= 'categoriaOcupacionalForm.id, ';
    }

    return error

}

const validarOtrosDatosLaborales= (datos) => {
    let error =""
    if (datos.profesionForm === undefined || !Object.keys(datos.profesionForm).length>0){
        error+= 'profesionForm, ';
    } else {
        if (datos.tipoAdmision.Id != 5 && (datos.profesionForm.codigo === undefined || !datos.profesionForm.codigo))
            error+= 'profesionForm.codigo, ';
    }
    if (datos.cargoForm === undefined || !datos.cargoForm)
        error+= 'cargoForm, ';
    
    return error
}

const validarTipoSiniestro = (datos) => {
    let error =""
    if (datos.tipoAdmision.Id === 5)
        return error
    if (datos.tipoSiniestro.Id < 3){ // trabajo
        if (datos.fechaHoraSiniestro === undefined || !datos.fechaHoraSiniestro)
            error+= 'fechaHoraSiniestro, ';

        error+=validarAccidenteTrabajo(datos)
        error+=validarComuna(datos)
        
        if (datos.tipoSiniestro.Id == 2){     // trayecto
            if (datos.tipoAccTrayecto === undefined || !datos.tipoAccTrayecto)
                error+= 'tipoAccTrayecto, ';
        }
        error+=validarCriteriosForm(datos)
    } else if (datos.tipoSiniestro.Id == 3){ // ep
        error+=validarEnfermedadProfesional(datos)
    }
    return error
} 

const validarRazonSocial = (datos) => {
    let error =""
    if (datos.tipoAdmision.Id === 5)
        return error
    if (datos.razonSocial === undefined || !Object.keys(datos.razonSocial).length>0){
        error+= 'razonSocial, ';
    } else {
        if (datos.razonSocial.name === undefined || !datos.razonSocial.name)
            error+= 'razonSocial.name, ';
    }
    return error
}

const validarAfpForm = (datos) => {
    let error=""
    if (datos.tipoAdmision.Id != 5 && (datos.afpForm === undefined || !Object.keys(datos.afpForm).length>0)){
        error+= 'afpForm, ';
    } else {
        if (datos.tipoAdmision.Id != 5 && (datos.afpForm.codigo === undefined || !datos.afpForm.codigo))
            error+= 'afpForm.codigo, ';
    }
    return error
}

const validarIsaPreSeleccionado = (datos) => {
    let error =""
    if (datos.isapreSeleccionado === undefined || !Object.keys(datos.isapreSeleccionado).length>0){
        error+= 'isapreSeleccionado, ';
    } else {
        if (datos.isapreSeleccionado.id === undefined || !datos.isapreSeleccionado.id)
            error+= 'isapreSeleccionado.id, ';
    }
    return error
}

const ValidarCamposObligatorios = async(datos) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async function(resolve) {
        let error = ""

        // campos requiridos para crear episodio
        error+=validarPaciente(datos) 

        if (datos.datosAdicionalesSAP === undefined || !Object.keys(datos.datosAdicionalesSAP).length>0){
            error+= 'datosAdicionalesSAP, ';
        } else {
            error+=camposDatosAdicionalesSAP(datos) 
        }
        // campos requiridos para crear episodio  
        
        // campos requiridos para crear siniestro
        if (datos.tipoSiniestro === undefined || !datos.tipoSiniestro){
            error+= 'tipoSiniestro, ';
        } else {
            if (datos.tipoSiniestro.Id === undefined || !datos.tipoSiniestro.Id){
                error+= 'tipoSiniestro.Id, ';
            } else {
                error+=validarRazonSocial(datos)
                error+=validarJornadaLaboral(datos)
                error+=validarDatosLaborales(datos)
                error+=validarIsaPreSeleccionado(datos)
                error+=validarAfpForm(datos)
                error+=validarOtrosDatosLaborales(datos)
                error+=validarSucursalEmpresa(datos)
                error+=validarTipoSiniestro(datos)
            }
        }
        error+=validarTipoAdmision(datos) 
        error+=validarDenunciante(datos)
        error+=validarResponsable(datos)
        // campos requiridos para crear siniestro
            
        if (error!="") error = error.slice(0, -2)+" obligatorio(s)";

        resolve(error)
    });
}

const handleAction = (info) => {
    let action = 0;
    const { id_tipo, id_estado } = info
    switch (id_tipo) {
        case 1: // episodio
                switch (id_estado) {
                    case 2: // enproceso
                        action = 1 // reenviar id episodio obtenido
                    break;
                    case 3: // creado
                        action = 2 // crear solo siniestro a partir de episodio obtenido
                        break;
                    case 4: // rechazado
                    case 5: // episodio no creado
                        action = 0 // flujo normal
                        break;
                    default:
                        break;
                }

            break;

        case 2: // siniestro

        switch (id_estado) {
                case 2: // enproceso
                    action = 3 // reenviar id siniestro obtenido 
                break;
                case 3: // creado
                case 7: // error en documentos
                case 8: // error cambio status
                    action = 4 // retornar data
                break;
                case 4: // rechazado
                case 6: // siniestro no creado
                case 9: // error de episodio vacio
                case 10: // error de episodio no valido
                    action = 0 // flujo normal
                break;
                default:
                    break;
            }
            break;
        default:
            break;
    }

    return action
}

const handleConectionSAP = async(datos) => {
    return sapHttpPostResponse(datos.URL, datos.DATA).then(res => {
        return res;
    }).catch(err => {
        InsightTrace("Error en conexion con SAP", 3, err);
        return err;
    });
}

const handleInfoAdmision = async(rut) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async function(resolve) {
        try {
            const data = await httpGetRequest(getInfoAdmisionByIDUnify(rut));
            resolve({ ok: true, data, error: null });
        } catch (error) {
            resolve({ ok: false, data: [], error });
        }
    });
};

const obtieneFirmaMedico = async(rut) => {
    return new Promise(async function(resolve, reject) {
        await sapHttpPostResponse(firmaMedico(), {Rut_profesional: rut.replace(/\./g, '')}).then((result) => {
            if (result.status < 300) {
                if(result.data.MT_ObtieneFIrmaProf_Response.Codigo_profesional === '' || !isBase64String(result.data.MT_ObtieneFIrmaProf_Response.Firma_b64)){
                    resolve({ ok: false, data: [], error: 'No se encontró firma para el profesional' })
                }else{
                    resolve({ ok: true, data: result.data.MT_ObtieneFIrmaProf_Response.Firma_b64, error: null });
                }
            } else {
                reject(result.data)
            }
        }).catch((error) => {
            reject(error)
        })
    });
}


module.exports = {
    ValidarCamposObligatorios,
    handleAction,
    handleConectionSAP,
    handleInfoAdmision,
    obtieneFirmaMedico
}