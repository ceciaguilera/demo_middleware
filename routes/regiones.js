const Router = require('express-promise-router')
const apiResponse = require('../Utils/ApiUtil/apiResponseReducer')
const getConfigRegiones = require('../Request/regiones')
const get = require('../Utils/ApiUtil/http')
const {handleErrorResponse} = require('../Utils/helpers')

const route = new Router();

route.get('/', async (req, res) => {
    try {
        const regionesResponse = await get(getConfigRegiones())
        if (regionesResponse.status==200){
            if (regionesResponse.data){
                const { d: { results } } = regionesResponse.data;

                const regionesResult = results.length>0? results.map(region => { return {id: region.Key_Regiones, codigo: region.COD_REGION, nombre: region.TEXTO_REGION} }):[]
                const response = apiResponse(regionesResult, "Operacion exitosa")
                res.send(response)
            } else {
                res.status(409).json(apiResponse(handleErrorResponse("Error de estructura devuelta por SAP"), "Error de data"))
            }
        } else {
            res.status(409).json(apiResponse(handleErrorResponse(regionesResponse), "Error de conexión con SAP"))
        }
    } catch (error) {
        res.status(500).json(apiResponse(handleErrorResponse(error), "Error de conexión"))
    }
})
module.exports = route;