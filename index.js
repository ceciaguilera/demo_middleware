/**
 * Carga del SDK Azure Application Insights para NodeJS, por seguridad la instrumentation key
 * debe estar guardada en una variable de entorno en el servidor
 */
const dotenv = require("dotenv");
dotenv.config();

const express = require("express")
const morgan = require("morgan");
let compression = require('compression');

const patient = require("./routes/patient");
const isapres = require("./routes/isapres");
const medicos = require("./routes/medicos");
const afps = require("./routes/afps");
const ocupaciones = require("./routes/ocupaciones");
const regiones = require("./routes/regiones");
const comunas = require("./routes/comunas");
const tipoContrato = require("./routes/tipoContrato");
const jornadaTrabajo = require("./routes/jornadaTrabajo");
const tipoRemuneracion = require("./routes/tipoRemuneracion");
const categoriaOcupacional = require("./routes/categoriaOcupacional");
const sucursales = require("./routes/sucurales");
const profesiones = require("./routes/profesiones");
const alertas = require("./routes/alertas");
const episodio = require("./routes/episodio");
const siniestro = require("./routes/siniestro");
const documentos = require("./routes/documentos");
const paises = require("./routes/paises");
const nacionalidades = require("./routes/nacionalidades");
const idiomas = require("./routes/idiomas");
const tipoAccidenteTrayecto = require("./routes/tipoAccidenteTrayecto");
const gruposEtnico = require("./routes/grupo");
const criteriosGravedad = require("./routes/criteriosGravedad");
const tipoDenunciante = require("./routes/tipoDenunciante");
const licencias = require("./routes/licencias");
const partesCuerpo = require("./routes/partesCuerpo");
const lugarOcurrencia = require("./routes/lugarOcurrencia");
const codigoArea = require("./routes/codigoArea");
const actividadEconomica = require("./routes/actividadEconomica");

const app = express();
app.use(compression());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/patient", patient);
app.use("/api/isapres", isapres);
app.use("/api/medicos", medicos);
app.use("/api/ocupaciones", ocupaciones);
app.use("/api/regiones", regiones);
app.use("/api/comunas", comunas);
app.use("/api/afp", afps);
app.use("/api/sucursales", sucursales);
app.use("/api/grupo", gruposEtnico);
app.use("/api/tipoContrato", tipoContrato);
app.use("/api/jornadaTrabajo", jornadaTrabajo);
app.use("/api/tipoRemuneracion", tipoRemuneracion);
app.use("/api/categoriaOcupacional", categoriaOcupacional);
app.use("/api/profesiones", profesiones);
app.use("/api/alertas", alertas);
app.use("/api/episodio", episodio);
app.use("/api/siniestro", siniestro);
app.use("/api/documentos", documentos);
app.use("/api/nacionalidades", nacionalidades);
app.use("/api/paises", paises);
app.use("/api/idiomas", idiomas);
app.use("/api/tipoAccidenteTrayecto", tipoAccidenteTrayecto);
app.use("/api/criteriosGravedad", criteriosGravedad);
app.use("/api/tipoDenunciante", tipoDenunciante);
app.use("/api/licencias", licencias);
app.use("/api/partesCuerpo", partesCuerpo);
app.use("/api/lugarOcurrencia", lugarOcurrencia);
app.use("/api/codigoArea", codigoArea);
app.use("/api/actividadEconomica", actividadEconomica);

const port = 80;
app.listen(port, () => {
    console.log(`Listen on port ${port}`);
});
