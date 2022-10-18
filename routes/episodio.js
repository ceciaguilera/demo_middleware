const Router = require("express-promise-router");
const { insertarAdmision } = require("../Request/database");
const { httpPost } = require("../Utils/ApiUtil/httpRequests");
const mapearAdmisionObjetoInsert = require("../Utils/mapearObjetoInser");
const apiResponseReducer = require("../Utils/ApiUtil/apiResponseReducer");
const {
  handleErrorResponse,
  formatRut,
  getAdmisionId
} = require("../Utils/helpers");
const {
  ValidarCamposObligatorios,
  handleConectionSAP,
  handleInfoAdmision
} = require("../Utils/integracionSap");
const { InsightTrace, InsightEvent } = require("./../Utils/ApiUtil/appInsight");
const {
  checkRequestLimit,
  ResErrorRequestLimit
} = require("../Utils/ApiUtil/requestLimit");
const route = new Router();

route.post("/", async (req, res) => {
  let rut_paciente = formatRut(req.body.rut_paciente);
  InsightEvent("Creación Episodio: " + rut_paciente, req);

  const {
    body,
    body: { admision_json, mail_admisionista, id_estado, id_tipo }
  } = req;

  let insightsData = {
      rutPaciente: rut_paciente,
      admisionista: mail_admisionista,
      idTipo: id_tipo,
      idEstado: id_estado,
      tipoAdmision: admision_json.tipoAdmision.Descripcion,
      tipoSiniestro: admision_json.tipoSiniestro.Descripcion
  };

  try {
    InsightTrace(`[Admision] rut=${rut_paciente} solicita admision ${admision_json.tipoAdmision.Descripcion} ${admision_json.tipoSiniestro.Descripcion}`,
    1, {...insightsData});

    const validationFailed = await ValidarCamposObligatorios(admision_json);
    if (validationFailed) {
      InsightTrace(`[Admision] rut=${rut_paciente} falla validacion de datos: ${validationFailed}`, 2, {...insightsData});

      res
        .status(409)
        .json(
          apiResponseReducer(
            handleErrorResponse(validationFailed),
            "Faltan datos: " + validationFailed
          )
        );
    } else {
      let action = 0;
      const infoAdmision = await handleInfoAdmision(rut_paciente);

      InsightTrace(
        `[Admision] rut=${rut_paciente} obtiene info admision bd`, 1, {
          ...insightsData,
          infoAdmision
        }
      );

      const responseInfo = getResponseInfo(infoAdmision);
      action = getAction(responseInfo);

      InsightTrace(`[Admision] rut=${rut_paciente} accion episodio: ${action}`, 1, {...insightsData});

      let respuesta = await Promise.resolve(
        getRespuesta(action, body, responseInfo, insightsData)
      );

      if (Object.keys(respuesta).length > 0) {
        if (respuesta.status === 429) {
          InsightTrace(`[Admision] rut=${rut_paciente} accion=${action} falla solicitud episodio por alta demanda`, 2, {...insightsData});

          return res
          .status(429)
          .json(
            apiResponseReducer(
              respuesta,
              "Alta demanda en generacion de casos"
            )
          );
        }

        const { EstadoEpisodio, IdEpisodio } = respuesta;

        insightsData = { ...insightsData, estadoEpisodio: EstadoEpisodio };

        if (parseInt(EstadoEpisodio) === 2 || parseInt(EstadoEpisodio) === 3) {
          InsightTrace(`[Admision] rut=${rut_paciente} accion=${action} episodioId=${IdEpisodio} admision exitosa`, 1, {...insightsData});

          return res.send(apiResponseReducer(respuesta, "Operación Exitosa"));
        } else {
          InsightTrace(`[Admision] rut=${rut_paciente} accion=${action} ocurrio un error en el proceso`, 3, {...insightsData});

          return res
          .status(409)
          .json(
            apiResponseReducer(
              handleErrorResponse({
                error: "Error proceso",
                datos: respuesta
              }),
              "Error proceso"
            )
          );
        }
      }
    }
  } catch (error) {
    InsightTrace(`[Admision] rut=${rut_paciente} ocurrio un error interno`, 3, {
      ...insightsData,
      error
    });

    returnError(res, error, "Ha ocurrido un error");
  }
});

