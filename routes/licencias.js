const Router = require('express-promise-router')
const apiResponse = require('../Utils/ApiUtil/apiResponseReducer')
const { handleErrorResponse } = require('../Utils/helpers')
const { getLicencias, postLicencias } = require("../Request/licencia")
const { sapHttpPostResponse } = require("../Utils/ApiUtil/sapHttpPost")

const route = new Router();

route.get('/', async (req, res) => {
    try {
        const { rut } = req.query
        if (!rut) {
            let response = apiResponse(handleErrorResponse("Faltan el parametro rut"), "Falta rut")
            return res.status(400).json(response)
        } else {
            const respuesta = await sapHttpPostResponse(getLicencias(), {
                rut_paciente: rut.replace(/\./g, "").toUpperCase(),
                estado_licencia: [
                    1, 10, 30, 40, 50, 55, 60, 71
                ]
            });

            if (respuesta.status == 200) {

                if (respuesta.data) {

                    const response = apiResponse(respuesta.data.licencias_medicas !== undefined ? respuesta.data.licencias_medicas : [], "Operacion exitosa");
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
})

route.post('/vincular', async (req, res) => {
    try {
        const { body } = req
  
            const respuesta = await sapHttpPostResponse(postLicencias(), body);

            if (respuesta.status == 200) {

                if (respuesta.data) {

                    const response = apiResponse(respuesta.data !== undefined ? respuesta.data : [], "Operacion exitosa");
                    res.send(response);

                } else {
                    res.status(409).json(apiResponse(handleErrorResponse("Error de estructura devuelta por SAP"), "Error de data"))
                }

            } else {
                res.status(409).json(apiResponse(handleErrorResponse(respuesta), "Error de conexión con SAP"))
            }
        
        
    } catch (error) {
        res.status(500).json(apiResponse(handleErrorResponse(error), "Error de conexión"))
    }
})

module.exports = route;