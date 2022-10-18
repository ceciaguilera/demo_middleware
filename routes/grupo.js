const Router = require('express-promise-router')
const apiResponse = require('../Utils/ApiUtil/apiResponseReducer')
const getGrupos = require('../Request/grupo')
const get = require('../Utils/ApiUtil/http')
const { handleErrorResponse } = require('../Utils/helpers')
const { ENV_nativeMetricsDisableAll } = require('applicationinsights/out/Library/Config')

const route = new Router();

route.get('/', async(req, res) => {
    try {
        let etniaList = []
        const response_temp = await get(getGrupos())
        if (Array.isArray(response_temp.data)){
            for (let i = 0; i < response_temp.data.length; i++){
                let etnia = {id: '', descripcion: ''}
                etnia.id = (response_temp.data[i].key < 10) ? '0' + response_temp.data[i].key.toString() : response_temp.data[i].key.toString()
                etnia.descripcion = response_temp.data[i].value
                etniaList.push(etnia)
            }
        }
        const response = apiResponse(etniaList ? etniaList : [], "Operacion exitosa")
        res.send(response)
    } catch (error) {
        res.status(500).json(apiResponse(handleErrorResponse(error), "Error de conexión"))
    }
})
module.exports = route;