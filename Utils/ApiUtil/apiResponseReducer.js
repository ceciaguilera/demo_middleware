const apiResponse = require("./ApiResponse");

/**
 * Implementa un reducer(sin redux) para mantener la inmutabilidad del objeto de respuesta
 * @param {* Respuesta del endpoint en express} response
 * @param {* HTTP request code}
 * @param {* Texto que indica si la operación fue exitosa o fallo} mensaje
 */
function apiResponseReducer(response, mensaje) {
  return {
    ...apiResponse,
    content: [ ...apiResponse.content, response ],
    mensaje
  };
}
module.exports = apiResponseReducer;
