const {
  getBase64,
  postDigitalizacion,
  postGenerateCodigoBarra,
  getDocumentosSAP,
} = require("../Request/documentos");
const { InsightTrace } = require("../Utils/ApiUtil/appInsight");
const get = require("../Utils/ApiUtil/http");
const {
  checkRequestLimit,
  ResErrorRequestLimit,
} = require("../Utils/ApiUtil/requestLimit");
const { sapHttpGetResponse } = require("../Utils/ApiUtil/sapHttpGet");
const { sapHttpPostResponse } = require("../Utils/ApiUtil/sapHttpPost");
const { getKeySapDigitalizacion } = require("../Utils/extraccionData");
const { validaDocumentoDigitalizado } = require("../Utils/validaciones");

class Documento {
  constructor() {
    this.CodDocumento = "";
    this.IdPaciente = "";
    this.IdSiniestro = "";
    this.IdEpisodio = "";
    this.idStorage = "";
    this.base64 = "";
    this.ClaseDocumento = "";
    this.GuardadoSAP = 0;
    this.Digitalizar = false;
    this.SecDoc = "";
    this.Tipo = "";
    this.TipoSAP = "";
    this.codigobarra = "";
    this.CodDEC5 = "";
    this.DescripcionDocumento = "";
    this.jsonDigitalizacion = {};
  }

  fillFromDoc(doc, bpPaciente, episodio, siniestro) {
    this.CodDocumento = doc.CodDocumento;
    this.IdPaciente = doc.IdPaciente || bpPaciente;
    this.IdSiniestro = doc.IdSiniestro || siniestro;
    this.IdEpisodio = doc.IdEpisodio || episodio;
    this.idStorage = doc.IdStorage;
    this.ClaseDocumento = doc.ClaseDocumento;
    this.GuardadoSAP = doc.GuardadoSAP;
    this.Digitalizar = doc.Digitalizar;
    this.SecDoc = doc.SecDoc;
    this.Tipo = doc.Tipo;
    this.TipoSAP = doc.TipoSAP;
    this.codigobarra = doc.codigobarra;
    this.CodDEC5 = doc.CodDEC5;
    this.DescripcionDocumento = doc.DescripcionDocumento;
  }

  async obtenerBase64() {
    return new Promise((resolve, reject) => {
      if (this.base64 !== "") return resolve(this.base64);
      get(getBase64(this.idStorage))
        .then((data) => {
          this.base64 = data.data.resultado.documento;
          resolve(data.content);
        })
        .catch((err) => {
          InsightTrace(
            `[Digitalizacion] siniestro=${this.idSiniestro} error al obtener documento base64: ${err}`,
            3,
            {
                error: err,
                idSiniestro: this.idSiniestro,
                codDocumento: this.CodDocumento,
                storageId: this.idStorage
            }
          );
          reject(err);
        });
    });
  }

  fillJsonDigitalizacion() {
    let { idDoc, secuencia } = getKeySapDigitalizacion(this, true);
    this.jsonDigitalizacion = {
      Documento: [
        {
          id_doc: idDoc,
          clase_doc: this.ClaseDocumento.trim(),
          secuencia,
          b64_doc: this.base64
        }
      ]
    };
  }

  async enviaDigitalizacion() {
    let responseDigi;

      try {
        if (this.base64 === "") await this.obtenerBase64();
        this.fillJsonDigitalizacion();
      } catch (err) {
        InsightTrace(
            `[Digitalizacion] siniestro=${this.idSiniestro} error al obtener documento base64: ${err}`,
            3,
            {
                error: err,
                idSiniestro: this.idSiniestro,
                codDocumento: this.CodDocumento,
                storageId: this.idStorage
            }
          );
      }
      try {
        responseDigi = await sapHttpPostResponse(
          postDigitalizacion(),
          this.jsonDigitalizacion
        );
      } catch (err) {
        InsightTrace(
          `[Digitalizacion] siniestro=${this.IdSiniestro} error al enviar documento a SAP: ${err}`,
          3,
          {
            error: err,
            idSiniestro: this.idSiniestro,
            codDocumento: this.CodDocumento,
            storageId: this.idStorage
        }
        );
      }
      try {
        checkRequestLimit(responseDigi);
      } catch (err) {
        InsightTrace(
          `[Digitalizacion] siniestro=${this.IdSiniestro} request limit excedido`,
          3,
          {
            error: err,
            idSiniestro: this.idSiniestro,
            codDocumento: this.CodDocumento,
            storageId: this.idStorage
          }
        );

        return { success: false, ...ResErrorRequestLimit(responseDigi) };
      }
      if (validaDocumentoDigitalizado(responseDigi.data.Retorno)) {
        this.GuardadoSAP = 1;
        delete this.base64;
        InsightTrace(
          `[Digitalizacion] siniestro=${this.IdSiniestro} documento digitalizado correctamente`,
          1,
          this
        );

        return { success: true };
      }
      InsightTrace(
        `[Digitalizacion] siniestro=${this.IdSiniestro} error al enviar documento a SAP`,
        3,
        {
            error: responseDigi.data,
            idSiniestro: this.idSiniestro,
            codDocumento: this.CodDocumento,
            storageId: this.idStorage
        }
      );

    return { success: this.GuardadoSAP === 1 };
  }

  async generarCodigoBarra() {
    let { idDoc } = getKeySapDigitalizacion(this, false);
    const json = {
      clase_doc: this.ClaseDocumento.trim(),
      id_doc: idDoc
    };

    return new Promise((resolve, reject) => {
      if (this.codigobarra !== "") return resolve(this.codigobarra);
      sapHttpPostResponse(postGenerateCodigoBarra(), json)
        .then((data) => {
          InsightTrace(
            `[CodigoBarra] siniestro=${this.IdSiniestro} codigo generado correctamente`,
            1,
            {
                data: data.data,
                idSiniestro: this.idSiniestro,
                codDocumento: this.CodDocumento,
                storageId: this.idStorage
            }
          );
          this.codigobarra = data.data.StringCodigo;
          resolve(data.data);
        })
        .catch((err) => {
          InsightTrace(
            `[CodigoBarra] siniestro=${this.IdSiniestro} error al obtener el codigo de barras: ${err}`,
            3,
            {
                error: err,
                idSiniestro: this.idSiniestro,
                codDocumento: this.CodDocumento,
                storageId: this.idStorage
            }
          );
          reject(err);
        });
    });
  }

  obtenerDocumentosSAP(siniestro) {
    return sapHttpGetResponse(getDocumentosSAP(siniestro))
      .then((data) => {
          return data.data;
      })
      .catch((err) => {
        InsightTrace(
          `[Documentos][SAP] siniestro=${siniestro} error al obtener documentos SAP: ${err}`,
          3,
          {
            error: err,
            idSiniestro: this.idSiniestro,
            codDocumento: this.codDocumento,
            storageId: this.idStorage
          }
        );
      });
  }
}

module.exports = { Documento };
