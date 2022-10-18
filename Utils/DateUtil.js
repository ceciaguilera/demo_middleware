const monthArray = new Array();
monthArray[0] = "En";
monthArray[1] = "Febr";
monthArray[2] = "Mzo";
monthArray[3] = "Abr";
monthArray[4] = "Mayo";
monthArray[5] = "Jun";
monthArray[6] = "Jul";
monthArray[7] = "Ag";
monthArray[8] = "Sept";
monthArray[9] = "Oct";
monthArray[10] = "Nov";
monthArray[11] = "Dic";

const getDate = (dateString) => {
  if (typeof dateString === 'string' && dateString.length === 8){
    let year = dateString.substring(0, 4)
    let month = dateString.substring(4, 6)
    let day = dateString.substring(6, 8)
    date = new Date(year, (parseInt(month) - 1), day)
    dateString = `${date.getDate()} ${monthArray[date.getMonth()]} ${date.getFullYear()}`
  }

  return dateString
}

const getDateObj = (dateString) => {
  if (typeof dateString === 'string' && dateString.length === 8){
    let year = dateString.substring(0, 4)
    let month = dateString.substring(4, 6)
    let day = dateString.substring(6, 8)
    date = new Date(year, (parseInt(month) - 1), day)

    return date
  }

  return dateString
}

const getHora = (hourString) => {
  if (typeof hourString === 'string' && hourString.length === 6){
    let hour = hourString.substring(0, 2)
    let minute = hourString.substring(2, 4)
    hourString = `${hour}:${minute}`
  }

  return hourString
}

const getLocalDateTime = (date) => {
  if (date)
    date = new Date(date)
  else 
    date = new Date()
  return new Date(date.toLocaleString('en-US', { timeZone: 'America/Santiago' }));
}

module.exports = { getDate, getHora, getDateObj, getLocalDateTime }