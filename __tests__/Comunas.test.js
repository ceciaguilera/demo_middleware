const dotenv = require("dotenv");
dotenv.config();
const getConfigComunas = require("../Request/comunas");
const get = require('../Utils/ApiUtil/http')

describe("COMUNAS", () => {
    it("Probar Endpoint que obtiene las COMUNAS", async() => {        
        const response = await get(getConfigComunas())
        const resultado = response.data ? response.data:[]
        if (resultado){
            let total = resultado.d.results.length
            expect(total).toBeGreaterThan(0)
            console.log('Hay un total de COMUNAS: '+total)
        } else {
            console.log("status: "+resultado)
        }
    })
})
