const Router = require("express-promise-router");
const { sapHttpPostResponse } = require("../Utils/ApiUtil/sapHttpPost");
const apiResponseReducer = require("../Utils/ApiUtil/apiResponseReducer");
const { handleErrorResponse } = require('../Utils/helpers')
const { sapHttpPutResponse } = require("../Utils/ApiUtil/sapHttpPut");
const { InsightTrace, InsightEvent } = require("./../Utils/ApiUtil/appInsight");
const { Documento } = require("../Models/documento.entity");
const { postActualizaEstadoDigitalizacion, getDiatDiepByRut, vincularDiatDiepEmpresa } = require("../Request/documentos");
const { httpPost } = require("../Utils/ApiUtil/httpRequests");
const route = new Router();

route.get("/documentosEnSAP/:numeroSiniestro", async (req, res) => {
    try {
        const { numeroSiniestro } = req.params;
        const documento = new Documento();
        const response = await documento.obtenerDocumentosSAP(numeroSiniestro);
        res.status(200).json(response);
    } catch (err) {
        handleErrorResponse(res, err);
    }
});

route.post("/digitalizar", async(req, res) => {
    const { Id, IdEpisodio, IdSiniestro, IdPaciente, centro, admisionista, documentos } = req.body;

    InsightTrace(`[Documentos][Digitalizar] episodio=${IdEpisodio} admisionista=${admisionista} solicita digitalizar ${documentos.length > 1 ? 'documentos' : 'documento'}`,
     1,
     {
        idSiniestroDocumento: Id,
        idSiniestro: IdSiniestro,
        idEpisodio: IdEpisodio,
        centro,
        admisionista,
        documentos: documentos.length
    });

    try {
        const documents = [];
        documentos.forEach((doc) => {
            if (doc.GuardadoSAP === 1 || !doc.Digitalizar)
                return;
            const documento = new Documento();
            documento.fillFromDoc(doc, IdPaciente, IdEpisodio, IdSiniestro);
            documents.push(documento);
        });

        if (documents.length === 0)
            return res.status(200).json({Mensaje: "No hay documentos para digitalizar", Resultado: true, centro, admisionista});

        const documentosDigitalizados = await Promise.all(await documents.map((doc) => {
            return doc.enviaDigitalizacion();
        }));

        // eslint-disable-next-line no-prototype-builtins
        if (documentosDigitalizados.some((result) => !result.success && result.hasOwnProperty("tiempoEspera"))){
            InsightTrace(`[Documentos][Digitalizar] episodio=${IdEpisodio} admisionista=${admisionista} no se pudo digitalizar por alta demanda`,
            2,
            {
                idSiniestroDocumento: Id,
                idSiniestro: IdSiniestro,
                idEpisodio: IdEpisodio,
                centro,
                admisionista,
                documentos: documentos.length
            });

            return res.status(429).json({Mensaje: "Actualmente existe una alta demanda en el servicio.", ...documentosDigitalizados[0]});
        } else if (documentosDigitalizados.some((result) => result.success === false)) {
            InsightTrace(`[Documentos][Digitalizar] episodio=${IdEpisodio} Uno o más documentos no se pudieron digitalizar`,
                1,
                {
                idSiniestroDocumento: Id,
                idSiniestro: IdSiniestro,
                idEpisodio: IdEpisodio,
                centro,
                admisionista,
                documentos: documentos.length,
                data: documentosDigitalizados
            });
            return res.status(409).json({Mensaje: "Error al digitalizar documentos", Resultado: false, centro, admisionista});
        }
        httpPost(postActualizaEstadoDigitalizacion(), { Id, estado: 1 });

        InsightTrace(`[Documentos][Digitalizar] episodio=${IdEpisodio} admisionista=${admisionista} digitaliza ${documentos.length > 1 ? 'documentos' : 'documento'} correctamente`,
        1,
        {
           idSiniestroDocumento: Id,
           idSiniestro: IdSiniestro,
           idEpisodio: IdEpisodio,
           centro,
           admisionista,
           documentos: documentos.length
        });

        return res.status(200).json({Mensaje: "Documentos digitalizados", Resultado: true, centro, admisionista});
    } catch (error) {
        InsightTrace(`[Documentos][Digitalizar] episodio=${IdEpisodio} admisionista=${admisionista} ocurrio un error al digitalizar ${documentos.length > 1 ? 'documentos' : 'documento'}`,
        3,
        {
           idSiniestroDocumento: Id,
           idSiniestro: IdSiniestro,
           idEpisodio: IdEpisodio,
           centro,
           admisionista,
           documentos: documentos.length,
           error
        });

        return res.status(409).json(apiResponseReducer(handleErrorResponse(res, error)));
    }
});

