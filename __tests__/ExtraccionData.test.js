const { getLocalDateTime } = require("../Utils/DateUtil");
const { getKeySapDigitalizacion, getListaLicenciasMedicas, formatearFecha, calculateDiasLicencia, formatDateToSap, formatTimeToSap, extraerNumeroDireccion} = require("../Utils/extraccionData");

describe("Prueba que se obtenga correctamente el idDoc y secuencia", () => {
    let doc = {
        IdEpisodio: "01234",
        Tipo: '2',
        TipoSAP: '074',
        SecDoc: "[{\"secuencia\":\"-\", \"tipo_documento\":\"001\"},{\"secuencia\":\"0001\", \"tipo_documento\":\"074\"}]",
        ClaseDocumento: 'ZAFISH46',
        IdPaciente: "01223465",
        IdSiniestro: "06145785"
    }
    it("Debe obtener correctamente el idDoc y secuencia cuando es Tipo 2", () => {
        expect(getKeySapDigitalizacion(doc, true)).toEqual({
            idDoc: `A000${doc.IdEpisodio}#2`,
            secuencia: ""
        });
    });

    it("Debe obtener correctamente el idDoc y secuencia cuando es Tipo 1 y ZAFISH46", () => {
        doc.Tipo = '1';
        expect(getKeySapDigitalizacion(doc, true)).toEqual({
            idDoc: `${doc.IdPaciente}SIN${doc.TipoSAP}${doc.IdSiniestro}0002#1`,
            secuencia: "0002"
        });
    });

    it("Debe obtener correctamente el idDoc y secuencia cuando es Tipo 1 ", () => {
        doc.Tipo = '1';
        doc.ClaseDocumento = 'ZAFISH157';
        expect(getKeySapDigitalizacion(doc, true)).toEqual({
            idDoc: `${doc.IdPaciente}SIN${doc.TipoSAP}${doc.IdSiniestro}0001#1`,
            secuencia: "0001"
        });
    });

    it("Debe poder procesar correctamente aunque llegue un dato como null cuando corresponde", () => {
        doc.TipoSAP = null;
        doc.ClaseDocumento = 'ZAFISH81';
        doc.DescripcionDocumento = 'Informativo próximas citaciones';
        doc.Tipo = '2';
    });
});

describe("Prueba que se obtenga correctamente las licencias", () => {
    let licencias= [
            {
                numLicense: "123456",
                startDate: "02-03-2022",
                endDate: "05-03-2022"
            },
            {
                numLicense: "1234567",
                startDate: "06-03-2022",
                endDate: "09-03-2022"
            }
    ]

    /* Licencias cuyas fechas de inicio y/o fin se solapan */
    let licencias_traslapadas= [
            {
                numLicense: "123456",
                startDate: "02-03-2022",
                endDate: "05-03-2022"
            },
            {
                numLicense: "1234567",
                startDate: "04-03-2022",
                endDate: "09-03-2022"
            }
    ]
    let usuarioSAP='SADIAZG'
    let fechaActual= new Date()
    it("Debe obtener correctamente la informacion de la licencias", () => {
        expect(getListaLicenciasMedicas(licencias, usuarioSAP)).toEqual(
            {
                error: false,
                data: [
                {
                Nrolicencia: '123456',
                FechaInicioReposo: '02.03.2022',
                FechaTerminoReposo: '05.03.2022',
                TipoAlta: '4',
                FechaIndicacionReposo: formatearFecha(fechaActual.toISOString()),
                FechaIndicacionAlta: formatearFecha(fechaActual.toISOString()),
                ResponsableReposo: 'SADIAZG',
                ResponsableAlta: 'SADIAZG',
                DiasReposo: 4
                },
                {
                Nrolicencia: '1234567',
                FechaInicioReposo: '06.03.2022',
                FechaTerminoReposo: '09.03.2022',
                TipoAlta: '4',
                FechaIndicacionReposo: formatearFecha(fechaActual.toISOString()),
                FechaIndicacionAlta: formatearFecha(fechaActual.toISOString()),
                ResponsableReposo: 'SADIAZG',
                ResponsableAlta: 'SADIAZG',
                DiasReposo: 4
                }
                ]
            }
        );
    });

    it("Debe obtener un error en la informacion de la licencias", () => {
        expect(getListaLicenciasMedicas(licencias_traslapadas, usuarioSAP)).toEqual(
            {
                error: true,
                data: [
                {
                Nrolicencia: '123456',
                FechaInicioReposo: '02.03.2022',
                FechaTerminoReposo: '05.03.2022',
                TipoAlta: '4',
                FechaIndicacionReposo: formatearFecha(fechaActual.toISOString()),
                FechaIndicacionAlta: formatearFecha(fechaActual.toISOString()),
                ResponsableReposo: 'SADIAZG',
                ResponsableAlta: 'SADIAZG',
                DiasReposo: 4
                },
                {
                Nrolicencia: '1234567',
                FechaInicioReposo: '04.03.2022',
                FechaTerminoReposo: '09.03.2022',
                TipoAlta: '4',
                FechaIndicacionReposo: formatearFecha(fechaActual.toISOString()),
                FechaIndicacionAlta: formatearFecha(fechaActual.toISOString()),
                ResponsableReposo: 'SADIAZG',
                ResponsableAlta: 'SADIAZG',
                DiasReposo: 6
                }
                ]
            }
        );
    });

    it("Debe obtener correctamente la informacion de las licencias", () => {
        licencias= []
        expect(getListaLicenciasMedicas(licencias, usuarioSAP)).toEqual({data: [], error: false});
    });
});

