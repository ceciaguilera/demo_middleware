const dotenv = require("dotenv");
dotenv.config();
const getNacionalidades = require('../Request/nacionalidades')
const get = require('../Utils/ApiUtil/http')

describe("Nacionalidades", () => {
    it("Probar Endpoint que obtiene las Nacionalidades", async() => {        
        const response = await get(getNacionalidades())
        const resultado = response.data ? response.data:[]
        if (resultado){
            let total = resultado.length
            expect(total).toBeGreaterThan(0)
            console.log('Hay un total de Nacionalidades: '+total)
        } else {
            console.log("status: "+resultado)
        }
    })
})