const getResponseInfo = (infoAdmision) => {
  return infoAdmision.ok ? isInfoAdmision(infoAdmision) : [];
};

const isInfoAdmision = (infoAdmision) => {
  return infoAdmision.data.content.length > 0 ? infoAdmision.data.content[0] : 0;
};

const getAction = (responseInfo) => {
  if (responseInfo.length > 0) {
    const { idestadoepisodio } = responseInfo[0];
    if (parseInt(idestadoepisodio) === 2) return 1;
    else if (parseInt(idestadoepisodio) === 3) return 2;
  }

  return 0;
};

const getRespuesta = async (action, body, responseInfo, insightsData) => {
  switch (action) {
    case 0: // crear episodio
      return handleEpisodio(body, 0, insightsData);
    case 1: //  reenviar episodio
      return handleEpisodio(
        body,
        responseInfo.length > 0 ? responseInfo[0].idepisodio : 0,
        insightsData
      );
    case 2: //  retornar episodio
      return RetornarEpisodio(responseInfo[0]);
    default:
      return;
  }
};

const handleDataID = (data) => {
  if (!data) return 0;
  if (data.content.length > 0) return data.content[0];

  return 0;
};

const handleEpisodio = async (body, admisionID, insightsData) => {
  let rut_paciente = formatRut(body.rut_paciente);

  let Response = {
    DescripcionEpisodio: "No se pudo crear Episodio",
    EstadoEpisodio: 0,
    IdEpisodio: 0
  };

  // Armar Json
  const { admision_json } = body;

  let JsonEpisodio = await mapearAdmisionObjetoInsert(admision_json);

  if (admisionID === 0) {
    // ID de Base datos
    const dataToInsert = {
      id_tipo: body.id_tipo,
      id_estado: body.id_estado,
      rut_paciente,
      mail_admisionista: body.mail_admisionista,
      admision_json: JsonEpisodio,
      telefono_paciente: body.telefono_paciente,
      email_paciente: body.email_paciente
    };

    const insertaAdmision = await httpPost(insertarAdmision(), dataToInsert);

    if (insertaAdmision.status === 200) {
      const { id: IdAdm } = handleDataID(insertaAdmision.data);
      Response.IdEpisodio = IdAdm;
      Response.EstadoEpisodio = 2;
      Response.DescripcionEpisodio = "Episodio en proceso creación";

      InsightTrace(`[Admision] rut=${rut_paciente} admisionId=${IdAdm} episodio en proceso de creacion`, 1, {...insightsData});
    }
    // ID de Base datos
  } else if (admisionID > 0) {
    Response.IdEpisodio = admisionID;
    JsonEpisodio.Admisiones.Id_admision_digital = admisionID;

    const resultAdmSap = await handleConectionSAP({
      URL: `${process.env.URLAPIMANAGEMENT}AdmisionDigital/RESTAdapter/CrearAdmision`,
      DATA: JsonEpisodio
    });

    try {
      checkRequestLimit(resultAdmSap);
    } catch (error) {
      InsightTrace(`[Admision] rut=${rut_paciente} admisionId=${admisionID} falla por request limit`, 2, {...insightsData});

      return { status: 429, ...ResErrorRequestLimit(resultAdmSap) };
    }

    if (resultAdmSap.status >= 200 && resultAdmSap.status < 300) {
      Response.EstadoEpisodio = 2;
      Response.DescripcionEpisodio = "Episodio en proceso creación";

      InsightTrace(`[Admision] rut=${rut_paciente} admisionId=${admisionID} episodio en proceso de creacion`, 1, {...insightsData});
    } else {
      Response.DescripcionEpisodio = "Error conexión a SAP al crear Episodio";
      InsightTrace(`[Admision] rut=${rut_paciente} admisionId=${admisionID} error conexion a SAP`, 1, {
        ...insightsData,
        status: resultAdmSap.status
      });
    }
  } else {
    Response.DescripcionEpisodio = "Error de Id Episodio";
    InsightTrace(`[Admision] rut=${rut_paciente} admisionId=${admisionID} error de id episodio`, 1, {...insightsData});
  }

  // Enviar solicitud a SAP
  return Response;
};

