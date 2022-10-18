const { Documento } = require("../Models/documento.entity");
const { sapHttpPostResponse } = require('../Utils/ApiUtil/sapHttpPost')
const axios = require("axios");

jest.mock('axios');

const doc = {
    CodDocumento: "f3865d52-9cc4-4e59-846d-a12c6d320f09",
    IdPaciente: "1006932689",
    IdSiniestro: "0007107296",
    IdEpisodio: "0006026679",
    idStorage: "a272e60a-8298-42e9-bb72-c200537dd1d6",
    base64: "",
    ClaseDocumento: "ZAFISH46",
    GuardadoSAP: 0,
    Digitalizar: false,
    SecDoc: "[{\"secuencia\":\"-\", \"tipo_documento\":\"001\"},{\"secuencia\":\"0001\", \"tipo_documento\":\"072\"}]",
    Tipo: "1",
    TipoSAP: "001",
    codigobarra: "",
    CodDEC5: "",
    DescripcionDocumento: "Denuncia individual de accidente de trabajo",
}

describe("Prueba la funcionalidad de fillJsonDigitalizacion funcione correctamente", () => {
    it("Debe retornar un objeto con los datos de la digitalizacion", () => {
        const documento = new Documento();
        documento.fillFromDoc(doc);
        documento.fillJsonDigitalizacion();
        expect(documento.jsonDigitalizacion).toEqual({
            Documento: [
                {
                    id_doc: "1006932689SIN00100071072960002#1",
                    clase_doc: documento.ClaseDocumento.trim(),
                    secuencia: "0002",
                    b64_doc: documento.base64
                }
            ]
        });
    });
    
    it("Debe retornar el base64 del documento, y haber llamado solo una vez al get", async () => {
        axios.get.mockResolvedValue({
            data: {
                resultado: {
                    documento: "prueba"
                }
            }
        });

        const documento = new Documento();
        documento.fillFromDoc(doc);
        await documento.obtenerBase64();
        expect(documento.base64).toEqual("prueba");
        expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it("Debe buscar el codigo de barra del documento, y haber llamado solo una vez al post", async () => {
       axios.post.mockResolvedValue({
            data: {
                StringCodigo: "prueba"
            }
        }); 

        const documento = new Documento();
        documento.fillFromDoc(doc);
        await documento.generarCodigoBarra();
        expect(documento.codigobarra).toEqual("prueba");
        expect(axios.post).toHaveBeenCalledTimes(1);
        
    });
    
});


describe("Busca los documentos que estan en SAP para el siniestro", () => {
    it("Debe retornar un array con los documentos que estan en SAP", async () => {
        axios.get.mockResolvedValue({
            status: 200,
            data: [{
                "SAP_OBJECT": "BUS1309",
                "OBJECT_ID": "0007107392",
                "ARCHIV_ID": "ZP",
                "ARC_DOC_ID": "00505682475E1EDC97B58228397B77F1",
                "OBJECT_KEY": "1006917392SIN00100071073920002",
                "CLASS_NAME": "BUS1309",
                "AR_OBJECT": "ZAFISH46",
                "AR_DATE": "20211215",
                "RESERVE": "PDF",
                "ZSIN_IDSI": "0007107392",
                "ZSIN_IDSE": "0000000002"
            },
            {
                "SAP_OBJECT": "BUS1309",
                "OBJECT_ID": "0007107392",
                "ARCHIV_ID": "ZP",
                "ARC_DOC_ID": "00505682475E1EDC97B58363D8AE77F1",
                "OBJECT_KEY": "1006917392SIN07200071073920001",
                "CLASS_NAME": "BUS1309",
                "AR_OBJECT": "ZAFISH133",
                "AR_DATE": "20211215",
                "RESERVE": "PDF",
                "ZSIN_IDSI": "0007107392",
                "ZSIN_IDSE": "0000000001"
            }]
        });
        const dc = new Documento();
        const result = await dc.obtenerDocumentosSAP("0007107296");
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
            "SAP_OBJECT": "BUS1309",
            "OBJECT_ID": "0007107392",
            "ARCHIV_ID": "ZP",
            "ARC_DOC_ID": "00505682475E1EDC97B58228397B77F1",
            "OBJECT_KEY": "1006917392SIN00100071073920002",
            "CLASS_NAME": "BUS1309",
            "AR_OBJECT": "ZAFISH46",
            "AR_DATE": "20211215",
            "RESERVE": "PDF",
            "ZSIN_IDSI": "0007107392",
            "ZSIN_IDSE": "0000000002"
        });
    }
    );
});

describe('Busca los documentos DIAT / DIEP Empresa que están en SAP asociados a un rut', () => {
    test('Debe retornar un objeto con los documentos disponibles', async () => {
        axios.post.mockResolvedValue({
            status: 200,
            data: {
                "ID_sinies_T": "0007301859",
                "PATNR": 1003696557,
                "TIPO_DOC": "001",
                "Emisor": 2,
                "VERSNO": "00001",
                "FECHA": 20220525,
                "DIAT": {
                    "Fecha_accidente": 20220525,
                    "Hora_accidente": 160000,
                    "Describa_lo_que_estaba_haciendo": "prueba",
                    "Sitio_preciso": "prueba",
                    "Circunstancias": "PRUEBA"
                },
                "DIEP": {
                    "Fecha_inicio_sintomas": "00000000",
                    "fecha_exposicion_agente": "00000000"
                },
                "Clasificacion_Denunciante": {
                    "Rut": "10952963-K",
                    "Telefono": "000000",
                    "Nombre": "Subiabre VIDAL Alicia"
                }
            }
        })

        const result = await sapHttpPostResponse('http://achs.test/api/sap/test', { tipo_documento: 'RUT', num_documento: '10952963-K' })
        expect(result.data).toEqual({
            "ID_sinies_T": "0007301859",
            "PATNR": 1003696557,
            "TIPO_DOC": "001",
            "Emisor": 2,
            "VERSNO": "00001",
            "FECHA": 20220525,
            "DIAT": {
                "Fecha_accidente": 20220525,
                "Hora_accidente": 160000,
                "Describa_lo_que_estaba_haciendo": "prueba",
                "Sitio_preciso": "prueba",
                "Circunstancias": "PRUEBA"
            },
            "DIEP": {
                "Fecha_inicio_sintomas": "00000000",
                "fecha_exposicion_agente": "00000000"
            },
            "Clasificacion_Denunciante": {
                "Rut": "10952963-K",
                "Telefono": "000000",
                "Nombre": "Subiabre VIDAL Alicia"
            }
        })
    })
})