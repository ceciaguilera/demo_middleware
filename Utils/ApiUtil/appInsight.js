// INSIGHT//
if (process.env.APPINSIGHT) {
  const appInsights = require("applicationinsights");
    appInsights
    .setup(process.env.APPINSIGHT)
    .setAutoCollectRequests(false);
  appInsights.defaultClient.context.tags[
    appInsights.defaultClient.context.keys.cloudRole
  ] = "Integracion SAP";
  appInsights.start();
  let client = appInsights.defaultClient;
  // INSIGHT//

  const InsightEvent = (name, object = null) => {
    return new Promise((res, rej) => {
      try {
        client.trackEvent({name, properties: object});
        res();
      } catch (err) {
        console.log("catch de AppInsightEvent: ", err.message)
        rej(err);
      }
    })
  };

  const InsightTrace = (message, severity, object = null) => {
    return new Promise((res, rej) => {
      try {
        client.trackTrace({message, severity: GetSeverity(severity), properties: object});
        res();
      } catch (err) {
        console.log("catch de AppInsightTrace: ", err.message);
        rej(err);
      }
    });
  };

  const InsightException = (message, object = null) => {
    return new Promise((res, rej) => {
      try {
        client.trackException({message, severity: appInsights.Contracts.SeverityLevel.Error, properties: object});
        res();
      } catch (err) {
        console.log("catch de AppInsightException: ", err.message);
        rej(err);
      }
    });
  };

  const GetSeverity = (severity) => {
    switch (severity) {
      case 0:
        return appInsights.Contracts.SeverityLevel.Verbose;
      case 1:
        return appInsights.Contracts.SeverityLevel.Information;
      case 2:
        return appInsights.Contracts.SeverityLevel.Warning;
      case 3:
        return appInsights.Contracts.SeverityLevel.Error;
      case 4:
        return appInsights.Contracts.SeverityLevel.Critical;
      default:
        return appInsights.Contracts.SeverityLevel.Information;
    }
  };

  module.exports = {
      client,
      InsightEvent,
      InsightTrace,
      InsightException
  };
} else {
  module.exports = {
    client: {},
    InsightEvent: () => undefined,
    InsightTrace: () => undefined,
    InsightException: () => undefined
  };
}
