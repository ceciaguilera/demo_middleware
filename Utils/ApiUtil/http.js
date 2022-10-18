const axios = require("axios");
const axiosRetry = require("axios-retry");

axiosRetry(axios, { retries: 2 });

const get = (config) => {
  return new Promise((resolve, reject) => {
    const url = config.hostname + config.path;
    axios
      .get(url, config.headers)
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
module.exports = get;
