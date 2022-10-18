const Router = require("express-promise-router");
const { insertarAdmision } = require("../Request/database");
const { httpPost } = require("../Utils/ApiUtil/httpRequests");
const MapearTrabajoTrayectoInsert = require("../Utils/mapearObjetos/siniestroInsert/TrabajoTrayecto");
const MapearEPInsert = require("../Utils/mapearObjetos/siniestroInsert/Ep");
const apiResponseReducer = require("../Utils/ApiUtil/apiResponseReducer");
const { handleErrorResponse, formatRut, getAdmisionId } = require('../Utils/helpers');
const { ValidarCamposObligatorios, handleConectionSAP, handleInfoAdmision } = require('../Utils/integracionSap');
const { InsightTrace, InsightEvent } = require("./../Utils/ApiUtil/appInsight");
const { ResErrorRequestLimit, checkRequestLimit } = require("../Utils/ApiUtil/requestLimit");
const route = new Router();

route.post("/", async(req, res) => {
    let rut_paciente = formatRut(req.body.rut_paciente);
    InsightEvent("Creación IdSiniestro: " + rut_paciente, req);

    const {
        body,
        body: { admision_json, Episodio, mail_admisionista, id_tipo, id_estado }
    } = req;

    let insightsData = {
        rutPaciente: rut_paciente,
        admisionista: mail_admisionista,
        idTipo: id_tipo,
        idEstado: id_estado,
        episodio: Episodio,
        tipoAdmision: admision_json.tipoAdmision.Descripcion,
        tipoSiniestro: admision_json.tipoSiniestro.Descripcion
    };

    try {
        InsightTrace(`[Admision][Siniestro] rut=${rut_paciente} episodio=${Episodio} solicita siniestro ${admision_json.tipoAdmision.Descripcion}`, 1, {...insightsData});

        if (!Episodio)
            return res.status(409).json(apiResponseReducer(handleErrorResponse("Episodio es obligatorio"), ("Faltan datos: Episodio")));

        const Validation = await ValidarCamposObligatorios(admision_json);
        if (Validation){
            res.status(409).json(apiResponseReducer(handleErrorResponse(Validation), ("Faltan datos: "+Validation)));
        } else {
            let action = 0; // defecto flujo normal
            const infoAdmision = await handleInfoAdmision(rut_paciente);

            InsightTrace(
                `[Admision][Siniestro] rut=${rut_paciente} episodio=${Episodio}  obtiene info admision bd`, 1, {
                  ...insightsData,
                  infoAdmision
                }
              );

            const responseInfo = getResponseInfo(infoAdmision);
            action = getActionLevel(responseInfo);

            InsightTrace(`[Admision][Siniestro] rut=${rut_paciente} episodio=${Episodio}  accion siniestro: ${action}`, 1, {...insightsData});

            let respuesta = await Promise.resolve(getRespuesta(action, body, Episodio, responseInfo));

            InsightTrace(`[Admision][Siniestro] rut=${rut_paciente} episodio=${Episodio}  accion=${action} respuesta siniestro`, 1, {
                ...insightsData,
                siniestro: respuesta });

            return returnResponse(res, respuesta);
        }
    } catch (error) {
        InsightTrace(`[Admision][Siniestro] rut=${rut_paciente} episodio=${Episodio}  ocurrio un error interno`, 3, {
            ...insightsData,
            error
          });
        res.status(409).json(apiResponseReducer(handleErrorResponse(error), (error?error.message:"Ha ocurrido un error")));
    }
});

const returnResponse = (res, respuesta) => {
    if (Object.keys(respuesta).length>0){
        if (respuesta.status === 429)
            return res.status(429).json(apiResponseReducer(respuesta, ("Alta demanda en generacion de casos")));
        const { EstadoSiniestro } = respuesta;
        if (EstadoSiniestro === 2 || EstadoSiniestro === 3)
            return res.send(apiResponseReducer(respuesta, "Operación Exitosa"));
        else
            return res.status(409).json(apiResponseReducer(handleErrorResponse({error: "Error proceso", datos: respuesta}), ("Error proceso")));
    }

    return res.status(500).json(apiResponseReducer(handleErrorResponse("Error proceso"), ("Error proceso")));
};

