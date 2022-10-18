

function validarCorreo(correo){
    if(!correo || correo === undefined)
        return false;
    const regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    return regex.test(String(correo).toLowerCase());
}

const validaDocumentoDigitalizado = (response) => {
    if(Array.isArray(response))
        return response.filter(res => res.Codigo.toString() === "0").length === response.length;
    return response.Codigo.toString() === "0";
}

const isBase64String = (string) => {
    if (!string || typeof string !== 'string')
        return false;
    return string.length % 4 == 0 && /^[A-Za-z0-9+/]+[=]{0,3}$/.test(string);
}


module.exports = {
    validarCorreo,
    validaDocumentoDigitalizado,
    isBase64String
}