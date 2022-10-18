const Router = require("express-promise-router");
const apiResponse = require('../Utils/ApiUtil/apiResponseReducer');
const { handleErrorResponse } = require('../Utils/helpers');
const get = require("../Utils/ApiUtil/http");
const { getLugarOcurrencia } = require("../Request/lugarOcurrencia");
const route = new Router();

route.get("/", async (_, res) => {
    try {
        const lugarDeOcurrencia = await get(getLugarOcurrencia());
        if (lugarDeOcurrencia.status === 200 && lugarDeOcurrencia.data) {
            return res.send(apiResponse(lugarDeOcurrencia.data, "Operacion exitosa"));
        }
        return res.status(409).json(apiResponse(handleErrorResponse(lugarDeOcurrencia), "Error de conexión con SAP"))
    } catch (error) {
        return res.status(500).json(apiResponse(handleErrorResponse(error), "Error de conexión"))
    }
});

module.exports = route;