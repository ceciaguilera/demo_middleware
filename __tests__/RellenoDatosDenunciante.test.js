const { clasificacionDenunciante, rutDenunciante, nombreDenunciante, telefonoDenunciante } = require("../Utils/formatear/objetos/formatDenunciante")

describe("Valida la función para obtener la clasificacion del denunciante", () => {
    it("Prueba que retorne el denunciante por defecto (2) si no se entrega uno valido", () => {
        expect(clasificacionDenunciante({ })).toBe(2);
    });

    it("Prueba que retorne el denunciante por defecto (2) si se le entrega un 0", () => {
        expect(clasificacionDenunciante({ id: 0, val: "" })).toBe(2);
    });

    it("Prueba que retorne el denunciante correspondiente formateado (1).", () => {
        expect(clasificacionDenunciante({ id: 1, val: "Empleador "})).toBe(1);
    });

    it("Prueba que retorne el denunciante correspondiente formateado (1), aunque se le pase como string.", () => {
        expect(clasificacionDenunciante({ id: "1", val: "Empleador "})).toBe(1);
    });
});

describe("Valida la funcion para obtener el rut del denunciante", () => {
    it("Prueba que retorne el rut formateado del paciente si no se le pasa el objeto del denunciante.", () => {
        expect(rutDenunciante({}, "15.004.438-3")).toBe("15004438-3");
    });

    it("Prueba que retorne el rut formateado del paciente si no se le pasa un rut valido del denunciante.", () => {
        expect(rutDenunciante({ val: "17.244.133-k", valid: false }, "15.004.438-3")).toBe("15004438-3");
    });

    it("Prueba que retorne el rut formateado del denunciante si es valido, con una K mayuscula", () => {
        expect(rutDenunciante({ val: "8.367.718-k", valid: true }, "15.004.438-3")).toBe("8367718-K");
    });

    it("Prueba que retorne un string vacio si no se tiene ningun rut.", () => {
        expect(rutDenunciante({ val: "8.367.718-k", valid: false }, "")).toBe("");
    });
});

describe("Valida la funcion para obtener el nombre del denunciante", () => {
    it("Prueba que retorne el nombre del denunciante tal como se le entrega.", () => {
        expect(nombreDenunciante({ val: "Paulo Rivera" }, { apellidoMaterno: "Rivera", apellidoPaterno: "Urbano", nombre: "Paulo", fechaNacimiento: "28-09-1989", masculino: "X", femenino: "", nacionalidad: "CL", pais: "CL", estadoCivil: "" })).toBe("Paulo Rivera")
    });

    it("Prueba que retorne el nombre del paciente si no se le entrega denunciante", () => {
        expect(nombreDenunciante({ }, { apellidoMaterno: "Rivera", apellidoPaterno: "Urbano", nombre: "Paulo", fechaNacimiento: "28-09-1989", masculino: "X", femenino: "", nacionalidad: "CL", pais: "CL", estadoCivil: "" })).toBe("Paulo Urbano Rivera")
    });

    it("Prueba que retorne un string vacio si los datos estan erroneos.", () => {
        expect(nombreDenunciante(undefined, { apellidoMaterno: "Rivera", nombre: "Paulo" })).toBe("")
    });
});

describe("Valida la funcion para obtener el telefono del denunciante o paciente", () => {
    it("Prueba que retorne el telefono del denunciante", () => {
        expect(telefonoDenunciante({ val: "+56 9 5893 4790", valid: true, noTel: false }, "")).toBe("958934790");
    });

    it("Prueba que retorne el telefono del paciente", () => {
        expect(telefonoDenunciante({ val: "+56 9 58", valid: false, noTel: false }, "+56 9 1234 5678")).toBe("912345678");
    });
})