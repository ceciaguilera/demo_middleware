const dotenv = require("dotenv");
dotenv.config();
const getConfigOcupaciones = require('../Request/ocupacion')
const get = require('../Utils/ApiUtil/http')

describe("Ocupaciones", () => {
    it("Probar Endpoint que obtiene las Ocupaciones", async() => {        
        const response = await get(getConfigOcupaciones())
        const resultado = response.data ? response.data.d.results : []
        if (resultado){
            let total = resultado.length
            expect(total).toBeGreaterThan(0)
            console.log('Hay un total de Ocupaciones: '+total)
        } else {
            console.log("status: "+resultado)
        }
    })
})