describe("Pruebas de formatear las fechas formato de entrada dd-mm-aaaa ", () => {
    let fechaActual= "11-03-2022"
    it("Debe formatear las fechas correctamente", () => {
        expect(formatearFecha(fechaActual)).toBe("11.03.2022");
    });
    it("Debe formatear las fechas correctamente formato de entrada dd/mm/aaaa", () => {
        fechaActual= "11/03/2022"
        expect(formatearFecha(fechaActual)).toBe("11.03.2022");
    });
});

describe("Pruebas calculos de días", () => {
    let licenciaFechaInicio="02-03-2022"
    let licenciaFechaTermino="05-03-2022"
    it("Debe calcular los dias por licencia", () => {
        expect(calculateDiasLicencia(licenciaFechaInicio, licenciaFechaTermino)).toBe(4)
    });
    it("Debe calcular los dias por licencia coincide fecha de inicio con fecha fin", () => {
        licenciaFechaTermino="02-03-2022"
       expect(calculateDiasLicencia(licenciaFechaInicio, licenciaFechaTermino)).toBe(1)
   });
});

describe("Prueba el formateo de la fecha que requiere sap", () => {
   it("Prueba pasandole una variable con la fecha correcta", () => {
      const actualDate = getLocalDateTime();
      const formattedDate = formatDateToSap(actualDate);
      expect(formattedDate).toContain(actualDate.getDate().toString());
      expect(formattedDate).toContain(".");
      expect(formattedDate).not.toContain("NaN");
   });
});

describe("Prueba el formateo de la hora que requiere sap", () => {
    it("Prueba pasandole una variable con la hora correcta", () => {
       const actualDate = new Date();
       const formattedDate = formatTimeToSap(actualDate);
       expect(formattedDate).toContain(actualDate.getHours().toString());
       expect(formattedDate).toContain(":");
    });
 });

 describe("Prueba la extraccion del numero de la direccion", () => {
    it("Deberia retornar solo 1234", () => {
       let direccion = "Avenida 10 de julio 1234, santiago centro, chile";
       expect(extraerNumeroDireccion(direccion)).toBe("1234");
       direccion = "Irarrazaval 1104, Ñuñoa, Santiago, Chile";
       expect(extraerNumeroDireccion(direccion)).toBe("1104");
    });

    it("Deberia retornar vacio", () => {
        let direccion = "Avenida 10 de julio, santiago centro, chile";
        expect(extraerNumeroDireccion(direccion)).toBe("");
        expect(extraerNumeroDireccion(null)).toBe("");
    });
 });