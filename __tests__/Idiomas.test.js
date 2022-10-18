const dotenv = require("dotenv");
dotenv.config();
const getIdiomas = require('../Request/idiomas')
const get = require('../Utils/ApiUtil/http')

describe("Idiomas", () => {
    it("Probar Endpoint que obtiene los Idiomas", async() => {        
        const response = await get(getIdiomas())
        const resultado = response.data ? response.data : []
        if (resultado) {
            let total = resultado.length
            expect(total).toBeGreaterThan(0)
            console.log('Hay un total de Idiomas: ' + total)
        } else {
            console.log("status: " + resultado)
        }
    })
})