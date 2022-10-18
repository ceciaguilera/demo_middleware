const Router = require('express-promise-router')
const apiResponse = require('../Utils/ApiUtil/apiResponseReducer')
const getConfigAFP = require('../Request/afps')
const get = require('../Utils/ApiUtil/http')
const {handleErrorResponse} = require('../Utils/helpers')

const route = new Router();

route.get('/', async (req, res) => {
    try {
        const afpsResponse = await get(getConfigAFP())

        if (afpsResponse.status==200){
            if (afpsResponse.data){
                const afpResult = afpsResponse.data.length>0 ? afpsResponse.data.map(afp => { return {codigo: afp.cod_afp, nombre: afp.texto_afp} }) : []
                const response = apiResponse(afpResult, "Operacion exitosa")
                res.send(response)
            } else {
                res.status(409).json(apiResponse(handleErrorResponse("Error de estructura devuelta por SAP"), "Error de data"))
            }
        } else {
            res.status(409).json(apiResponse(handleErrorResponse(afpsResponse), "Error de conexión con SAP"))
        }
    } catch (error) {
        res.status(500).json(apiResponse(handleErrorResponse(error), "Error de conexión"))
    }
})

module.exports = route;