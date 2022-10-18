const dotenv = require("dotenv");
dotenv.config();
const getConfigRegiones = require('../Request/regiones')
const get = require('../Utils/ApiUtil/http')

describe("Regiones", () => {
    it("Probar Endpoint que obtiene las Regiones", async() => {        
        const response = await get(getConfigRegiones())
        const resultado = response.data ? response.data:[]
        if (resultado){
            let total = resultado.d.results.length
            expect(total).toBeGreaterThan(0)
            console.log('Hay un total de Regiones: '+total)
        } else {
            console.log("status: "+resultado)
        }
    })
})
