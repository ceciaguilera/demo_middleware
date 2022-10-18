const Router = require("express-promise-router");
const apiResponse = require('../Utils/ApiUtil/apiResponseReducer');
const { handleErrorResponse } = require('../Utils/helpers');
const get = require("../Utils/ApiUtil/http");
const { getCodigoArea } = require("../Request/codigoArea");
const route = new Router();

route.get("/", async (_, res) => {
    try {
        const codigoArea = await get(getCodigoArea());
        if (codigoArea.status === 200 && codigoArea.data) {
            return res.send(apiResponse(codigoArea.data, "Operacion exitosa"));
        }
        return res.status(409).json(apiResponse(handleErrorResponse(codigoArea), "Error de conexión con SAP"))
    } catch (error) {
        return res.status(500).json(apiResponse(handleErrorResponse(error), "Error de conexión"))
    }
});

module.exports = route;