route.post("/generarCodigoBarra", async(req, res) => {
    const document = new Documento();
    document.fillFromDoc(req.body);
    const result = await document.generarCodigoBarra();
    if (result === false)
        return res.status(500).json(apiResponseReducer(false, "Error al generar codigo de barra"));

    return res.status(200).json(apiResponseReducer(document.codigobarra, "Codigo de barra generado exitosamente"));
});

route.post("/crear", async(req, res) => {
    const { body: { admisionID, DescripcionSiniestro, DescripcionEpisodio, rutPaciente } } = req;

    const insightsData = {
            admisionId: admisionID,
            siniestro: DescripcionSiniestro,
            episodio: DescripcionEpisodio,
            rutPaciente: rutPaciente ? rutPaciente : undefined
     };

    try {
        InsightTrace(`[Documentos][Crear] rut=${rutPaciente} admisionId=${admisionID} episodio=${DescripcionEpisodio} siniestro=${DescripcionSiniestro}  se inicia solicitud de creacion documentos`, 1, 
        insightsData);

        const {codigo} = await SolicitarDocumentos(DescripcionSiniestro, DescripcionEpisodio, admisionID, rutPaciente);

        InsightTrace(`[Documentos][Crear] rut=${rutPaciente} admisionId=${admisionID} episodio=${DescripcionEpisodio} siniestro=${DescripcionSiniestro}  fin de solicitud de documentos`, 1, {
            ...insightsData,
            codigo
        });

        let result = await ActualizarBD(admisionID, 2, 3, codigo, DescripcionSiniestro, DescripcionEpisodio, rutPaciente);

        InsightTrace(`[Documentos][Crear] rut=${rutPaciente} admisionId=${admisionID} episodio=${DescripcionEpisodio} siniestro=${DescripcionSiniestro}  fin de documentos en bd`, 1, {
            ...insightsData,
            codigo
        });

        res.send({codigo, result});

        // Este evento muestra error circular structure JSON
        InsightEvent(`Resultado crear documentos ${admisionID}`, {codigo, result, datos: req});

        // metrica de creación de documentos fin
    } catch (error) {
        InsightTrace(`[Documentos][Crear] rut=${rutPaciente} admisionId=${admisionID} episodio=${DescripcionEpisodio} siniestro=${DescripcionSiniestro} creacion documentos fallo`,
                3, {
                    ...insightsData,
                    error: error.message
                });
        res.status(409).json(apiResponseReducer(handleErrorResponse(error), (error?error.message:"Ha ocurrido un error")));
    }
});

route.post('/getDiatDiepByRut', async (req, res) => {
    const { body: { num_documento } } = req

    try {
        const { data } = await sapHttpPostResponse(getDiatDiepByRut(), { tipo_documento: 'RUT', num_documento })

        return res.status(200).json(apiResponseReducer(data, 'Documentos DIAT/DIEP obtenidos correctamente'))        
    } catch (error) {
        InsightTrace(`[Documentos][getDiatDiepByRut] rut=${num_documento} obtención de documento DIAT / DIEP falló`, 3, { error: error.message })

        res.status(409).json(apiResponseReducer(handleErrorResponse(error), (error ? error.message : 'Ha ocurrido un error')))
    }
})

