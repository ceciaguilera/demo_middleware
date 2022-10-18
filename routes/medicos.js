const Router = require("express-promise-router");
const apiResponseReducer = require("../Utils/ApiUtil/apiResponseReducer");
const { obtieneFirmaMedico } = require("../Utils/integracionSap");


const route = new Router();

/**
 * @api {Post} /medicos/firmaMedico Busca la imagen de la firma del medico en SAP
 * @param {string} rut Rut del medico
 * @returns {string} base64 de la imagen de la firma
 */
route.post("/firmaMedico", async (req, res) => {
    const { rut } = req.body;
    let firma = await obtieneFirmaMedico(rut).catch(err => {
        return res.status(500).json(apiResponseReducer(err.message, err.status));
    });
    if (firma.ok)
        return res.status(200).json(apiResponseReducer(firma.data, "Firma del medico obtenida correctamente"));
    return res.send(apiResponseReducer(null, firma.error));
});


module.exports = route;