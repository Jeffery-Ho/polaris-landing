export const supportConfig = Object.freeze({
  videoSource: "assets/polaris-introduction.mp4",
  // Anonymous website purchases use the production web-session route at USD 19.99.
  // The test Worker is intentionally not configured here.
  billingApiUrl: "https://polaris-license-production.hexianji.workers.dev",
  googleAnalyticsMeasurementId: "G-ERMV08R4XQ",
  sls: Object.freeze({
    host: "cn-hangzhou.log.aliyuncs.com",
    project: "polaris-ai-download",
    logstore: "web-events",
    stsTokenUrl: "https://get-sts-token-ezksivojtu.cn-hangzhou.fcapp.run/get_sts_token"
  })
});
