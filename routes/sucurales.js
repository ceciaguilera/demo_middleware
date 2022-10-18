const Router = require("express-promise-router");
const apiResponse = require("../Utils/ApiUtil/apiResponseReducer");
const { getConfigSucursalesVigentes } = require("../Request/empresa");
const get = require("../Utils/ApiUtil/http");
const {handleErrorResponse} = require('../Utils/helpers')

const route = new Router();

route.get("/", async (req, res) => {
  try {
    const { rutEmpresa } = req.query
    if (!rutEmpresa){
      let response = apiResponse(handleErrorResponse("Faltan datos en los parámetros"), "Faltan datos")

      return res.status(400).json(response)
    } else {
        const rutEmpresaFormateado = rutEmpresa.toUpperCase().replace(/\./g, "");
        const sucursalResponse = await get(
          getConfigSucursalesVigentes(rutEmpresaFormateado)
        );

        if (sucursalResponse.status==200){
          if (sucursalResponse.data){
                const sucursalResult = sucursalResponse.data.length>0? sucursalResponse.data.map((afp) => {
                  return {
                    sucursalCargo: afp.sede,
                    codigo: afp.idSucursal,
                    nombre: "",
                    id_comuna: afp.comuna.idComuna.toString().substring(9, 12),
                    comuna: afp.comuna.descripcionComuna,
                    codigo_region: afp.region.idRegion,
                    region: afp.region.descripcionRegion,
                    direccion: afp.nombreCalle + afp.numero,
                    latitud: afp.latitud,
                    longitud: afp.longitud,
                    tipo_sucursal: afp.tipo_sucursal
                  };
                }):[];

                return res.send(sucursalResult);
            } else {
              res.status(409).json(apiResponse(handleErrorResponse("Error de estructura devuelta por SAP"), "Error de data"))
            }
        } else {
          res.status(409).json(apiResponse(handleErrorResponse(sucursalResponse), "Error de conexión con SAP"))
        }
    }
  } catch (error) {
    res.status(500).json(apiResponse(handleErrorResponse(error), "Error de conexión"))
  }
});
module.exports = route;
