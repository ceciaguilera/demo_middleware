const {
    formatearHoraSiniestro,
    extraerDatosDireccion,
    extraerRegionDireccion,
    formatearTelefono,
    formatearFecha,
    concatenarRelatoToSAP,
    mapearCategoriaOcupacional,
    formatDateToSap,
    formatTimeToSap
} = require("../../extraccionData");

const { getLocalDateTime } = require('../../DateUtil')

const normalizar = require("../../ApiUtil/String");

const { SiniestroFormat } = require("../../formatear/siniestro");
const { clasificacionDenunciante, rutDenunciante, nombreDenunciante, telefonoDenunciante } = require("./formatDenunciante");

// Generales
exports.DatosGenerales = (episodioID, tipo_siniestro, tipo_ley, fechaHoraPoliclinico) => {
    const { fechaPoliclinico, horaPoliclinico } = fechaHoraPoliclinico || {}
    const actualDateTime = getLocalDateTime()

    return {
        id_episodio: episodioID ? episodioID : "",
        cun_interno: "",
        cun_externo: "",
        tipo_siniestro: tipo_siniestro ? `${tipo_siniestro}` : "",
        tipo_ley,
        fecha_presentacion: fechaPoliclinico ? fechaPoliclinico : formatDateToSap(actualDateTime),
        hora_presentacion: horaPoliclinico ? `${horaPoliclinico}:00` : formatTimeToSap(actualDateTime)
    }
}

exports.Denunciante = (datos) => {
    const { denuncianteForm, rut, datosAdicionalesSAP, telefonoParticular } = datos;
    try {
        return {
            clasificacion: clasificacionDenunciante(denuncianteForm.tipoDenunciante),
            rut: rutDenunciante(denuncianteForm.rutDenunciante, rut),
            nombre_completo: nombreDenunciante(denuncianteForm.nombreDenunciante, datosAdicionalesSAP),
            telefono: telefonoDenunciante(denuncianteForm.telDenunciante, telefonoParticular)
        }
    }
    catch {
        return {
            clasificacion: 2,
            rut: rut ? rut.toUpperCase().replace(/\./g, "") : "",
            nombre_completo: (datosAdicionalesSAP.nombre && datosAdicionalesSAP.apellidoPaterno && datosAdicionalesSAP.apellidoMaterno) ? normalizar(`${datosAdicionalesSAP.nombre} ${datosAdicionalesSAP.apellidoPaterno} ${datosAdicionalesSAP.apellidoMaterno}`) : "",
            telefono: telefonoParticular ? formatearTelefono(telefonoParticular) : ""
        }
    }
}

exports.CabeceraSiniestro = (SucursalData, razon_social, numero_sucursal, rubro = "", ciuu = "") => {
    const { codigo, direccion } = SucursalData;

    return {
        codigo: codigo ? String(SiniestroFormat(codigo, 10)) : "",
        razon_social: razon_social ? normalizar(razon_social) : "",
        numero_sucursal_achs: numero_sucursal ? String(numero_sucursal).trim() : "",
        direccion_sucursal_achs: direccion ? normalizar(direccion) : "",
        rubro: rubro ? rubro : "",
        CIUU: ciuu ? ciuu : ""
    }
}

exports.OcupasionSin = (tipoJornada, inicioJornadaLaboral, finJornadaLaboral, cargoForm, ProfesionCodigo, ingresoTrabajoActual, IdTipoContrato, categoriaOcupacionalForm, IdTipoRemuneracion, isapre, afp, PuestoTrabajador = "TRABAJADOR", comentarioJornada = "SIN INFORMACION", CajaCompensacion = "") => {
    return {
        tipo_jornada: tipoJornada ? String(tipoJornada) : "",
        comentario_jornada: comentarioJornada ? comentarioJornada : "",
        horario_inicio: inicioJornadaLaboral ? `${inicioJornadaLaboral}:00` : "",
        horario_termino: finJornadaLaboral ? `${finJornadaLaboral}:00` : "",
        ocupacion: normalizar(cargoForm),
        profesion_CIOU: (typeof ProfesionCodigo === "string") ? ProfesionCodigo : String(ProfesionCodigo.codigo),
        puesto_trabajo: normalizar(cargoForm),
        fecha_ingreso_trab: formatearFecha(ingresoTrabajoActual),
        duracion_contrato: IdTipoContrato ? String(IdTipoContrato) : "",
        categoria_ocup: (categoriaOcupacionalForm && categoriaOcupacionalForm.id) ? String(categoriaOcupacionalForm.id) : "",
        dependencia: categoriaOcupacionalForm ? mapearCategoriaOcupacional(categoriaOcupacionalForm) : "",
        remuneracion: IdTipoRemuneracion ? String(IdTipoRemuneracion) : "",
        prevision_salud: isapre ? String(isapre) : "",
        afp: afp ? String(afp) : "",
        caja_compensacion: CajaCompensacion ? CajaCompensacion : ""
    }
}

