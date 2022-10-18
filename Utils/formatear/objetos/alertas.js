const {
    alertaPorDefecto
} = require("../../extraccionData");

exports.AlertaTrabajo = function(razonAlertaForm, tipo){
    let motivo = "";

    const item = razonAlertaForm && razonAlertaForm.length > 0 && razonAlertaForm.find(a => a.id === 1)
    if (razonAlertaForm && razonAlertaForm.length > 0 && Boolean(item))
      motivo = !item.causasID ? '' : item.causasID < 10 ? `0${item.causasID}` : `${item.causasID}`

    return {
        posible_causa_nolaboral:
          razonAlertaForm && razonAlertaForm.length > 0 &&
          Boolean(razonAlertaForm.find(a => a.glosa === "Posible causa no laboral".trim()))
            ? "X"
            : "", // "X",
        dir_sindical_cometido_gremial:
          razonAlertaForm && razonAlertaForm.length > 0 &&
          Boolean(razonAlertaForm.find(a => a.glosa === "Dirigente sindical en cometido gremial".trim()))
            ? "X"
            : "",
        trabajo_distancia:
          razonAlertaForm && razonAlertaForm.length > 0 &&
          Boolean(razonAlertaForm.find(a => a.glosa === "Trabajo a distancia".trim()))
            ? "X"
            : "",
        fuerza_mayor_extrana:
          razonAlertaForm && razonAlertaForm.length > 0 &&
          Boolean(razonAlertaForm.find(a => a.glosa === "Fuerza mayor extraña".trim()))
            ? "X"
            : "",
        acc_control_medico:
          razonAlertaForm && razonAlertaForm.length > 0 &&
          Boolean(razonAlertaForm.find(a => a.glosa === "Accidente en control médico".trim()))
            ? "X"
            : "",
        teletrabajo:
            razonAlertaForm && razonAlertaForm.length > 0 &&
            Boolean(razonAlertaForm.find(a => a.glosa === "Teletrabajo".trim()))
              ? "X"
              : "",

        no_registra_alerta: tipo === 1 ? alertaPorDefecto(razonAlertaForm):"",
        motivo
      }
}

exports.AlertaTrayecto = function(razonAlertaForm){
    return {
        dir_sindical_cometido_gremial:
          razonAlertaForm && razonAlertaForm.length > 0 &&
          Boolean(razonAlertaForm.find(a => a.glosa === "Dirigente sindical en cometido gremial".trim()))
            ? "X"
            : "",
        trabajo_distancia:
          razonAlertaForm && razonAlertaForm.length > 0 &&
          Boolean(razonAlertaForm.find(a => a.glosa === "Trabajo a distancia".trim()))
            ? "X"
            : "",
        fuerza_mayor_extrana:
          razonAlertaForm && razonAlertaForm.length > 0 &&
         Boolean(razonAlertaForm.find(a => a.glosa === "Fuerza mayor extraña".trim()))
            ? "X"
            : "",
        acc_control_medico:
          razonAlertaForm && razonAlertaForm.length > 0 &&
          Boolean(razonAlertaForm.find(a => a.glosa === "Accidente en control médico".trim()))
            ? "X"
            : "",
        teletrabajo:
          razonAlertaForm && razonAlertaForm.length > 0 &&
          Boolean(razonAlertaForm.find(a => a.glosa === "Teletrabajo".trim()))
            ? "X"
            : "",
        no_registra_alerta: alertaPorDefecto(razonAlertaForm)
      }
}

exports.AlertaEnfermedadProf = function(razonAlertaForm){
    return {
        dir_sindical_cometido_gremial:
          razonAlertaForm && razonAlertaForm.length > 0 &&
          Boolean(razonAlertaForm.find(a => a.glosa === "Dirigente sindical en cometido gremial".trim()))
            ? "X"
            : "",
        trabajo_distancia:
          razonAlertaForm && razonAlertaForm.length > 0 &&
          Boolean(razonAlertaForm.find(a => a.glosa === "Trabajo a distancia".trim()))
            ? "X"
            : "",
        teletrabajo:
          razonAlertaForm && razonAlertaForm.length > 0 &&
          Boolean(razonAlertaForm.find(a => a.glosa === "Teletrabajo".trim()))
            ? "X"
            : "",
        no_registra_alerta: alertaPorDefecto(razonAlertaForm)
      }
}