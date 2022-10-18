const Router = require("express-promise-router")
const apiResponseObject = require("../Utils/ApiUtil/apiResponseObjectReducer")
const apiResponse = require("../Utils/ApiUtil/apiResponseReducer")
const {getFinalDate,getInitialDate} = require("../Utils/DateTimeUtil/DateTime")
const getConfigCotizacion = require("../Request/cotizacion")
const { getConfigPaciente, setCorreoPaciente } = require("../Request/paciente")
const {
    getConfigVigencia,
    getConfigSucursalesVigentes,
} = require("../Request/empresa")
const get = require("../Utils/ApiUtil/http")
const getCotizacionModel = require("../Models/cotizacionModel")
const getConfigSinietsro = require("../Request/sinietsro")
const getConfigCitasFuturas = require("../Request/citas")
const {
    getDate,
    getHora,
    getDateObj
} = require("../Utils/DateUtil")
const { handleErrorResponse } = require('../Utils/helpers')
const { validarCorreo } = require('../Utils/validaciones')
const { sapHttpPostResponse } = require("../Utils/ApiUtil/sapHttpPost")

const route = new Router();

const isOk = (array) => {
    return Array.isArray(array) && array.length > 0;
};
const getResultSap = (response) => {
    if (
        response !== null &&
        response.d !== null &&
        Array.isArray(response.d.results)
    ) {
        return response.d.results;
    }
    return [];
};

route.get('/validate', async(req, res) => {
    try {
        let { rutEmpresa, BpSucursal, rutPaciente } = req.query;

        if (!rutEmpresa || !BpSucursal || !rutPaciente) {
            let response = apiResponse(handleErrorResponse("Faltan datos en los parámetros"), "Faltan datos")
            return res.status(400).json(response)
        } else {

            const parallel = require('run-parallel')

            rutPaciente = (rutPaciente && typeof rutPaciente === 'string') ? rutPaciente.replace(/\./g, '').toUpperCase() : ""
            rutEmpresa = (typeof rutEmpresa === 'string') ? rutEmpresa.replace(/\./g, '').toUpperCase() : ""

            parallel([
                    async function(callback) {
                        //validar empresa
                        var Empresa = "NoAfiliada"

                        try {
                            const vigenciaEmpresa = await get(getConfigVigencia(rutEmpresa))

                            if (vigenciaEmpresa.status == 200) {
                                if (vigenciaEmpresa.data) {
                                    const vigenciaEmpresaFormateada = getResultSap(vigenciaEmpresa.data)

                                    if (Array.isArray(vigenciaEmpresaFormateada) && vigenciaEmpresaFormateada.length > 0) {
                                        const {
                                            ESTATUS_EMPRESA
                                        } = vigenciaEmpresaFormateada[0]
                                        if (ESTATUS_EMPRESA === 'VIGENTE') {
                                            Empresa = "Afiliada"
                                        }

                                        callback(null, Empresa)
                                    }

                                } else {
                                    callback({ status: 409, statusData: "Error de estructura de data" }, "")
                                }
                            } else {
                                callback({ status: 409, statusData: cotizacion }, "")
                            }

                        } catch (error) {
                            callback({ status: 500, statusData: error.message }, "")
                        }
                    },
                    async function(callback) {
                        //Obtener sucursales vigentes
                        var Sucursal = "NoVigente"

                        try {

                            const sucursalesVigentes = await get(getConfigSucursalesVigentes(rutEmpresa))
                            if (sucursalesVigentes.status == 200) {
                                if (sucursalesVigentes.data) {
                                    const sucursalVigente = sucursalesVigentes.data.length > 0 ? sucursalesVigentes.data.find(({
                                        idSucursal
                                    }) => idSucursal == BpSucursal) : "";

                                    if (typeof sucursalVigente === 'object') {
                                        Sucursal = "Vigente"
                                    }

                                    callback(null, Sucursal)

                                } else {
                                    callback({ status: 409, statusData: "Error de estructura de data" }, "")
                                }
                            } else {
                                callback({ status: 409, statusData: sucursalesVigentes }, "")
                            }

                        } catch (error) {
                            callback({ status: 500, statusData: error.message }, "")
                        }
                    },
                    async function(callback) {
                        //Validar las cotizaciones
                        let CotizacionesPaciente = false                   
                        const { finalMonth, finalYear } = getFinalDate();
                        const { initialMonth, initialYear } = getInitialDate();

                        try {

                            let cotizacion = await get(getConfigCotizacion(rutPaciente,`${initialYear}${initialMonth}`,`${finalYear}${finalMonth}`));
                            // console.log(cotizacion)
                            if (cotizacion.status == 200) {
                                if (cotizacion.data) {
                                    if (Array.isArray(cotizacion.data.resultado)) {
                                        let RUT_Pagador = cotizacion.data.resultado[0].RUT_Pagador;
                                        if (RUT_Pagador === rutEmpresa){
                                            CotizacionesPaciente = true
                                        }
                                    }

                                }
                            }
                            callback(null, CotizacionesPaciente)
                        } catch (error) {
                            callback({ status: 500, statusData: error.message }, "")
                        }
                    }
                ],
                function(error, results) {

                    if (error) {
                        res.status(error.status).json(apiResponse(handleErrorResponse(error.statusData), "Error de conexión"))
                    } else {
                        if (results.length == 3) {
                            const json = {
                                Empresa: results[0],
                                Sucursal: results[1],
                                CotizacionesPaciente: results[2]
                            }
                            let response = apiResponseObject(json, "Operacion exitosa");
                            res.send(response);
                        } else {
                            res.status(409).json(apiResponse(handleErrorResponse("Error de estructura"), "Error de data"))
                        }
                    }
                })
        }
    } catch (error) {
        res.status(500).json(apiResponse(handleErrorResponse(error), "Error de conexión"))
    }
})

