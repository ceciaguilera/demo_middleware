

const checkRequestLimit = (response) => {
    if(response === null || response.status !== 429)
        return
    throw new Error(`Request limit reached. Try again in ${response.headers['reintentosenseg']} seconds.`);
}

const ResErrorRequestLimit = (response) => {
    return {
        tiempoEspera: parseInt(response.headers['reintentosenseg']),
        totalLlamadas: parseInt(response.headers['totalllamadas'])
    }
}

module.exports = { checkRequestLimit, ResErrorRequestLimit };