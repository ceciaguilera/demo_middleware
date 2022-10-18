const Router = require("express-promise-router");
const apiResponse = require('../Utils/ApiUtil/apiResponseReducer');
const { handleErrorResponse } = require('../Utils/helpers');
const get = require("../Utils/ApiUtil/http");
const { getActividadEconomica } = require("../Request/actividadEconomica");
const route = new Router();

route.get("/", async (_, res) => {
    try {
        const actividadEconomica = await get(getActividadEconomica());
        if (actividadEconomica.status === 200 && actividadEconomica.data) {
            return res.send(apiResponse(actividadEconomica.data, "Operacion exitosa"));
        }
        return res.status(409).json(apiResponse(handleErrorResponse(actividadEconomica), "Error de conexión con SAP"))
    } catch (error) {
        return res.status(500).json(apiResponse(handleErrorResponse(error), "Error de conexión"))
    }
});

module.exports = route;