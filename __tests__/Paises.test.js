const dotenv = require("dotenv");
dotenv.config();
const getPaises = require('../Request/paises')
const get = require('../Utils/ApiUtil/http')

describe("Paises", () => {
    it("Probar Endpoint que obtiene los Paises", async() => {        
        const response = await get(getPaises())
        const resultado = response.data ? response.data:[]
        if (resultado){
            let total = resultado.length
            expect(total).toBeGreaterThan(0)
            console.log('Hay un total de Paises: '+total)
        } else {
            console.log("status: "+resultado)
        }
    })
})
