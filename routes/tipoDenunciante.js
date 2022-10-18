const Router = require("express-promise-router");
const tipoDenuncianteRequest = require("../Request/tipoDenunciante");
const http = require("../Utils/ApiUtil/http");
const apiResponseReducer = require("../Utils/ApiUtil/apiResponseReducer");
const { handleErrorResponse } = require('../Utils/helpers')

const route = new Router();

route.get("/", async (req, res) => {
    try {
        const result = await http(tipoDenuncianteRequest())

        if (result.status == 200) {
            if (result.data) {
                const response = apiResponseReducer(
                    result.data,
                    "Operacion Exitosa"
                )
                res.send(response)
            } else {
                res.status(409).json(apiResponseReducer(handleErrorResponse("Error de estructura devuelta por SAP"), "Error de data"))
            }
        } else {
            res.status(409).json(apiResponseReducer(handleErrorResponse(result), "Error de conexión con SAP"))
        }
    } catch (error) {
        res.status(500).json(apiResponseReducer(handleErrorResponse(error), "Error de conexión"))
    }
})
module.exports = route;