const getDataBP = async(rut) => {
    return new Promise(async function(resolve) {
        const respuesta = await get(getConfigPaciente(rut));
        try {
            if (respuesta.status == 200) {
                if (respuesta.data) {
                    if (respuesta.data.length > 0) {
                            resolve({status: 200, data: respuesta.data[0]})
                    } else {
                        resolve({ status: 206, statusData: "No data de Paciente" })
                    }
                } else {
                    resolve({ status: 409, statusData: "Error de estructura de data" })
                }
            } else {
                resolve({ status: 409, statusData: respuesta })
            }
        } catch (error) {
            resolve({ status: 500, statusData: error })
        }
    });
}

route.get("/getPaciente", async(req, res) => {
    try {

        const { rut: rutString } = req.query;

        if (!rutString) {
            let response = apiResponse(handleErrorResponse("Faltan datos en los parámetros"), "Faltan datos")
            return res.status(400).json(response)
        } else {

            const rut = rutString.toUpperCase();
            const parallel = require('run-parallel')

            const { finalMonth, finalYear } = getFinalDate();
            const { initialMonth, initialYear } = getInitialDate();

            const dataBP = await getDataBP(rutString)   
            let respuesta = {}

            if(dataBP.status == 200){
                respuesta = { ...dataBP.data }
                const { TELEFONO, BP, GENERO, MAIL } = dataBP.data
                respuesta.BP = BP;
                respuesta.BP_CREADO = typeof BP != "undefined";
                respuesta.CORREO = `${MAIL == "notienecorreo@achs.cl" || MAIL =="NOTIENECORREO@ACHS.CL" ? "" : MAIL }`
                let Telf = TELEFONO.substring(5, TELEFONO.length - 1)
                respuesta.TELEFONO_PARTICULAR = !TELEFONO ? "" : (Telf.length !== 9 ? "" : Telf)
                if (GENERO.toUpperCase() === "MASCULINO") {
                    respuesta.MASCULINO = "X";
                    respuesta.FEMENINO = ""
                } else {
                    respuesta.MASCULINO = "";
                    respuesta.FEMENINO = "X"
                }
            }else{
                respuesta.BP_CREADO = false
            }

            parallel([
                    async function(callback) {
                        callback(null, respuesta)
                    },
                    async function(callback) {
                        try {
                            let cotizacion = await get(getConfigCotizacion(rut,`${initialYear}${initialMonth}`,`${finalYear}${finalMonth}`)).catch((err) => {
                                callback({ status: 500, statusData: err }, "");
                            });
                            //console.log(cotizacion)
                            if (cotizacion.status == 200) {
                                if (cotizacion.data) {
                                    if (Array.isArray(cotizacion.data.resultado)) {
                                        let RUT_PAGADOR = cotizacion.data.resultado[0].RUT_Pagador;
                                        let NOMBRE_EMPRESA = cotizacion.data.resultado[0].Nombre_Empresa;
                                        callback(null, {
                                            RUT_PAGADOR,
                                            NOMBRE_EMPRESA,
                                            COTIZACIONES: [{ data: cotizacion.data ? cotizacion.data.resultado[0] : [] }]
                                        })
                                    } else {
                                        callback(null, {
                                            RUT_PAGADOR: "",
                                            NOMBRE_EMPRESA:"",
                                            COTIZACIONES: []
                                        })
                                    }

                                } else {
                                    callback({ status: 409, statusData: "Error de estructura de data" }, "")
                                }
                            } else {
                                callback({ status: 409, statusData: cotizacion }, "")
                            }
                        } catch (error) {
                            callback({ status: 500, statusData: error }, "")
                        }
                    },
                    async function(callback) {
                        if (respuesta.BP_CREADO) {
                            let siniestrosResponse = await get(getConfigSinietsro(respuesta.BP)).catch((err) => {
                                callback({ status: 500, statusData: err }, "");
                            });

                            try {
                                if (siniestrosResponse.status == 200) {
                                    if (siniestrosResponse.data) {
                                        if (Array.isArray(siniestrosResponse.data)) {
                                            let siniestrosTemp = siniestrosResponse.data.length > 0 ? siniestrosResponse.data.map(s => {
                                                return {
                                                    "id": s.Id_Siniestro,
                                                    "descripcion": s.DescSiniestro,
                                                    "fecha": getDate(s.FechaPresentacion),
                                                    "fecha_date": getDateObj(s.FechaPresentacion),
                                                    "CUN": s.CodigoUnicoNacionalExerno,
                                                    "codigoUnicoNacionalExterno": s.CodigoUnicoNacionalExerno,
                                                    "cesa": s.CeSanitario,
                                                    "interLComercial": s.InterlComercial,
                                                    "tipoLey": s.DescTipoLey,
                                                    "reposoActivo": s.ReposoActivo,
                                                    "hora": getHora(s.HoraPresentacion),
                                                    "paciente": s.NombreDenunciante
                                                }
                                            }) : []
                                            callback(null, siniestrosTemp)
                                        } else {
                                            callback(null, [])
                                        }
                                    } else {
                                        callback({ status: 409, statusData: "Error de estructura de data" }, "")
                                    }
                                } else {
                                    callback({ status: 409, statusData: siniestrosResponse }, "")
                                }
                            } catch (error) {
                                callback({ status: 500, statusData: error }, "")
                            }
                        } else {
                            callback(null, [])
                        }
                    },
                    async function(callback) {
                        if (respuesta.BP_CREADO) {
                            try {
                                let citasResponse = await get(getConfigCitasFuturas(respuesta.BP)).catch((err) => {
                                    callback({ status: 500, statusData: err }, "");
                                });
                                if (citasResponse.status == 200) {
                                    let array = citasResponse.data
                                    if (array) {
                                        let cita = []
                                        if (Array.isArray(array) && array.length > 0) {
                                            let {
                                                FECHA_CITA,
                                                HORA_CITA,
                                                LUGAR_CONSULTA,
                                                TIPO_ATENCION
                                            } = array[array.length - 1]
                                            cita = {
                                                "fecha": FECHA_CITA,
                                                "hora": HORA_CITA,
                                                "lugar": LUGAR_CONSULTA,
                                                "unidad": TIPO_ATENCION
                                            }
                                        }
                                        callback(null, cita)

                                    } else {
                                        callback({ status: 409, statusData: "Error de estructura de data" }, "")
                                    }
                                } else {
                                    callback({ status: 409, statusData: siniestrosResponse }, "")
                                }
                            } catch (error) {
                                callback({ status: 409, statusData: error }, "")
                            }
                        } else {
                            callback(null, [])
                        }

                    },
                ],
                function(error, results) {
                    if (error) {
                        res.status(error.status).json(apiResponse(handleErrorResponse(error.statusData), error.status == 500 ? "Error de conexión" : "Conflicto"))
                    } else {
                        
                        if (results.length > 0) {

                            json = getCotizacionModel(
                                results[1].RUT_PAGADOR,
                                results[1].COTIZACIONES,
                                results[1].NOMBRE_EMPRESA,
                                rut,
                                "",
                                "",
                                "",
                                results[0].DIRECCION,
                                results[0].TELEFONO_PARTICULAR,
                                results[0].CORREO,
                                results[3],
                                results[2],
                                results[0].BP_CREADO,
                                results[0].APELLIDO_MATERNO,
                                results[0].APELLIDO_PATERNO,
                                results[0].NOMBRES,
                                results[0].CODIGO_ETNIA,
                                results[0].DESCRIPCION_ETNIA,
                                results[0].FECHA_NACIMIENTO,
                                results[0].MASCULINO,
                                results[0].FEMENINO,
                                results[0].CODIGO_NACIONALIDAD,
                                results[0].NACIONALIDAD,
                                results[0].CODIGO_PAIS,
                                results[0].PAIS,
                                results[0].ESTADO_CIVIL,
                                results[0].CODIGO_COMUNA,
                                results[0].BP,
                                results[0].COMUNA,
                            );

                            let response = apiResponseObject(json, "Operacion exitosa");
                            res.send(response);
                        } else {
                            res.status(409).json(apiResponse(handleErrorResponse("Error de estructura"), "Error de data"))
                        }
                    }
                })
        }

    } catch (error) {
        console.log(error.message)
        res.status(500).json(apiResponse(handleErrorResponse(error), "Error de conexión"))
    }
});

