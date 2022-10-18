const Router = require('express-promise-router')
const apiResponse = require('../Utils/ApiUtil/apiResponseReducer')
const getConfigOcupaciones = require('../Request/ocupacion')
const get = require('../Utils/ApiUtil/http')
const {handleErrorResponse} = require('../Utils/helpers')

const route = new Router();

route.get('/', async (req, res) => {
    try {
        const ocupResponse = await get(getConfigOcupaciones())

        if (ocupResponse.status==200){
            if (ocupResponse.data){
                const {
                    d: { results }
                } = ocupResponse.data;

                const ocupaResult = results.length>0? results.map(ocupacion => { return {id: ocupacion.Key_Ocupacion, codigo: ocupacion.COD_PROFESION, nombre: ocupacion.TEXTO_PROFESION} }):[]
                const response = apiResponse(ocupaResult, "Operacion exitosa")
                res.send(response)
            } else {
                res.status(409).json(apiResponse(handleErrorResponse("Error de estructura devuelta por SAP"), "Error de data"))
            }
        } else {
            res.status(409).json(apiResponse(handleErrorResponse(ocupResponse), "Error de conexión con SAP"))
        }
    } catch (error) {
        res.status(500).json(apiResponse(handleErrorResponse(error), "Error de conexión"))
    }
})
module.exports = route;