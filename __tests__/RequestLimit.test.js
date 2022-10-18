const axios = require("axios");
const { checkRequestLimit, ResErrorRequestLimit } = require("../Utils/ApiUtil/requestLimit");
const { sapHttpPostResponse } = require("../Utils/ApiUtil/sapHttpPost");

jest.mock('axios');

describe("Prueba el correcto manejo en las peticiones con RequestLimit", () => {
    it("No se debe arrojar error si no se pasa campos", async () => {
        axios.post.mockResolvedValue({
        });
        await sapHttpPostResponse("http://achs.test/api/sap/test", {}).then(response => {
            expect(() => checkRequestLimit(null)).not.toThrow();
        });
    });

    it("Si no se detecta error de Request Limit, debe dejar continuar con la peticion de forma normal.", async () => {
        axios.post.mockResolvedValue({
            status: 200,
            data: {
                message: "Normal response."
            },
            headers: {
                'content-length': 84,
                'content-type': "application/json"
            }
        });
        await sapHttpPostResponse("http://achs.test/api/sap/test", {}).then(response => {
            expect(() => checkRequestLimit(response)).not.toThrow();
        });
    });

    it("Si se detecta error de Request Limit, debe gatillar excepcion.", async () => {
        axios.post.mockResolvedValue({
            status: 429,
            data: {
                statusCode: 429,
                message: "Rate limit is exceeded. Try again in 60 seconds."
            },
            headers: {
                'content-length': 84,
                'content-type': "application/json",
                reintentosenseg: "60",
                totalllamadas: "35",
                'request-context': "appId=cid-v1: 72858cfc-1167-4a78-b167-d7ee7bb96a7d",
                date: "Tue, 22 Feb 2022 18: 36: 01 GMT",
                connection: "close"
            }
        });
        await sapHttpPostResponse("http://achs.test/api/sap/test", {}).then(response => {
            expect(() => checkRequestLimit(response)).toThrow();
        });
    });

    it("Si se detecta error de Request Limit, debe retornar el tiempo de espera y el total de llamadas.", async () => {
        axios.post.mockResolvedValue({
            status: 429,
            data: {
                statusCode: 429,
                message: "Rate limit is exceeded. Try again in 60 seconds."
            },
            headers: {
                'content-length': 84,
                'content-type': "application/json",
                reintentosenseg: "60",
                totalllamadas: "35",
                'request-context': "appId=cid-v1: 72858cfc-1167-4a78-b167-d7ee7bb96a7d",
                date: "Tue, 22 Feb 2022 18: 36: 01 GMT",
                connection: "close"
            }
        });
        await sapHttpPostResponse("http://achs.test/api/sap/test", {}).then(response => {
            try {
                checkRequestLimit(response).toThrow();
            } catch (error) {
                expect(ResErrorRequestLimit(response)).toEqual({
                    tiempoEspera: 60,
                    totalLlamadas: 35
                });
            }
        });
    });

});