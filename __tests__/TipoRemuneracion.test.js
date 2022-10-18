const dotenv = require("dotenv");
dotenv.config();
const tipoRemuneracionRequest = require("../Request/tipoRemuneracion");
const get = require('../Utils/ApiUtil/http')

describe("Tipo Remuneracion",()=>{
    it("Probar Endpoint que obtiene los Tipo de Remuneracion", async()=>{        
        const response = await get(tipoRemuneracionRequest())
        const resultado = response.data ? response.data:[]
        if(resultado){
            let total = resultado.length
            expect(total).toBeGreaterThan(0)
            console.log('Hay un total de Tipo de Remuneracion: '+total)
        }else{
            console.log("status: "+resultado)
        }       
    })
})
