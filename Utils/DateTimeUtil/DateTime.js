const { restarFechas } = require("../extraccionData")

/**
 * Resta 2 meses a la fecha actual
 *
 */
const getInitialDate = () => {
    let date = new Date()
    date.setMonth(date.getMonth() - 3)
    const periodo = getDate(date)
    const initialMonth = periodo.month, initialYear = periodo.year
    return {initialMonth,initialYear}
}

const getFinalDate = () => {
    const date = new Date()
    const periodo = getDate(date)
    const finalMonth = periodo.month, finalYear = periodo.year
    return {finalMonth,finalYear}
}

const getDate = (date) => {
    let month = (date.getMonth() + 1)
    month = (month < 10) ? `0${month}` : month, year = date.getFullYear()
    return {month,year}
}


/**
 * Convierte el indice del mes en un mes formateado 0 => '01'
 * @param {*} index
 */
const formaterMonth = (index) => {
    let month = (index + 1)

    return (month < 10) ? String("0" + month) : String(month)
}
module.exports = {getInitialDate, getFinalDate}