exports.Siniestro = async (datos) => {
    const {
        fechaHoraSiniestro,
        lugarAccidente,
        sucursalEmpresaSiniestro,
        desarrollarTrabajoHabitual,
        relatoAccidente,
        testigos,
        responsable,
        fechaHoraResponsable,
        lugarReferenciaSiniestro,
        AccidenteEnSucursal,
        comunaSiniestro,
        tipoAccTrayecto,
        criteriosForm,
        coberturaSoap,
        testigoTrabajo = false
    } = datos;

    const direccionSiniestro = extraerDatosDireccion(sucursalEmpresaSiniestro.description);

    let comuna =
        typeof direccionSiniestro.comuna !== "undefined" ?
        direccionSiniestro.comuna :
        "";

    let Relato = (concatenarRelatoToSAP(normalizar(relatoAccidente), testigos, responsable, fechaHoraResponsable, testigoTrabajo)).toUpperCase()

    let comunaSiniester = ""

    if (Object.keys(comunaSiniestro).length > 0) {
        comunaSiniester = "0000000"+comunaSiniestro.codigo_region+comunaSiniestro.codigo_comuna;
    }
    let Region = comunaSiniester ? comunaSiniester.substring(7, 9) : ""

    const fechaAccidente = typeof fechaHoraSiniestro === 'string' ? fechaHoraSiniestro.split(" ")[0].replace(/[-]/g, '.') : "00.00.0000"
    const horaAccidente = `${typeof fechaHoraSiniestro === 'string' ? fechaHoraSiniestro.split(" ")[1] : "00:00"}:00`
    const calle = (direccionSiniestro && direccionSiniestro.calle) ? normalizar(direccionSiniestro.calle) : ''
    const numero = (direccionSiniestro && direccionSiniestro.numero) ? normalizar(direccionSiniestro.numero) : 0

    return buildSiniestroResponse({ fechaAccidente, horaAccidente, calle, numero, comunaSiniester, comuna, Region, lugarReferenciaSiniestro, lugarAccidente, Relato, desarrollarTrabajoHabitual, criteriosForm, tipoAccTrayecto, AccidenteEnSucursal, coberturaSoap })
}

// Enfermedad Profesional
exports.AntecedentesAccidentes = (data) => {
    const { molestiaEP, FechaSintomasEP, FechaExposicionAgenteEP, parteAfectadaEP, AgenteCausaEP, mismasMolestias, molestiasAnterioresEP, TrabajoMolestiasEP } = data;

    return {
        descripcion_molestias_sintomas: molestiaEP ? normalizar(molestiaEP) : "",
        fecha_inicio_sintomas: FechaSintomasEP ? `${FechaSintomasEP}` : "",
        parte_cuerpo_afectada: parteAfectadaEP ? normalizar(parteAfectadaEP) : "",
        unicacion_lesion: "900",
        existen_molestias_anteriores: molestiasAnterioresEP ? normalizar(molestiasAnterioresEP) :"",
        agente_sospechoso_causa_molestia: (AgenteCausaEP && AgenteCausaEP.id) ? AgenteCausaEP.id : "",
        existen_companeros_misma_molestia: mismasMolestias ? normalizar(mismasMolestias) : "",
        fecha_exposicion_agente: FechaExposicionAgenteEP ? `${FechaExposicionAgenteEP}` : "",
        trabajo_momento_molestias: TrabajoMolestiasEP ? normalizar(TrabajoMolestiasEP) : ""
    }
}

// helpers
const buildSiniestroResponse = data => {
    return {
        fecha_accidente: data.fechaAccidente,
        hora_accidente: data.horaAccidente,
        calle: data.calle,
        numero: data.numero,
        comuna: data.comunaSiniester ? data.comunaSiniester : '',
        pais: 'CL',
        localidad: data.comuna ? normalizar(data.comuna) : '',
        region: data.Region ? data.Region : '',
        lugar_accidente: '9',
        sitio_especifico_accidente: data.lugarReferenciaSiniestro ? normalizar(String(data.lugarReferenciaSiniestro)) : '',
        que_hacia_trabajador: data.lugarAccidente ? normalizar(data.lugarAccidente).toUpperCase() : '',
        mecanismo_accidente: '92',
        que_paso_accidente: data.Relato ? normalizar(data.Relato) : '',
        agente_accidente: '700',
        desarrollaba_trabajo_habitual: data.desarrollarTrabajoHabitual ? normalizar(data.desarrollarTrabajoHabitual).toUpperCase() : '',
        criterio_gravedad: (data.criteriosForm && data.criteriosForm.id) ? data.criteriosForm.id : '',
        tipo_accidente_trayecto: data.tipoAccTrayecto !== undefined ? data.tipoAccTrayecto : '',
        parte_cuerpo_afectada: '900',
        accidente_ocurrio_en_sucursal: data.AccidenteEnSucursal ? String(data.AccidenteEnSucursal).trim().toUpperCase() : '',
        cobertura_soap: data.coberturaSoap ? data.coberturaSoap : ''
    }
}