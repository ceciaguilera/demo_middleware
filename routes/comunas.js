const Router = require("express-promise-router");
const apiResponse = require("../Utils/ApiUtil/apiResponseReducer");
const getConfigComunas = require("../Request/comunas");
const get = require("../Utils/ApiUtil/http");
const {handleErrorResponse, spanishSortEqualizer} = require('../Utils/helpers')

const route = new Router();

route.get("/", async (req, res) => {
  try {
    const comunasResponse = await get(getConfigComunas());
    if (comunasResponse.status==200){
      if (comunasResponse.data.d.results){
        const comunasResult = comunasResponse.data.d.results.length>0 ? comunasResponse.data.d.results.map((comuna) => {
          return {
            id: comuna.Key_Comunas,
            codigo_region: comuna.COD_COMUNA.substring(7, 9),
            codigo_comuna: comuna.COD_COMUNA.substring(9, 12),
            nombre: comuna.TEXTO_COMUNA
          };
        }):[];

        // comunasResult.length>0 && comunasResult.sort((a,b) => a.nombre < b.nombre ? -1 : +(a.nombre > b.nombre));
        comunasResult.length>0 && comunasResult.sort((a, b) => spanishSortEqualizer(a.nombre) > spanishSortEqualizer(b.nombre) ? 1 : -1)

        const response = apiResponse(
          comunasResult,
          "Operacion exitosa"
        );
        res.send(response);
      } else {
        res.status(409).json(apiResponse(handleErrorResponse("Error de estructura devuelta por SAP"), "Error de data"))
      }
    } else {
      res.status(409).json(apiResponse(handleErrorResponse(comunasResponse), "Error de conexión con SAP"))
    }
  } catch (error) {
    res.status(500).json(apiResponse(handleErrorResponse(error), "Error de conexión"))
  }
});

module.exports = route;
