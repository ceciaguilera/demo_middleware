const Router = require('express-promise-router')
const apiResponse = require('../Utils/ApiUtil/apiResponseReducer')
const getCriteriosGravedad = require('../Request/criteriosGravedad')
const get = require('../Utils/ApiUtil/http')
const { handleErrorResponse } = require('../Utils/helpers')

const route = new Router();

route.get('/', async(req, res) => {
    try {        
        
        // let criterioList = []
        // const response_temp = await get(getCriteriosGravedad())
        // if(Array.isArray(response_temp.data)){
        //     for (let i = 0; i < response_temp.data.length; i++){
        //         let criterio = {'id' : '', 'descripcion':''}
        //         criterio.id = response_temp.data[i].key
        //         criterio.descripcion = response_temp.data[i].value
        //         criterioList.push(criterio)
        //     }   
        // }

        const response_temp = await get(getCriteriosGravedad())
        let idModified = Array.isArray(response_temp.data) ? response_temp.data.map(
            obj => {
                return {
                    "id" : obj.key,
                    "descripcion":obj.value,
                }
            }
        ) : [];
        
        const response = apiResponse(idModified, "Operacion exitosa")
        res.send(response)
        
    } catch (error) {
        res.status(500).json(apiResponse(handleErrorResponse(error), "Error de conexión"))
    }
})
module.exports = route;