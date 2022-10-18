const Router = require("express-promise-router");
const apiResponseObject = require("../Utils/ApiUtil/apiResponseObjectReducer");
const apiResponse = require('../Utils/ApiUtil/apiResponseReducer')
const getConfiProfesiones = require("../Request/profesiones");
const get = require("../Utils/ApiUtil/http");
const {handleErrorResponse} = require('../Utils/helpers')

const route = new Router();

route.get("/", async (req, res) => {
  try {
    const profesionesResponse = await get(getConfiProfesiones());
    if (profesionesResponse.status==200){
      if (profesionesResponse.data){
          const profesionesResult = profesionesResponse.data.length>0? profesionesResponse.data.map(({ key, value }) => {
            return { codigo: key, nombre: value ? value.split(";")[0] : "" };
          }):[];

          const response = apiResponseObject(
            profesionesResult,
            "Operacion exitosa"
          );
          res.send(response);
        } else {
          res.status(409).json(apiResponse(handleErrorResponse("Error de estructura devuelta por SAP"), "Error de data"))
        }
    } else {
      res.status(409).json(apiResponse(handleErrorResponse(profesionesResponse), "Error de conexión con SAP"))
    }
  } catch (error) {
    res.status(500).json(apiResponse(handleErrorResponse(error), "Error de conexión"))
  }
});

module.exports = route;
