const Router = require("express-promise-router");
const apiResponse = require("../Utils/ApiUtil/apiResponseReducer");
const apiResponseObject = require("../Utils/ApiUtil/apiResponseObjectReducer");
const {getNivel1, getNivel2, getNivel3} = require('../Request/alertas')
const get = require('../Utils/ApiUtil/http')
const {handleErrorResponse} = require('../Utils/helpers')

const route = new Router();

route.get("/", async (req, res) => {
    try {
      // obtenemos los niveles
      const responseN1 = await get(getNivel1())
      const responseN2 = await get(getNivel2())
      const responseN3 = await get(getNivel3())

      if (responseN1.status==200 && responseN2.status==200 && responseN3.status==200){
        if (responseN1.data && responseN2.data && responseN3.data){
          if (responseN1.data.length>0 && responseN2.data.length>0 && responseN3.data.length>0){
            // creamos la estructura
            const option3 = getStructure(responseN3.data, [], 0)
            const option2 = getStructure(responseN2.data, option3, 1)
            option2.splice(5, 1)// Elimina la Opcion "No registra Alerta"
            const structure = getStructure(responseN1.data, option2, 1)
            // resultado
            res.send(apiResponseObject(structure, "Operación Exitosa"))
          } else {
            res.status(409).json(apiResponse(handleErrorResponse({ alerta1: responseN1.data.length, alerta2: responseN2.data.length, alerta3: responseN3.data.length }), "Error de data"))
          }
        } else {
          res.status(409).json(apiResponse(handleErrorResponse("Error de estructura devuelta por SAP"), "Error de data"))
        }
      } else {
        res.status(409).json(apiResponse(handleErrorResponse({ alerta1: responseN1, alerta2: responseN2, alerta3: responseN3 }), "Error de conexión con SAP"))
      }
    } catch (error) {
      res.status(500).json(apiResponse(handleErrorResponse(error), "Error de conexión"))
   }
});

const getStructure = (data, childData, key) => {
  const estructura = data.map(reg => {
    let opciones = []

    if (reg.key === key)
      opciones = childData

    return {id: reg.key, glosa: reg.value, opciones}
  })

  return estructura
}

module.exports = route;
