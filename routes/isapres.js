const Router = require('express-promise-router')
const apiResponse = require('../Utils/ApiUtil/apiResponseReducer')
const getIsapres = require('../Request/isapres')
const get = require('../Utils/ApiUtil/http')
const {handleErrorResponse} = require('../Utils/helpers')

const route = new Router();

route.get('/', async (req, res) => {
    try {
        const isapresResponse = await get(getIsapres())

        if (isapresResponse.status==200){
            if (isapresResponse.data){
                const isapresResult = isapresResponse.data.length>0? isapresResponse.data.map(isapres => { return {id: isapres.key, nombre: isapres.value} }): []
                const response = apiResponse(isapresResult, "Operacion exitosa")
                res.send(response)
            } else {
                res.status(409).json(apiResponse(handleErrorResponse("Error de estructura devuelta por SAP"), "Error de data"))
            }
        } else {
            res.status(409).json(apiResponse(handleErrorResponse(isapresResponse), "Error de conexión con SAP"))
        }
    } catch (error) {
        res.status(500).json(apiResponse(handleErrorResponse(error), "Error de conexión"))
    }
})

module.exports = route;