const dotenv = require("dotenv");
dotenv.config();
const getIsapres = require('../Request/isapres')
const get = require('../Utils/ApiUtil/http')

describe("Isapres", () => {
    it("Probar Endpoint que obtiene las Isapres", async() => {        
        const response = await get(getIsapres())
        const resultado = response.data ? response.data:[]
        if (resultado){
            let total = resultado.length
            expect(total).toBeGreaterThan(0)
            console.log('Hay un total de Isapres: '+total)
        } else {
            console.log("status: "+resultado)
        }
    })
})