const getActionLevel = (responseInfo) => {
    if (responseInfo.length>0){
        const { idestadoepisodio, idestadosiniestro } = responseInfo[0];
        if (idestadoepisodio === 3) { // retornar
            if (idestadosiniestro === 2) { // reenvio
                return 2;
            }
            if (idestadosiniestro === 3 || idestadosiniestro === 7 || idestadosiniestro === 8) { // retornar
                return 3;
            }
        }
    }

    return 0;
};

const getRespuesta = (action, body, Episodio, responseInfo) => {
    switch (action) {
        case 0:
             // crear siniestro
            return handleSiniestro(body, Episodio, 0);
        case 2: //  reenviar siniestro
            return handleSiniestro(body, Episodio, responseInfo.length>0 ? responseInfo[0].idsiniestro : 0);
        case 3: //  retornar siniestro
            return RetornarSiniestro(responseInfo[0]);
        default:
            return;
    }
};

const getResponseInfo = (infoAdmision) => {
    if (infoAdmision.ok){
        const { content } = infoAdmision.data;
        if (content.length>0)
            return content[0];

        return 0;
    }

    return [];
};

const handleSiniestro = async (body, Episodio, admisionID) => {
    let rut_paciente = formatRut(body.rut_paciente);

    let Response = { DescripcionSiniestro: "No se pudo crear Siniestro", EstadoSiniestro: 0, IdSiniestro: 0 };

    if (Episodio.match("[\\D]+") === null){
        // Armar Json
        const { admision_json } = body;
        let url = decideSapUrl(admision_json.tipoSiniestro.Id);
        let JsonSiniestro = await Promise.resolve(mapJsonObject(admision_json.tipoSiniestro.Id, Episodio, admision_json));
        // Armar Json

        // ID de Base datos
        if (!admisionID>0){
            const dataToInsert = {
                id_tipo: 2,
                id_estado: 2,
                rut_paciente,
                mail_admisionista: body.mail_admisionista,
                admision_json: JsonSiniestro
            };
            const insertaSiniestro = await httpPost(insertarAdmision(), dataToInsert);

            InsightTrace(`[Admision][Siniestro] rut=${rut_paciente} episodio=${Episodio} insertar siniestro`, 1, { insertaSiniestro: { status: insertaSiniestro.status, data: insertaSiniestro.data }, dataToInsert });

            if (insertaSiniestro.status === 200) {
                admisionID = getAdmisionId(insertaSiniestro);
                Response = {
                    IdSiniestro: admisionID,
                    EstadoSiniestro: 2,
                    DescripcionSiniestro: "Siniestro en proceso"
                };
            }
            else {
                Response.EstadoSiniestro = 6;
                Response.DescripcionSiniestro = "Error de Id Siniestro";
            }
        }

        else if (admisionID>0){
            Response.IdSiniestro = admisionID;
            JsonSiniestro.Id_siniestro_digital = admisionID;
            // MAPEAR SINIESTRO

            InsightTrace(`[Admision][Siniestro] rut=${rut_paciente} episodio=${Episodio}  solicitud insertar siniestro a SAP`, 1, { URL: url, siniestro: JsonSiniestro });

            const resultAdmSiniestro = await handleConectionSAP({URL: url, DATA: JsonSiniestro});

            InsightTrace(`[Admision][Siniestro] rut=${rut_paciente} episodio=${Episodio} respuesta SAP siniestro`, 1, { resultAdmSiniestro });

            try {
                checkRequestLimit(resultAdmSiniestro);
            } catch (error){
                InsightTrace(`[Admision][Siniestro] rut=${rut_paciente} episodio=${Episodio} error por request limit`, 2, { error });

                return {status: 429, ...ResErrorRequestLimit(resultAdmSiniestro)};
            }

            Response = {...Response, ...checkResponseByResult(resultAdmSiniestro)};
        }
        else {
            Response.EstadoSiniestro = 6;
            Response.DescripcionSiniestro = "Error de Id Siniestro";
        }
    } else {
        Response.DescripcionSiniestro = "Error de Episodio no válido";
    }

    return Response;
};

