/**
 * El modelo repesenta  al paciente si es o no afiliado a la ACHS
 * es decir registra cotizacion de hace dos meses atras desde la fecha actual
 *
 * @param {*} rutPagador
 * @param {*} nombreEmpresa
 * @param {*} rutTrabajador
 */
const getCotizacionModel = (
    RutPagador,
    Cotizaciones,
    NombreEmpresa,
    RutTrabajador,
    SucursalEmpresa,
    DireccionEmpresa,
    comunaEmpresa,
    direccionParticular,
    telefonoParticular,
    correoParticular,
    cita,
    siniestros,
    BpCreado,
    apellidoMaterno,
    apellidoPaterno,
    nombre,
    idEtnia,
    descripcionEtnia,
    fechaNacimiento,
    masculino,
    femenino,
    nacionalidad,
    descripcionNacionalidad,
    pais,
    descripcionPais,
    estadoCivil,
    codigoComuna,
    BP,
    comuna
) => {
    return {
        BpCreado,
        NombreEmpresa,
        RutPagador,
        Cotizaciones,
        RutTrabajador,
        SucursalEmpresa,
        DireccionEmpresa,
        comunaEmpresa,
        direccionParticular,
        telefonoParticular,
        correoParticular,
        cita,
        siniestros,
        apellidoMaterno,
        apellidoPaterno,
        nombre,
        idEtnia,
        descripcionEtnia,
        fechaNacimiento,
        masculino,
        femenino,
        nacionalidad,
        descripcionNacionalidad,
        pais,
        descripcionPais,
        estadoCivil,
        codigoComuna,
        BP,
        comuna 
    };
};

module.exports = getCotizacionModel;