const apiObjectResponse = require("./ApiObjectResponse");

/**
 * Implementa un reducer(sin redux) para mantener la inmutabilidad del objeto de respuesta
 * @param {* Respuesta del endpoint en express} response
 * @param {* HTTP request code}
 * @param {* Texto que indica si la operación fue exitosa o fallo} mensaje
 */
function apiResponseObjectReducer(response, mensaje) {
  return {
    ...apiObjectResponse,
    content: { ...apiObjectResponse.content, response },
    mensaje
  };
}
module.exports = apiResponseObjectReducer;
