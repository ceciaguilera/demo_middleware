// Se utiliza para formatear el siniestro
exports.SiniestroFormat = function(number, width) {
    let numberOutput = Math.abs(number); /* Valor absoluto del número */
    let length = number.toString().length; /* Largo del número */
    let zero = "0"; /* String de cero */

    if (width <= length) {
      if (number < 0)
        return "-" + numberOutput.toString();
       else
        return numberOutput.toString();
    } else {
      if (number < 0)
        return "-" + zero.repeat(width - length) + numberOutput.toString();
       else
        return zero.repeat(width - length) + numberOutput.toString();
    }
  }