const checkResponseByResult = (resultAdmSiniestro) => {
    if (resultAdmSiniestro.status >= 200 && resultAdmSiniestro.status < 300){
        return {
            EstadoSiniestro: 2,
            DescripcionSiniestro: "Siniestro en proceso"
        };
    }

    return {
        DescripcionEpisodio: "Error conexión a SAP al crear Siniestro"
    };
};

const decideSapUrl = (tipoSiniestroId) => {
    switch (tipoSiniestroId) {
        case 1: // Trabajo
        case 2: // Trayecto
            return `${process.env.URLAPIMANAGEMENT}AdmisionDigital/RESTAdapter/CrearSiniestro`;
        case 3: // Enfermedad Profesional
            return `${process.env.URLAPIMANAGEMENT}AdmisionDigital/RESTAdapter/CrearSiniestroEP`;
        default:
            return;
    }
};

const mapJsonObject = (tipoSiniestroId, Episodio, admision_json) => {
    switch (tipoSiniestroId) {
        case 1: // Trabajo
        case 2: // Trayecto
            return MapearTrabajoTrayectoInsert(Episodio, admision_json);
        case 3: // Enfermedad Profesional
            return MapearEPInsert(Episodio, admision_json);
        default:
            return;
    }
};

const RetornarSiniestro = async (data) => {
    return {
        DescripcionEpisodio: data.episodio,
        EstadoEpisodio: data.idestadoepisodio,
        IdEpisodio: data.idepisodio,
        DescripcionSiniestro: data.siniestro,
        EstadoSiniestro: data.idestadosiniestro,
        IdSiniestro: data.idsiniestro
    };
};

route.post("/siniestroId", async(req, res) => {
    let rut_paciente = req.body.rut_paciente.replace(/\./g, "");

    InsightEvent("Creación IdSiniestro: " + rut_paciente, req);

    const {
        body,
        body: { admision_json, Episodio, mail_admisionista, id_tipo, id_estado }
    } = req;

    let insightsData = {
        rutPaciente: rut_paciente,
        admisionista: mail_admisionista,
        idTipo: id_tipo,
        idEstado: id_estado,
        episodio: Episodio,
        tipoAdmision: admision_json.tipoAdmision.Descripcion,
        tipoSiniestro: admision_json.tipoSiniestro.Descripcion
    };

    try {
        InsightTrace(`[Admision][siniestroId] rut=${rut_paciente} episodio=${Episodio} solicita siniestro ${admision_json.tipoAdmision.Descripcion}`, 1, {...insightsData});

        if (!Episodio){
                res.status(409).json(apiResponseReducer(handleErrorResponse("Episodio es obligatorio"), ("Faltan datos: Episodio")));
        } else {
            const Validation = await ValidarCamposObligatorios(admision_json);
            if (Validation){
                res.status(409).json(apiResponseReducer(handleErrorResponse(Validation), ("Faltan datos: "+Validation)));
            } else {
                let action = 0; // defecto flujo normal
                const infoAdmision = await handleInfoAdmision(body.rut_paciente.replace(/\./g, ""));

                InsightTrace(
                    `[Admision][siniestroId] rut=${rut_paciente} episodio=${Episodio} obtiene info admision bd`, 1, {
                      ...insightsData,
                      infoAdmision
                    }
                  );

                const responseInfo = infoAdmision.ok && infoAdmision.data.content.length > 0 ? infoAdmision.data.content[0] : []

                if (responseInfo.length>0){
                    const { idestadoepisodio, idestadosiniestro } = responseInfo[0];

                    if (idestadoepisodio === 3) { // retornar
                        if (idestadosiniestro === 2) { // reenvio
                            action = 2;
                        }
                        if (idestadosiniestro === 3 || idestadosiniestro === 7 || idestadosiniestro === 8) { // retornar
                            action = 3;
                        }
                    }
                }

                InsightTrace(`[Admision][siniestroId] rut=${rut_paciente} episodio=${Episodio} accion siniestro: ${action}`, 1, {...insightsData});

                let respuesta;
                switch (action) {
                    case 0:
                         // crear siniestro
                        respuesta = await handleSiniestroId(body, Episodio, 0, insightsData);
                        break;
                    case 2: //  reenviar siniestro
                        respuesta =await handleSiniestroId(body, Episodio, responseInfo.length>0 ? responseInfo[0].idsiniestro : 0, insightsData);
                        break;
                    case 3: //  retornar siniestro
                        respuesta = await RetornarSiniestro(responseInfo[0]);
                        break;
                    default:
                        break;
                }

                InsightTrace(`[Admision][siniestroId] rut=${rut_paciente} episodio=${Episodio} accion=${action} respuesta siniestro`, 1, {
                    ...insightsData,
                    siniestro: respuesta });

                if (Object.keys(respuesta).length>0){
                    const { EstadoSiniestro } = respuesta;
                    if (EstadoSiniestro === 2 || EstadoSiniestro === 3){
                        InsightTrace(`[Admision][siniestroId] rut=${rut_paciente} episodio=${Episodio} accion=${action} siniestro exitoso`, 1, {...insightsData});

                        return res.send(apiResponseReducer(respuesta, "Operación Exitosa"));
                    } else {
                        InsightTrace(`[Admision][siniestroId] rut=${rut_paciente} episodio=${Episodio} accion=${action} ocurrio un error en el proceso`, 3, {...insightsData});

                        return res.status(409).json(apiResponseReducer(handleErrorResponse({error: "Error proceso", datos: respuesta}), ("Error proceso")));
                    }
                }
            }
        }
    } catch (error) {
        InsightTrace(`[Admision][siniestroId] rut=${rut_paciente} episodio=${Episodio} ocurrio un error interno`, 3, {
            ...insightsData,
            error
          });
        res.status(409).json(apiResponseReducer(handleErrorResponse(error), (error?error.message:"Ha ocurrido un error")));
    }
});

