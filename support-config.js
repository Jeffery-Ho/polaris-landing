export const supportConfig = Object.freeze({
  videoSource: "assets/polaris-introduction.mp4",
  // Stripe test-mode license Worker. Replace with the live Worker before selling on production.
  billingApiUrl: "https://polaris-license-test.hexianji.workers.dev",
  googleAnalyticsMeasurementId: "G-ERMV08R4XQ",
  sls: Object.freeze({
    host: "cn-hangzhou.log.aliyuncs.com",
    project: "polaris-ai-download",
    logstore: "web-events",
    stsTokenUrl: "https://get-sts-token-ezksivojtu.cn-hangzhou.fcapp.run/get_sts_token"
  })
});
