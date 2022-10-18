const dotenv = require("dotenv");
dotenv.config();
const {
    getConfigVigencia,
    getConfigSucursalesVigentes,
  } = require("../Request/empresa")
const { getConfigPaciente } = require("../Request/paciente")
const getConfigSinietsro = require("../Request/sinietsro")
const get = require('../Utils/ApiUtil/http');

//---------------  /validate ---------------------------//
describe("VIGENCIA EMPRESA",()=>{
    it("Probar Endpoint que obtiene la Vigencia de una EMPRESA (ACHS)", async()=>{        
        const response = await get(getConfigVigencia("70360100-6"))
        const resultado = response.data ? response.data:[]
        if(resultado){
            let total = resultado.d.results.length
            expect(total).toBeGreaterThan(0)
            console.log('Vigencia de la EMPRESA: '+total)
        }else{
            console.log("status: "+resultado)
        }       
    })
})


describe("SUCURSALES EMPRESA",()=>{
    it("Probar Endpoint que obtiene las Sucursales una EMPRESA (ACHS)", async()=>{        
        const response = await get(getConfigSucursalesVigentes("70360100-6"))
        const resultado = response.data ? response.data:[]
        if(resultado){
            let total = resultado.length
            expect(total).toBeGreaterThan(0)
            console.log('Total de Sucursales la EMPRESA: '+total)
        }else{
            console.log("status: "+resultado)
        }       
    })
})

// describe("COTIZACION TRABAJADOR",()=>{
//     it("Probar Endpoint que obtiene las cotizaciones del trabajador(15004438-3)", async()=>{
//         
//         const { finalMonth, finalYear } = getFinalDate();
//         const { initialMonth, initialYear } = getInitialDate();
//         const response = await get(getConfigCotizacion('15004438-3',`${initialYear}${initialMonth}`,`${finalYear}${finalMonth}`));
//         const resultado = response.data ? response.data:[]
//         if(resultado){
//             let total = resultado.resultado.length
//             expect(total).toBeGreaterThan(0)
//             console.log('Total de COTIZACIONES: '+total)
//         }else{
//             console.log("status: "+resultado)
//         }       
//     })
// })

//---------------  /validate ---------------------------//

//---------------  /getPaciente ---------------------------//

describe("DATOS GENERALES PACIENTE",()=>{
    it("Probar Endpoint que obtiene lOs Datos Generales del Paciente", async()=>{        
        const response = await get(getConfigPaciente('15004438-3'));
        const resultado = response.data ? response.data:[]
        if(resultado){
            let total = resultado.length
            expect(total).toBeGreaterThan(0)
            console.log('Total de Datos del Paciente: '+total)
        }else{
            console.log("status: "+resultado)
        }       
    })
})

describe("SINIESTRO DEL PACIENTE",()=>{
    it("Probar Endpoint que obtiene los SINIESTROS del Paciente(BP-SERGIO_ 1002615349)", async()=>{        
        const response = await get(getConfigSinietsro("1002615349"));
        const resultado = response.data ? response.data:[]
        if(resultado){
            let total = resultado.length
            expect(total).toBeGreaterThan(-1)
            console.log('Total de SINIESTROS: '+total)
        }else{
            console.log("status: "+resultado)
        }       
    })
})
//---------------  /getPaciente ---------------------------//
