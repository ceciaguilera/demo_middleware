const dotenv = require("dotenv");
dotenv.config();
const getGrupos = require('../Request/grupo')
const get = require('../Utils/ApiUtil/http')

describe("Grupos Étnicos", () => {
    it("Probar Endpoint que obtiene los Grupos Étnicos", async() => {        
        const resultado = await get(getGrupos())
        if (resultado) {
            let total = resultado.data.length
            expect(total).toBeGreaterThan(0)
            console.log('Hay un total de Grupos Étnicos: ' + total)
        } else {
            console.log("status: " + resultado)
        }
    })
})
