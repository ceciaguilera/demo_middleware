// METADATA ADICIONAL PARA DOCUMENTOS DINAMICOS
// const { formatearFechaHoraResponsable } = require("../../extraccionData");

const e = require("express")

exports.metadataDireccionTrabajo = (dataDireccion, comuna) => {
  let comu = ""
  if (Object.keys(comuna).length > 0){
    comu = comuna.nombre;
  }
      try {
        return {
          DireccDestAcc: dataDireccion,
          ComunaDestAcc: comu
        }
      } catch (e){
        return {
          DireccDestAcc: "",
          ComunaDestAcc: ""
        }
      }
  }

exports.metadataDireccionAccidente = (data) => {
    if (data.sucursalEmpresaSiniestro !== undefined)
      { try {

        let comu = ""
        if (Object.keys(data.comunaSiniestro).length > 0){
          const {nombre} = data.comunaSiniestro
          comu = nombre;
        }
      } catch (e){
        return {}
      } }

    else { return {} }
  }

exports.metadataTipoTrayecto = (key) => {
    if (key === undefined)
      return {}

    return {
      HabitacionT: key === "1"?"X":"",
      EntreTrabaj: key === "2"?"X":"",
      TrabajoHabitacion: key === "3"?"X":""
    }
  }

exports.metadataTestigosTrayecto = (meta, infoTest) => {
    return {
      CuentaTestigS: meta.TestigoS,
      CuentaTestigN: meta.TestigoN,
      NombreTesti: infoTest.nombre
    }
  }


exports.metadataAvisoTrayecto = (data) => {
    let aviso = {}
    if (Object.keys(data.fechaHoraResponsable).length === 0){
      aviso = {
        ...aviso,
        siAviso: "",
        noAviso: "X",
        fechaAviso: "",
        horaAviso: ""
      }
    }
    else {
      let fechaResponsable = data.fechaHoraResponsable ? `${data.fechaHoraResponsable.split(" ")[0].replace(/[-]/g, '.')}` : "00.00.0000";
      let horaResponsable = data.fechaHoraResponsable? `${data.fechaHoraResponsable.split(" ")[1]}:00` : "00:00:00";

      aviso = {
        ...aviso,
        siAviso: "X",
        noAviso: "",
        fechaAviso: fechaResponsable,
        horaAviso: horaResponsable
      }
    }

    return {
      quienNombre: data.responsable.nombre,
      quienCargo: data.responsable.cargo,
      ...aviso

    }
  }

exports.obtTrabajadorIndependiente = (trabajador) => {
    if (trabajador === "Si"){
      return {
          TraIndDecRen: "X",
          TraIndNODecRen: ""
        }
    }
    else if (trabajador === "No"){
      return {
            TraIndDecRen: "",
            TraIndNODecRen: "X"
        }
    }
    else
    { return {} }
  }