route.post("/episodioId", async (req, res) => {
  // metrica inicial creacion admision
  let rut_paciente = req.body.rut_paciente.replace(/\./g, "");

  InsightEvent("Creación IdEpisodio: " + rut_paciente, req);

  try {
    const {
      body,
      body: { admision_json, mail_admisionista, id_estado, id_tipo }
    } = req;

    let insightsData = {
      rutPaciente: rut_paciente,
      admisionista: mail_admisionista,
      idTipo: id_tipo,
      idEstado: id_estado,
      tipoAdmision: admision_json.tipoAdmision.Descripcion,
      tipoSiniestro: admision_json.tipoSiniestro.Descripcion
    };

    InsightTrace(`[Admision][episodioId] rut=${rut_paciente} solicita admision ${admision_json.tipoAdmision.Descripcion} ${admision_json.tipoSiniestro.Descripcion}`, 1, {
      ...insightsData
     });

    const validationFailed = await ValidarCamposObligatorios(admision_json)

    if (validationFailed) {
      InsightTrace(`[Admision][episodioId] rut=${rut_paciente} falla validacion de datos: ${validationFailed}`, 2, { ...insightsData })

      return res
        .status(409)
        .json(
          apiResponseReducer(
            handleErrorResponse(validationFailed),
            "Faltan datos: " + validationFailed
          )
        );
    }

    InsightTrace(`[Admision][episodioId] rut=${rut_paciente} inicia admision`, 1, {...insightsData});

    const infoAdmision = await handleInfoAdmision(rut_paciente);

    InsightTrace(
      `[Admision][episodioId] rut=${rut_paciente} obtiene info admision bd`, 1, {
        ...insightsData,
        infoAdmision
      }
    );

    let responseInfo = infoAdmision.ok && infoAdmision.data.content.length > 0 ? infoAdmision.data.content[0] : []
    let action = 0

    if (responseInfo.length > 0) {
      const { idestadoepisodio } = responseInfo[0];
      
      action = setActionValue(idestadoepisodio)
    }

    InsightTrace(`[Admision][episodioId] rut=${rut_paciente} accion episodio: ${action}`, 1, {
      ...insightsData
    });

    let respuesta;
    switch (action) {
      case 0: // crear episodio
        respuesta = await handleEpisodioId(body, 0);
        break;
      case 1: //  reenviar episodio
        respuesta = await handleEpisodioId(
          body,
          responseInfo.length > 0 ? responseInfo[0].idepisodio : 0
        );
        break;
      case 2: //  retornar episodio
        respuesta = RetornarEpisodio(responseInfo[0]);
        break;
      default:
        break;
    }

    if (Object.keys(respuesta).length > 0) {
      const { EstadoEpisodio, IdEpisodio } = respuesta;

      insightsData = { ...insightsData, estadoEpisodio: EstadoEpisodio };

      if (EstadoEpisodio === 2 || EstadoEpisodio === 3) {
        InsightTrace(`[Admision][episodioId] rut=${rut_paciente} accion=${action} episodioId=${IdEpisodio} admision exitosa`, 1, {...insightsData});

        return res.send(apiResponseReducer(respuesta, "Operación Exitosa"));
      } else {
        InsightTrace(`[Admision][episodioId] rut=${rut_paciente} accion=${action} ocurrio un error en el proceso`, 3, {...insightsData});

        return res
          .status(409)
          .json(
            apiResponseReducer(
              handleErrorResponse({
                error: "Error proceso",
                datos: respuesta
              }),
              "Error proceso"
            )
          );
      }
    }
  } catch (error) {
    InsightTrace(`[Admision][episodioId] rut=${rut_paciente} ocurrio un error interno`, 3, {
      rutPaciente: rut_paciente,
      error
    });

    returnError(res, error, "Ha ocurrido un error");
  }
})

