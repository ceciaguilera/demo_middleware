const { validarCorreo, validaDocumentoDigitalizado, isBase64String } = require("../Utils/validaciones")

//---------------  /validate ---------------------------//
describe("Validacion de correo validos", () => {
    it("Prueba que para un correo valido, retorne positivo.", () => {
        let resultado = validarCorreo("correovalido@achs.cl");
            expect(resultado).toBe(true);
    });
    it("Prueba que para un correo valido, retorne positivo.", () => {
        let resultado = validarCorreo("correova.eslido@subdominio.achs.cl");
            expect(resultado).toBe(true);
    });
    it("Prueba que para un correo valido v2, retorne positivo.", () => {
        let resultado = validarCorreo("correo.valido123+prueba@achs.cl");
            expect(resultado).toBe(true);
    });
    it("Prueba que un correo mal ingresado, retorne negativo", () => {
        let resultado = validarCorreo("correocasivalido@achs,cl");
        expect(resultado).toBe(false);
    })
    it("Prueba que no se caiga si se ingresa un valor null", () => {
        let resultado = validarCorreo();
        expect(resultado).toBe(false);
    })
    it("Prueba que no se caiga si se ingresa un undefined", () => {
        let resultado = validarCorreo(undefined);
        expect(resultado).toBe(false);
    })
})

describe("Valida las respuestas de retorno de SAP al digitalizar documentos", () => {
    it("Retorna true si ha pasado todas las validaciones, para respuesta tipo array", () => {
        let response = [{
            Codigo: "0"
        },
        {
            Codigo: "0"
        }];
        expect(validaDocumentoDigitalizado(response)).toBe(true);
    });

    it("Retorna false si NO han pasado todas las validaciones, para respuesta tipo array", () => {
        let response = [{
            Codigo: "0"
        },
        {
            Codigo: "1"
        }];
        expect(validaDocumentoDigitalizado(response)).toBe(false);
    });

    it("Retorna true si ha pasado todas las validaciones, para respuesta tipo object", () => {
        let response = {
            Codigo: "0"
        };
        expect(validaDocumentoDigitalizado(response)).toBe(true);
    });

    it("Retorna false si NO han pasado todas las validaciones, para respuesta tipo object", () => {
        let response = {
            Codigo: "1"
        };
        expect(validaDocumentoDigitalizado(response)).toBe(false);
    });
    
    describe("Comprueba que la funcion isBase64String funcione correctamente.", () => {
       it("Retorna False si se le entrega un texto vacio o que obviamente no es base64", () => {
            expect(isBase64String("")).toBe(false);
            expect(isBase64String("tests")).toBe(false);
            expect(isBase64String()).toBe(false);
            expect(isBase64String(undefined)).toBe(false);
            expect(isBase64String(null)).toBe(false);
            expect(isBase64String(123)).toBe(false);
            expect(isBase64String(true)).toBe(false);
            expect(isBase64String({})).toBe(false);
            expect(isBase64String([])).toBe(false);
            expect(isBase64String("unafraselargaquenoesbase64")).toBe(false);
       });
       it("Retorna True si se le entrega un texto que es base64", () => {
            expect(isBase64String("dGVzdA==")).toBe(true);
       });
    });


});