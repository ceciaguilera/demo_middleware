const dotenv = require("dotenv");
dotenv.config();
const { getCausalMolestias } = require('../Request/tipoAccidenteTrayecto')
const get = require('../Utils/ApiUtil/http')

describe("Causas Ocupaciones", () => {
    it("Probar Endpoint que obtiene las Causas de Ocupaciones", async() => {    
        const response = await get(getCausalMolestias())
        const resultado = response.data ? response.data:[]
        if (resultado){
            let total = resultado.length
            expect(total).toBeGreaterThan(0)
            console.log('Hay un total de Causas: '+total)
        } else {
            console.log("status: "+resultado)
        }
    })
})
