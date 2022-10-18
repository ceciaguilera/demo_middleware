const Router = require("express-promise-router");
const { getPartesCuerpo } = require("../Request/partesCuerpo");
const apiResponse = require('../Utils/ApiUtil/apiResponseReducer');
const { handleErrorResponse } = require('../Utils/helpers');
const get = require("../Utils/ApiUtil/http");
const route = new Router();

route.get("/", async (_, res) => {
    try {
        const partesDelCuerpo = await get(getPartesCuerpo());
        if (partesDelCuerpo.status === 200 && partesDelCuerpo.data) {
            return res.send(apiResponse(partesDelCuerpo.data, "Operacion exitosa"));
        }
        return res.status(409).json(apiResponse(handleErrorResponse(partesDelCuerpo), "Error de conexión con SAP"))
    } catch (error) {
        return res.status(500).json(apiResponse(handleErrorResponse(error), "Error de conexión"))
    }
});

module.exports = route;