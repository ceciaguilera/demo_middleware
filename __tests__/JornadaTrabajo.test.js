const dotenv = require("dotenv");
dotenv.config();
const jornadaTrabajoRequest = require("../Request/jornadaTrabajo");
const get = require('../Utils/ApiUtil/http')

describe("Jornada Trabajo", () => {
    it("Probar Endpoint que obtiene la Jornadas de Trabajo", async() => {        
        const response = await get(jornadaTrabajoRequest())
        const resultado = response.data ? response.data:[]
        if (resultado){
            let total = resultado.d.results.length
            expect(total).toBeGreaterThan(0)
            console.log('Hay un total de Jornadas: '+total)
        } else {
            console.log("status: "+resultado)
        }
    })
})
