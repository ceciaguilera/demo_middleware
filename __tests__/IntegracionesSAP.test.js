const axios = require("axios");
const { obtieneFirmaMedico } = require("../Utils/integracionSap");

jest.mock('axios');

describe("Valida el desarrollo de obtencion de firma del medico", () => {
    it("Debe obtener la firma del medico y devolver un output", async () => {
        axios.post.mockResolvedValue({
            data: {
                MT_ObtieneFIrmaProf_Response: {
                    Codigo_profesional: 10000000,
                    Firma_b64: "dGVzdA=="
                }
            },
            status: 200
        });
        let firma = await obtieneFirmaMedico("12345678-9");
        expect(firma.data).toBe("dGVzdA==");
        expect(axios.post).toHaveBeenCalledTimes(1);
    });

    it("Debe devolver un reject si el servicio no responde", async () => {
        axios.post.mockResolvedValue({
            data: {
                MT_ObtieneFIrmaProf_Response: {
                    Codigo_profesional: 10000000,
                    Firma_b64: "dGVzdA=="
                }
            },
            status: 500
        });
        //expect to rejects
        await expect(obtieneFirmaMedico("12345678-9")).rejects.not.toBeNull();
        expect.assertions(1);
    });
});