const dotenv = require("dotenv");
dotenv.config();
const getConfigAFP = require('../Request/afps')
const get = require('../Utils/ApiUtil/http')

describe("AFP", () => {
    it("Probar Endpoint que obtiene las AFP", async() => {
        const response = await get(getConfigAFP())
        const resultado = response.data ? response.data:[]
        if (resultado){
            let total = resultado.length
            expect(total).toBeGreaterThan(0)
            console.log('Hay un total de AFPS: '+total)
        } else {
            console.log("status: "+resultado)
        }
    })
})
