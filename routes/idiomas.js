const Router = require('express-promise-router')
const apiResponse = require('../Utils/ApiUtil/apiResponseReducer')
const getIdiomas = require('../Request/idiomas')
const get = require('../Utils/ApiUtil/http')
const {handleErrorResponse} = require('../Utils/helpers')

const route = new Router();

route.get('/', async (req, res) => {
    try {
        const response_temp = await get(getIdiomas())

        if (response_temp.status==200){
            if (response_temp.data){
                const response = apiResponse(response_temp.data, "Operacion exitosa")
                res.send(response)
            } else {
                res.status(409).json(apiResponse(handleErrorResponse("Error de estructura devuelta por SAP"), "Error de data"))
            }
        } else {
            res.status(409).json(apiResponse(handleErrorResponse(response_temp), "Error de conexión con SAP"))
        }
    } catch (error) {
        res.status(500).json(apiResponse(handleErrorResponse(error), "Error de conexión"))
    }
})
module.exports = route;