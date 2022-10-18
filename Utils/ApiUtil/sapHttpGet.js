const axios = require("axios");


const sapHttpGetResponse = async (config) => {
  try {
    let response = await
    axios.get(`${config.hostname}${config.path}`, {
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.KEY
      }
    });

    return response;
  }
  catch (err){
    return err.response;
  }
}

module.exports = { sapHttpGetResponse };
