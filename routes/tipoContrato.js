const Router = require("express-promise-router");
const apiResponse = require("../Utils/ApiUtil/apiResponseReducer");
const tipoContratoRequest = require("../Request/tipoContrato");
const http = require("../Utils/ApiUtil/http");
const {handleErrorResponse} = require('../Utils/helpers')

const route = new Router();

route.get("/", async (req, res) => {
  try {
    const result = await http(tipoContratoRequest());

    if (result.status==200){
      if (result.data){
        const response = apiResponse(
          result.data.length>0? formatDatos(result.data) : [],
          "Operacion Exitosa"
        );
        res.send(response);
      } else {
        res.status(409).json(apiResponse(handleErrorResponse("Error de estructura devuelta por SAP"), "Error de data"))
      }
    } else {
       res.status(409).json(apiResponse(handleErrorResponse(result), "Error de conexión con SAP"))
    }
  } catch (error) {
    res.status(500).json(apiResponse(handleErrorResponse(error), "Error de conexión"))
  }
});

const formatDatos = (datos) => {
  return (datosFormated = datos.map(
    ({ idTipoContrato, descripcionTipoContrato }) => {
      return { id: idTipoContrato, nombre: descripcionTipoContrato };
    }
  ));
};
module.exports = route;
