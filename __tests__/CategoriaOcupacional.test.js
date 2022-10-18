const dotenv = require("dotenv");
dotenv.config();
const categoriaOcupacionalRequest = require("../Request/categoriaOcupacional");
const get = require('../Utils/ApiUtil/http')

describe("Categoria Ocupacional", () => {
    it("Probar Endpoint que obtiene las Categorias Ocupacionales", async() => {        
        const response = await get(categoriaOcupacionalRequest())
        const resultado = response.data ? response.data:[]
        if (resultado){
            let total = resultado.length
            expect(total).toBeGreaterThan(0)
            console.log('Hay un total de CategoriasOcupacionales: '+total)
        } else {
            console.log("status: "+resultado)
        }
    })
})
