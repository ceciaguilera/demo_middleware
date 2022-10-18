const handleErrorResponse = (error) => {

    let type = error.toString()

    let resultError = ""

    if (
        type.includes("TypeError")
        || type.includes("RangeError")
        || type.includes("EvalError")
        || type.includes("ReferenceError")
        || type.includes("SyntaxError")
        || type.includes("URIError")
        || type.includes("AggregateError")
        || type.includes("InternalError")
    ){
        resultError = {
            error: String(error)
        }
    } 
    else if(type.includes("object")){
        resultError = {error:JSON.stringify(error, getCircularReplacer()) }
    }
    else {
        resultError = {error};
    }

    return resultError
}

const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
            return;
        }
        seen.add(value);
        }
        return value;
    };
};

function ordenarAsc(p_array_json, p_key) {
    p_array_json.sort(function (a, b) {
       return a[p_key] > b[p_key];
    });
}

function spanishSortEqualizer(str) {
    let eqStr = str.toLowerCase()
    let equalizables = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ñ: 'nz', ' ': '' }

    eqStr = eqStr.replace(new RegExp(Object.keys(equalizables).join('|'), 'g'), (match) => equalizables[match])

    return eqStr
}

function formatRut(rut) {
    if (typeof rut === 'string')
        return rut.toUpperCase().replace(/\./g, "");
    return "";
}

function getAdmisionId(insertaAdmision) {
    if (!insertaAdmision || !insertaAdmision.data)
        return 0;
    if(insertaAdmision.data.content.length > 0)
        return insertaAdmision.data.content[0].id;
    return 0;
}

module.exports = {
    handleErrorResponse,
    ordenarAsc,
    spanishSortEqualizer,
    formatRut,
    getAdmisionId
}