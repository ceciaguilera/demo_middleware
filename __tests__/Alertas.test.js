const dotenv = require("dotenv");
dotenv.config();
const {getNivel1, getNivel2, getNivel3} = require('../Request/alertas')
const get = require('../Utils/ApiUtil/http')

describe("Alertas", () => {
    it("Probar Endpoint que obtiene las Alertas Nivel 1", async() => {      
        const response = await get(getNivel1())
        const resultado = response.data ? response.data:[]
        if (resultado){
            let total = resultado.length
            expect(total).toBeGreaterThan(0)
            console.log('total Alertas Nivel 1: '+JSON.stringify(resultado))
        } else {
            console.log("status: "+resultado)
        }
    })

    it("Probar Endpoint que obtiene las Alertas Nivel 2", async() => {
        const response = await get(getNivel2())
        const resultado = response.data ? response.data:[]
        if (resultado){
            let total = resultado.length
            expect(total).toBeGreaterThan(0)
         //   console.log('total Alertas Nivel 2: '+JSON.stringify(resultado))
        } else {
          //  console.log("status: "+resultado)
        }
    })

    it("Probar Endpoint que obtiene las Alertas Nivel 3", async() => {
        const response = await get(getNivel3())
        const resultado = response.data ? response.data:[]
        if (resultado){
            let total = resultado.length
            expect(total).toBeGreaterThan(0)
          //  console.log('total Alertas Nivel 3: '+JSON.stringify(resultado))
        } else {
           // console.log("status: "+resultado)
        }
    })
})
