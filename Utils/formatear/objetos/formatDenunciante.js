const normalizar = require("../../ApiUtil/String");
const { formatearTelefono } = require("../../extraccionData");

const clasificacionDenunciante = tipoDenunciante => {
    if (parseInt(tipoDenunciante.id) === 0)
        return 2;
    if (Number.isInteger(tipoDenunciante.id))
        return tipoDenunciante.id
    else if (!isNaN(tipoDenunciante.id))
        return parseInt(tipoDenunciante.id)

    return 2
}

const rutDenunciante = (rutDenunciante, rutPaciente) => {
    if (rutDenunciante && rutDenunciante.valid && rutDenunciante.val.length >= 9)
        return rutDenunciante.val.toUpperCase().replace(/\./g, "");
    if (rutPaciente)
        return rutPaciente.toUpperCase().replace(/\./g, "");

    return "";
}

const nombreDenunciante = (nombreDen, datos) => {
    if (nombreDen && nombreDen.val && nombreDen.val.length > 0){
        return normalizar(nombreDen.val);
    }
    else {
        const { nombre, apellidoMaterno, apellidoPaterno } = datos

        return (nombre && apellidoPaterno && apellidoMaterno) ? normalizar(`${nombre} ${apellidoPaterno} ${apellidoMaterno}`) : ""
    }
}

const telefonoDenunciante = (telefonoDenunciante, telefonoPaciente) => {
    if ((!telefonoDenunciante || (telefonoDenunciante.noTel || !telefonoDenunciante.valid)) && telefonoPaciente)
        return formatearTelefono(telefonoPaciente)

    else if (telefonoDenunciante && telefonoDenunciante.val && telefonoDenunciante.valid)
        return formatearTelefono(telefonoDenunciante.val);

    return "000000000";
}

module.exports = {
    clasificacionDenunciante,
    rutDenunciante,
    nombreDenunciante,
    telefonoDenunciante
}