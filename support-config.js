export const supportConfig = Object.freeze({
  videoSource: "assets/polaris-introduction.mp4",
  // No website billing URL. Production checkout is POST /api/checkout/session and
  // requires an existing installation id plus X-Installation-Token. This page
  // cannot present that identity, and it must not call the test Worker.
  googleAnalyticsMeasurementId: "G-ERMV08R4XQ",
  sls: Object.freeze({
    host: "cn-hangzhou.log.aliyuncs.com",
    project: "polaris-ai-download",
    logstore: "web-events",
    stsTokenUrl: "https://get-sts-token-ezksivojtu.cn-hangzhou.fcapp.run/get_sts_token"
  })
});
