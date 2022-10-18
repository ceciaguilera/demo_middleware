const dotenv = require("dotenv");
dotenv.config();
const tipoContratoRequest = require("../Request/tipoContrato");
const get = require('../Utils/ApiUtil/http')

describe("Tipo Contrato", () => {
    it("Probar Endpoint que obtiene los Tipo de Contrato", async() => {        
        const response = await get(tipoContratoRequest())
        const resultado = response.data ? response.data:[]
        if (resultado){
            let total = resultado.length
            expect(total).toBeGreaterThan(0)
            console.log('Hay un total de Tipo de Contrato: '+total)
        } else {
            console.log("status: "+resultado)
        }
    })
})