route.post("/episodiotosap", async (req, res) => {
  let rut_paciente = formatRut(req.body.rut_paciente);

  InsightEvent("Creación EpisodioToSap: " + rut_paciente, req);

  const {
    body: { admision_json, IdEpisodio, mail_admisionista, id_tipo, id_estado }
  } = req;

  const insightsData = {
    rutPaciente: rut_paciente,
    admisionista: mail_admisionista,
    idTipo: id_tipo,
    idEstado: id_estado,
    tipoAdmision: admision_json.tipoAdmision.Descripcion,
    tipoSiniestro: admision_json.tipoSiniestro.Descripcion
  };

  try {
    InsightTrace(`[Admision][episodioSAP] rut=${rut_paciente} solicita admision ${admision_json.tipoAdmision.Descripcion} ${admision_json.tipoSiniestro.Descripcion}`, 1, {...insightsData});

    let JsonEpisodio = await mapearAdmisionObjetoInsert(admision_json);
    JsonEpisodio.Admisiones.Id_admision_digital = IdEpisodio;

    InsightTrace(`[Admision][episodioSAP] rut=${rut_paciente} solicita crear admision ${admision_json.tipoAdmision.Descripcion} ${admision_json.tipoSiniestro.Descripcion} en SAP`, 1, {
      ...insightsData,
      episodio: JsonEpisodio
     });

    const resultAdmSap = await handleConectionSAP({
      URL: `${process.env.URLAPIMANAGEMENT}AdmisionDigital/RESTAdapter/CrearAdmision`,
      DATA: JsonEpisodio
    });

    try {
      checkRequestLimit(resultAdmSap);
    } catch (error) {
      InsightTrace(`[Admision][episodioSAP] rut=${rut_paciente} falla por request limit`, 2, {...insightsData});

      return res.status(429).send({ ...ResErrorRequestLimit(resultAdmSap) });
    }

    InsightTrace(`[Admision][episodioSAP] rut=${rut_paciente} respuesta episodio a SAP exitosa`, 1, {...insightsData});

    res.send({
      response: resultAdmSap.status,
      JsonEpisodio,
      url: `${process.env.URLAPIMANAGEMENT}AdmisionDigital/RESTAdapter/CrearAdmision`
    });
  } catch (error) {
    InsightTrace(`[Admision][episodioSAP] rut=${rut_paciente} ocurrio un error`, 3, {
      ...insightsData,
      error
    });

    returnError(res, error, "Ha ocurrido un error");
  }
});

// helpers
const setActionValue = idEstado => {
  switch (idEstado) {
    case 2:
      return 1
    case 3:
      return 2
    default:
      return 0
  }
}

const handleEpisodioId = async (body, admisionID) => {
  let rut_paciente = formatRut(body.rut_paciente);
  let Response = {
    DescripcionEpisodio: "No se pudo crear Episodio",
    EstadoEpisodio: 0,
    IdEpisodio: 0
  };

  // Armar Json
  const { admision_json } = body;
  let JsonEpisodio = await mapearAdmisionObjetoInsert(admision_json);

  if (!admisionID > 0) {
    // ID de Base datos
    const dataToInsert = {
      id_tipo: body.id_tipo,
      id_estado: body.id_estado,
      rut_paciente,
      mail_admisionista: body.mail_admisionista,
      admision_json: JsonEpisodio,
      telefono_paciente: body.telefono_paciente,
      email_paciente: body.email_paciente
    };
    const insertaAdmision = await httpPost(insertarAdmision(), dataToInsert);

    if (insertaAdmision && insertaAdmision.status === 200){
      InsightTrace(`[Admision][episodioId] rut=${rut_paciente} resultado insertar admision`, 1, {
        status: insertaAdmision.status
      });

       admisionID = getAdmisionId(insertaAdmision);
        // ID de Base datos
    }
  }

  InsightTrace(`[Admision][episodioId] rut=${rut_paciente} admisionId=${admisionID} resultado obtener admision id`, 1, {
    admisionID,
    episodio: JsonEpisodio
  });

  // Enviar solicitud a SAP
  if (admisionID > 0) {
    Response.IdEpisodio = admisionID;
    Response.EstadoEpisodio = 2;
    Response.DescripcionEpisodio = "Episodio en proceso creación";
  } else {
    Response.DescripcionEpisodio = "Error de Id Episodio";
  }

  // Enviar solicitud a SAP
  return Response;
};

const RetornarEpisodio = (data) => {
  return {
    DescripcionEpisodio: data.episodio,
    EstadoEpisodio: data.idestadoepisodio,
    IdEpisodio: data.idepisodio,
    DescripcionSiniestro: data.siniestro,
    EstadoSiniestro: data.idestadosiniestro,
    IdSiniestro: data.idsiniestro
  };
};

function returnError(res, error, message) {
  res
    .status(409)
    .json(
      apiResponseReducer(
        handleErrorResponse(error),
        error ? error.message : message
      )
    );
}

module.exports = route;