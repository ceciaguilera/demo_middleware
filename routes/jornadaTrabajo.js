const Router = require("express-promise-router");
const jornadaTrabajoRequest = require("../Request/jornadaTrabajo");
const http = require("../Utils/ApiUtil/http");
const apiResponseReducer = require("../Utils/ApiUtil/apiResponseReducer");
const {handleErrorResponse} = require('../Utils/helpers')

const route = new Router();

route.get("/", async (req, res) => {
  try {
    const result = await http(jornadaTrabajoRequest());
    if (result.status==200){
      if (result.data){
          const {
            d: { results }
          } = result.data;
          const response = apiResponseReducer(
            results.length>0? formatDatos(results) : [],
            "Operacion Exitosa"
          );
          res.send(response);
        } else {
          res.status(409).json(apiResponseReducer(handleErrorResponse("Error de estructura devuelta por SAP"), "Error de data"))
       }
    } else {
      res.status(409).json(apiResponseReducer(handleErrorResponse(result), "Error de conexión con SAP"))
    }
  } catch (error) {
     res.status(500).json(apiResponseReducer(handleErrorResponse(error), "Error de conexión"))
  }
});

const formatDatos = (datos) => {
  return datos.map(({ Key_JornadaTrabajo, COD_JORNADA, TEXTO_JORNADA }) => {
    return {
      id: COD_JORNADA,
      nombre: TEXTO_JORNADA,
      key: Key_JornadaTrabajo
    };
  });
};
module.exports = route;