route.post("/setCorreoPaciente", async(req, res) => {
    try {
        const { rut, correo } = req.body;
        if (!rut || rut === "")
            return res.status(400).json(apiResponse(handleErrorResponse("Faltan datos en los parámetros: rut"), "Faltan datos"));
        if (validarCorreo(correo) === false)
            return res.status(400).json(apiResponse(handleErrorResponse("No se ha ingresado correo o esta erroneo."), "Error de datos"));

        const envioData = {
            rut: rut.replace(/\./g, ""),
            email: correo
        }
        const respuesta = await sapHttpPostResponse(setCorreoPaciente(), envioData);
        if(respuesta.data.MT_Actemail_Response.codigo === 3)
            return res.status(204).send();
       else 
        return res.status(400).json(respuesta.data.MT_Actemail_Response)

        
        
    } catch (error) {
        console.log(error.message)
        res.status(500).json(apiResponse(handleErrorResponse(error), "Error"))
    }
})

route.get("/getDatosPaciente", async(req, res) => {
    try {
        const { rut } = req.query
        if (!rut) {
            let response = apiResponse(handleErrorResponse("Faltan datos en los parámetros"), "Faltan datos")
            return res.status(400).json(response)
        } else {

            const rutFormat = rut.toUpperCase().replace(/\./g, '');
            const respuesta = await get(getConfigPaciente(rutFormat));

            if (respuesta.status == 200) {
                if (respuesta.data) {

                    const response = apiResponseObject(respuesta.data, "Operacion exitosa");
                    res.send(response);

                } else {
                    res.status(409).json(apiResponse(handleErrorResponse("Error de estructura devuelta por SAP"), "Error de data"))
                }

            } else {
                res.status(409).json(apiResponse(handleErrorResponse(respuesta), "Error de conexión con SAP"))
            }

        }
    } catch (error) {
        res.status(500).json(apiResponse(handleErrorResponse(error), "Error de conexión"))
    }
});

module.exports = route;