const handleSiniestroId = async (body, Episodio, admisionID, insightsData) => {
    let rut_paciente = body.rut_paciente.replace(/\./g, "");

    let Response = { DescripcionSiniestro: "No se pudo crear Siniestro", EstadoSiniestro: 0, IdSiniestro: 0 };

    if (Episodio.match("[\\D]+") === null){
        // Armar Json
        const { admision_json } = body;
        let JsonSiniestro = {};
        switch (admision_json.tipoSiniestro.Id) {
            case 1: // Trabajo
            case 2: // Trayecto
                JsonSiniestro = await MapearTrabajoTrayectoInsert(Episodio, admision_json);
                break;
            case 3: // Enfermedad Profesional
                JsonSiniestro = await MapearEPInsert(Episodio, admision_json);
                break;

            default:
                Response.DescripcionSiniestro = `Tipo de siniestro "${admision_json.tipoSiniestro.Id}" no es valido.`;
        }
        // Armar Json

        // ID de Base datos
        if (!admisionID>0){
            const dataToInsert = {
                id_tipo: 2,
                id_estado: 2,
                rut_paciente: body.rut_paciente.replace(/\./g, ""),
                mail_admisionista: body.mail_admisionista,
                admision_json: JsonSiniestro
            };
            const insertaSiniestro = await httpPost(insertarAdmision(), dataToInsert);

            if (insertaSiniestro.status === 200) {
                InsightTrace(`[Admision][siniestroId] rut=${rut_paciente} episodio=${Episodio} inserta siniestro exitoso`,
                1,
                {
                    ...insightsData,
                    siniestro: insertaSiniestro.data,
                    status: insertaSiniestro.status
                });

                admisionID = getAdmisionId(insertaSiniestro);
            } else {
                InsightTrace(`[Admision][siniestroId] rut=${rut_paciente} episodio=${Episodio} error al insertar siniestro`,
                3,
                {
                    ...insightsData,
                    status: insertaSiniestro.status
                });
            }
        }
        // ID de Base datos

        if (admisionID>0){
            Response.IdSiniestro = admisionID;
            Response.EstadoSiniestro = 2;
            Response.DescripcionSiniestro = "Siniestro en proceso";
        }
        else {
            Response.EstadoSiniestro = 6;
            Response.DescripcionSiniestro = "Error de Id Siniestro";
        }
    } else {
        Response.DescripcionSiniestro = "Error de Episodio no válido";
    }

    return Response;
};

