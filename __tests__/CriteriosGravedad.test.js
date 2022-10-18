const dotenv = require("dotenv");
dotenv.config();
const getCriteriosGravedad = require('../Request/criteriosGravedad')
const get = require('../Utils/ApiUtil/http')

describe("Criterios de Gravedad", () => {
    it("Probar Endpoint que obtiene los Criterios de Gravedad", async() => {
        const resultado = await get(getCriteriosGravedad())
        if (resultado) {
            let total = resultado.data.length
            expect(total).toBeGreaterThan(0)
            console.log('Hay un total de Criterios de Gravedad: ' + total)
        } else {
            console.log("status: " + resultado)
        }
    })
})