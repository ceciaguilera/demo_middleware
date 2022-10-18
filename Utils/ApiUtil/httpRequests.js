const { ExceptionData } = require("applicationinsights/out/Declarations/Contracts");
const Axios = require("axios");

const httpPost = async (config, body, retry = 0) => {
  const { hostname, path } = config;
  let data;
  try{
     data = await Axios.post(`${hostname}${path}`, body, {});
  }
  catch (error){
    if (retry < 3)
      return await httpPost(config, body, retry + 1);
    // throw (error);
  }
  if (data!==undefined){
    if (data.status >= 400 && retry < 3)
      return await httpPost(config, body, retry + 1);
  }

  return data;
};

const httpGetRequest = async (config) => {
  const { hostname, path } = config;
  const { data } = await Axios.get(`${hostname}${path}`, {});

  return data;
};

const httpGetRequestParams = async (config, params) => {
  const { hostname, path } = config;
  const { data } = await Axios.get(`${hostname}${path}`, {
    data: {  ...params  }
  });

  return data;
};

module.exports = { httpPost, httpGetRequest, httpGetRequestParams };