route.post('/vincularDiatDiepEmpresa', async (req, res) => {
    const { body } = req

    try {
        const { data } = await sapHttpPostResponse(vincularDiatDiepEmpresa(), body)

        const success = (data.MT_Vincula_Diat_Diep_Empresa_Response.Estado === 3)
        const msg = success ? 'Documentos DIAT/DIEP vinculados correctamente' : 'Documentos no pudieron vincularse'
        
        return res.status(200).json(apiResponseReducer(data, msg))
    } catch (error) {
        InsightTrace(`[Documentos][vincularDiatDiepEmpresa] idSiniestro=${body.ID_sinies_T} vinculación de documento DIAT / DIEP falló`, 3, { error: error.message })

        res.status(409).json(apiResponseReducer(handleErrorResponse(error), (error ? error.message : 'Ha ocurrido un error')))
    }
})

const SolicitarDocumentos = async (numeroSiniestro, numeroEpisodio, admisionId, rutPaciente) => {
    const body = {siniestro: numeroSiniestro, episodio: numeroEpisodio},
          limite = 3;

          const insightsData = {
            admisionId,
            siniestro: numeroSiniestro,
            episodio: numeroEpisodio,
            rutPaciente: rutPaciente ? rutPaciente : undefined
     };

    let intento = 0;
    try {
        while (intento < limite){
            InsightTrace(`[Documentos][Crear] rut=${rutPaciente}  admisionId=${admisionId} episodio=${numeroEpisodio} siniestro=${numeroSiniestro} creacion documentos intento ${intento}`,
             1, insightsData);

            const { data } = await sapHttpPostResponse(`${process.env.URLAPIMANAGEMENT}AdmisionDigital/RESTAdapter/AdmDigitalProcesoFirma`, body);
            if (String(data.MT_ProcesoFIrma_Response.codigo) !== '')
                return data.MT_ProcesoFIrma_Response;

            if (intento === limite){
                InsightTrace(`[Documentos][Crear] rut=${rutPaciente}  admisionId=${admisionId} episodio=${numeroEpisodio} siniestro=${numeroSiniestro} creacion documentos fallo por llegar al limite ${intento}`,
                3, insightsData);

                return "No es posible crear documento Siniestro ["+numeroSiniestro+"] Episodio ["+numeroEpisodio+"]";
            }

            intento ++;
        }
    } catch (error){
        InsightTrace(`[Documentos][Crear] rut=${rutPaciente}  admisionId=${admisionId} episodio=${numeroEpisodio} siniestro=${numeroSiniestro} creacion documentos fallo`,
                3, {
                    ...insightsData,
                    error: error.message
                });

        return "Error al crear  ["+numeroSiniestro+"] Episodio ["+numeroEpisodio+"] : " + error.message;
    }
};

const ActualizarBD = async (id, id_tipo, id_estado, codigo, descripcion, episodio, rutPaciente) => {
    const body = {id, id_tipo, id_estado, codigo, descripcion}, limite = 3,
          url = process.env.URLDB + 'api/sap/updatestate';

          const insightsData = {
            admisionId: id,
            siniestro: descripcion,
            episodio,
            rutPaciente: rutPaciente ? rutPaciente : undefined
     };

    let intento = 0;

    try {
        while (intento < limite){
            InsightTrace(`[Documentos][Crear] rut=${rutPaciente}  admisionId=${id} episodio=${episodio} siniestro=${descripcion} creacion documentos actualizar bd intento ${intento}`,
             1, insightsData);
            const response = await sapHttpPutResponse(url, body);
            if (typeof response.data.content[0].codigo !== "undefined")
                return;
            intento ++;
            if (intento === limite){
                InsightTrace(`[Documentos][Crear] rut=${rutPaciente}  admisionId=${id} episodio=${episodio} siniestro=${descripcion} creacion documentos en bd fallo por llegar al limite ${intento}`,
            3, insightsData);

                return "No es posible guardar registro ["+id+"] de la tabla AdmisionDigital";
            }
        }
    } catch (error){
        InsightTrace(`[Documentos][Crear] rut=${rutPaciente}  admisionId=${id} episodio=${episodio} siniestro=${descripcion} creacion documentos en bd fallo`,
                3, {
                    ...insightsData,
                    error: error.message
                });

        return "Error al actualizar registro  ["+id+"] de la tabla AdmisionDigital "+ error.message;
    }
};

module.exports = route;
