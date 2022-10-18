const {
    formatearFecha,
    formatearTelefono,
    extraerNumeroDireccion,
    formatearHoraSiniestro,
    extraerCalleDireccion
} = require("./extraccionData");

const normalizar = require("./ApiUtil/String");

const mapearAdmisionObjetoInsert = async (datos) => {
    const {
        datosAdicionalesSAP: {
            apellidoMaterno,
            apellidoPaterno,
            nombre,
            fechaNacimiento,
            masculino,
            femenino,
            nacionalidad,
            estadoCivil,
            pais
        },
        rut, // rut
        tipoDocumento,
        telefonoParticular,
        direccionParticular,
        emailusuario,
        centroPacienteForm, // centrosForm, //: { centroData }, //Data centros oriana
        usuarioSAP, // Usuario SAP Aroni
        comunaDireccionParticular,
        grupoEtnico,
        tipoAdmision
    } = datos;
    const actualDateTime = new Date();
    const direccionComuna = direccionParticular.split(",");

    const Region = comunaDireccionParticular ? comunaDireccionParticular.substring(7, 9) : "";
    const Calle = normalizar(extraerCalleDireccion(direccionComuna[0]));
    const Nro = (direccionParticular !== 'undefined' || direccionParticular !== '')? normalizar(extraerNumeroDireccion(direccionParticular)) : 0;
    const Tlf = normalizar(formatearTelefono(telefonoParticular));

    return {
        Admisiones: {
            Paciente: {
                Nombres: nombre ? normalizar(nombre) : "",
                Apellido_pat: apellidoPaterno ? normalizar(apellidoPaterno) : "",
                Apellido_mat: apellidoMaterno ? normalizar(apellidoMaterno) : "",
                Fecha_nacimiento: fechaNacimiento ? formatearFecha(fechaNacimiento) : "",
                Sexo: masculino ? "1" : "" || femenino ? "2" : "",
                titulo: masculino ? "1" : "" || femenino ? "2" : "", // En duro
                Nacionalidad: nacionalidad ? normalizar(nacionalidad) : "",
                Pais_nacimiento: pais ? normalizar(pais) : (nacionalidad ? normalizar(nacionalidad) : ""),
                Estado_civil: estadoCivil ? estadoCivil:1,
                religion: "CR",
                tipo_documento: tipoDocumento ? tipoDocumento:"", // "RU",
                num_documento: rut ? rut.toUpperCase().replace(/\./g, ""):"",
                calle_dom: Calle ? Calle:"",
                numero_dom: Nro ? Nro:0,
                ciuidad: comunaDireccionParticular ? normalizar(String(comunaDireccionParticular.trim()).toUpperCase()) : "",
                region: Region ? Region : 13,
                telefono: Tlf ? Tlf : "",
                etnia: (grupoEtnico && grupoEtnico.id) ? grupoEtnico.id : "00",
                email: emailusuario || ""
            },
            Admision: {
                Fecha_inicio_episodio: formatearFecha(new Date().toISOString()), // Fecha actual
                Tipo_episodio: "01", // Camino Feliz siempre (01) Tipo Ley
                Clase_episodio: "CU",
                Clase_Consulta: tipoAdmision && Object.keys(tipoAdmision).length>0 && tipoAdmision.Codigo ? tipoAdmision.Codigo : "CU", // Camino feliz, CU(Consulta Urgencia)
                Fecha_movimiento: formatearFecha(new Date().toISOString()), // Fecha actual,
                Fecha_fin_movimiento: formatearFecha(new Date().toISOString()), // Fecha actual,
                Hora_movimiento: formatearHoraSiniestro({
                    horas: actualDateTime.getHours(),
                    minutos: actualDateTime.getMinutes()
                }),
                Estado_externo: "RC",
                Unidad_organizativa: (centroPacienteForm && centroPacienteForm.UO_Tratamiento) ? String(centroPacienteForm.UO_Tratamiento).trim() : "",
                Unidad_Org_medica: (centroPacienteForm && centroPacienteForm.UO_Medica) ? String(centroPacienteForm.UO_Medica).trim() : "",
                Num_Medico_Tratamiento: ""
            },

            Usuario_Sap: String(usuarioSAP).toUpperCase().trim() // "MPARRAAR",
        }
    };
};
module.exports = mapearAdmisionObjetoInsert;