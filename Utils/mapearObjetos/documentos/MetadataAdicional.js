const {
    metadataTestigosTrayecto,
    obtTrabajadorIndependiente,
    metadataAvisoTrayecto,
    metadataDireccionTrabajo,
    metadataDireccionAccidente,
    metadataTipoTrayecto
} = require("../../formatear/objetos/metadata")

exports.ProcesaMetadata = (data) => {
    const {
        CamposDocumentos,
        TrabajadorIndependiente,
        sucursalTrabajoTrayecto,
        comunaTrabajoTrayecto,
        tipoSiniestro,
        DireccionEmpresa,
        comunaEmpresa
    } = data;

    const independiente = obtTrabajadorIndependiente(TrabajadorIndependiente);
    const testigos = metadataTestigosTrayecto(CamposDocumentos, data.testigos);
    const aviso = metadataAvisoTrayecto(data);
    const direccionTrabajo = tipoSiniestro.Id === 2 ? metadataDireccionTrabajo(sucursalTrabajoTrayecto.description ? sucursalTrabajoTrayecto.description.split(",")[0] : "", comunaTrabajoTrayecto) : metadataDireccionTrabajo(DireccionEmpresa, comunaEmpresa)
    const direccionAccidente = metadataDireccionAccidente(data)

    const tipoTrayecto = metadataTipoTrayecto(data.tipoAccTrayecto)

    return {

        ...testigos,
        ...independiente,
        ...aviso,
        ...direccionTrabajo,
        ...direccionAccidente,
        ...CamposDocumentos,
        ...tipoTrayecto
    }
}