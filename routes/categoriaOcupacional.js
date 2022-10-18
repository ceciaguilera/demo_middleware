const Router = require("express-promise-router");
const categoriaOcupacionalRequest = require("../Request/categoriaOcupacional");
const http = require("../Utils/ApiUtil/http");
const apiResponseReducer = require("../Utils/ApiUtil/apiResponseReducer");
const { handleErrorResponse } = require('../Utils/helpers')

const route = new Router();

route.get("/", async(req, res) => {
    try {
        let result = await http(categoriaOcupacionalRequest());
        if (result.status == 200) {
            if (result.data) {
                const response = apiResponseReducer(
                    result.data.length > 0 ? formatDatos(reemplaza_categorias(result.data)) : [],
                    'Operacion Exitosa'
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

const reemplaza_categorias = array => {
    return array.map(item => {
        switch (item.descripcionCategoriaOcupacional) {
            case "Asalariados":
                return {
                    ...item,
                    descripcionCategoriaOcupacional: "Trabajador dependiente"
                }
            case "Cuenta Propia":
                return {
                    ...item,
                    descripcionCategoriaOcupacional: "Trabajador independiente"
                }
            default:
                return item
        }
    })
}

// const move_to_first = (array, ocupacion) => {
//   for(let [index, element] of array.entries()){
//       if(element.descripcionCategoriaOcupacional === ocupacion){
//           array.splice(index, 1);
//           array.unshift(element);
//           break;
//       }
//   }
//   return array;
// }

const formatDatos = (datos) => {
    return (datosFormated = datos.map(
        ({ idCategoriaOcupacional, descripcionCategoriaOcupacional }) => {
            return {
                id: idCategoriaOcupacional,
                nombre: descripcionCategoriaOcupacional
            };
        }
    ));
};
module.exports = route;