const axios = require("axios");

/**
 *
 * @param {*} url
 * @param {*} data
 */
const sapHttpPost = async (url, data) => {
  try {
    let { status } = await axios.post(url, data, {
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

const sapHttpPostResponse = async (url, data) => {
  try {
    return await
    axios.post(url, data, {
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.KEY
      }
    });
  }
  catch (err){
    return err.response;
  }
};

module.exports = { sapHttpPost, sapHttpPostResponse };
