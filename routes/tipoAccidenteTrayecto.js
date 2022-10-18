const Router = require("express-promise-router");
const { getTipoAccidenteTrayecto, getCausalMolestias } = require("../Request/tipoAccidenteTrayecto");
const apiResponse = require('../Utils/ApiUtil/apiResponseReducer')
const get = require('../Utils/ApiUtil/http')
const {handleErrorResponse} = require('../Utils/helpers')

const route = new Router();

route.get("/", async (req, res) => {
  try {
    const response_temp = await get(getTipoAccidenteTrayecto())
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
});

route.get('/causalMolestias', async (req, res) => {
  try {
      const molestiasResponse = await get(getCausalMolestias())

      if (molestiasResponse.status==200){
        if (molestiasResponse.data){
          const molestasResult = molestiasResponse.data.length>0 ? molestiasResponse.data.map(region => { return {id: region.id, nombre: region.descripcion} }):[]
          const response = apiResponse(molestasResult, "Operacion exitosa")
          res.send(response)
        } else {
          res.status(409).json(apiResponse(handleErrorResponse("Error de estructura devuelta por SAP"), "Error de data"))
        }
      } else {
        res.status(409).json(apiResponse(handleErrorResponse(molestiasResponse), "Error de conexión con SAP"))
      }
  } catch (error) {
    res.status(500).json(apiResponse(handleErrorResponse(error), "Error de conexión"))
  }
})

module.exports = route;
