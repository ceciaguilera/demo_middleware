const { formatRut, getAdmisionId } = require("../Utils/helpers");

describe("Prueba la funcion para formatear rut", () => {
    it("Deberia retornar correctamente el rut sin puntos y con guion", () => {
        const rut = "17.856.856-3";
        const rutFormateado = "17856856-3";
        expect(formatRut(rut)).toBe(rutFormateado);
    });

    it("Deberia retornar correctamente el rut sin puntos y con guion, con K en mayuscula", () => {
        const rut = "17.856.856-k";
        const rutFormateado = "17856856-K";
        expect(formatRut(rut)).toBe(rutFormateado);
    });

    it("Deberia retornar un string vacio", () => {
        expect(formatRut("")).toBe("");
        expect(formatRut(null)).toBe("");
        expect(formatRut()).toBe("");
        expect(formatRut(undefined)).toBe("");
    });
});

describe("Prueba la funcion para obtener el ID de admision", () => {
    it("Deberia devolver 0 si no tiene los campos necesarios", () => {
        expect(getAdmisionId({})).toBe(0);
        expect(getAdmisionId()).toBe(0);
        expect(getAdmisionId({ data: {
            content: []
        }})).toBe(0);
   }); 

   it("Deberia retornar el id al tener los campos necesarios", () => {
        expect(getAdmisionId({ data: {
            content: [{
                id: 1
            }]
        }})).toBe(1);

        expect(getAdmisionId({ data: {
            content: [{
                id: 3
            }, {
                id: 6
            }]
        }})).toBe(3);
   });
    
});