route.post("/siniestrotosap", async(req, res) => {
    let rut_paciente = formatRut(req.body.rut_paciente);
    InsightEvent("Creación SiniestroToSap: " + rut_paciente, req);

    const {
        body: { admision_json, Episodio, IdSiniestro, mail_admisionista, id_tipo, id_estado }
    } = req;

    let insightsData = {
        rutPaciente: rut_paciente,
        admisionista: mail_admisionista,
        idTipo: id_tipo,
        idEstado: id_estado,
        episodio: Episodio,
        idSiniestro: IdSiniestro,
        tipoAdmision: admision_json.tipoAdmision.Descripcion,
        tipoSiniestro: admision_json.tipoSiniestro.Descripcion
    };

    try {
        InsightTrace(`[Admision][siniestrotosap] rut=${rut_paciente} episodio=${Episodio} solicita siniestro ${admision_json.tipoAdmision.Descripcion}`, 1, {...insightsData});

        if (Episodio.match("[\\D]+") === null){
            // Armar Json
            let JsonSiniestro = {};
            let url;

            switch (admision_json.tipoSiniestro.Id) {
                case 1: // Trabajo
                case 2: // Trayecto
                    JsonSiniestro = await MapearTrabajoTrayectoInsert(Episodio, admision_json);
                    url = `${process.env.URLAPIMANAGEMENT}AdmisionDigital/RESTAdapter/CrearSiniestro`;
                    break;
                case 3: // Enfermedad Profesional
                    JsonSiniestro = await MapearEPInsert(Episodio, admision_json);
                    url = `${process.env.URLAPIMANAGEMENT}AdmisionDigital/RESTAdapter/CrearSiniestroEP`;
                    break;
                default:
                    break;
            }

            if (JsonSiniestro.Datos_Licencia){
                if (JsonSiniestro.Datos_Licencia.errors){
                    InsightTrace(`[Admision][siniestrotosap] rut=${rut_paciente} episodio=${Episodio} fallo por validacion de fechas licencias`, 2, {...insightsData});

                    return res.status(409).json(apiResponseReducer("Error validando fechas de licencias", ("La fechas se solapan")));
                } else {
                    delete JsonSiniestro.Datos_Licencia.errors;
                    JsonSiniestro.Datos_Licencia = JsonSiniestro.Datos_Licencia.data;
                }
            }

            JsonSiniestro.Id_siniestro_digital = IdSiniestro;
            InsightTrace(`[Admision][siniestrotosap] rut=${rut_paciente} episodio=${Episodio} datos crear siniestro ${admision_json.tipoAdmision.Descripcion}`,
                1,
                {
                    ...insightsData,
                    siniestro: JsonSiniestro
                });

            const resultAdmSiniestro = await handleConectionSAP({URL: url, DATA: JsonSiniestro});

            try {
                checkRequestLimit(resultAdmSiniestro);
            } catch (error){
                InsightTrace(`[Admision][siniestrotosap] rut=${rut_paciente} episodio=${Episodio} falla por request limit`, 2, {...insightsData});

                return res.status(429).send({...ResErrorRequestLimit(resultAdmSiniestro)});
            }

            InsightTrace(`[Admision][siniestrotosap] rut=${rut_paciente} episodio=${Episodio} siniestro exitoso`, 1, {...insightsData});

            res.send({response: resultAdmSiniestro.status, JsonSiniestro, url});
        } else {
            InsightTrace(`[Admision][siniestrotosap] rut=${rut_paciente} episodio=${Episodio} falla validacion de episodio`, 3, {...insightsData});

            res.status(409).json(apiResponseReducer(handleErrorResponse("Episodio Obligatorio"), ("Episodio Obligatorio")));
        }
    } catch (error) {
        InsightTrace(`[Admision][siniestrotosap] rut=${rut_paciente} episodio=${Episodio}  ocurrio un error interno`, 3, {
            ...insightsData,
            error
          });

        res.status(409).json(apiResponseReducer(handleErrorResponse(error), (error?error.message:"Ha ocurrido un error")));
    }
});

module.exports = route;
