const axios = require("axios");

/**
 *
 * @param {*} url
 * @param {*} data
 */
const sapHttpPut = async (url, data) => {
  try {
    let { status } = await axios.put(url, data, {
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.KEY
      }
    });

    return status;
  }
  catch (err){
    return err.response.status;
  }
};

const sapHttpPutResponse = async (url, data) => {
  try {
    let response = await
    axios.put(url, data, {
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

module.exports = { sapHttpPut, sapHttpPutResponse };
