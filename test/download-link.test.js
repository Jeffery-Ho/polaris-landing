import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const homepageSource = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("下载按钮始终指向版本化 ZIP，并在 Latest Release API 失败时保留可下载回退", () => {
  assert.match(
    homepageSource,
    /href="https:\/\/github\.com\/Jeffery-Ho\/Polaris-for-Web\/releases\/download\/v\d+\.\d+\.\d+-build\.\d+\/Polaris-AI-\d+\.\d+\.\d+-build-\d+\.zip" data-analytics-event="zip_download"/
  );
  assert.match(homepageSource, /latestReleaseApiUrl = "https:\/\/api\.github\.com\/repos\/Jeffery-Ho\/Polaris-for-Web\/releases\/latest"/);
  assert.match(homepageSource, /fetch\(latestReleaseApiUrl/);
  assert.match(homepageSource, /signal: controller\.signal/);
  assert.match(homepageSource, /releaseAssetNamePattern = \/\^Polaris-AI-/);
  assert.match(homepageSource, /candidate\.browser_download_url\.startsWith\(latestReleaseAssetPrefix\)/);
  assert.match(homepageSource, /localZipLink\.href = asset\.browser_download_url/);
  assert.match(homepageSource, /asset: latestReleaseAssetName/);
  assert.match(homepageSource, /const latestReleaseFallbackUrl = localZipLink\.href/);
  assert.match(homepageSource, /url: latestReleaseFallbackUrl/);
  assert.match(homepageSource, /name: new URL\(latestReleaseFallbackUrl\)\.pathname\.split\("\/"\)\.pop\(\)/);
  assert.match(homepageSource, /localZipLink\.href = latestReleaseFallback\.url/);
  assert.match(homepageSource, /latestReleaseAssetName = latestReleaseFallback\.name/);
  assert.match(homepageSource, /localZipLink\.addEventListener\("click", \(event\) => \{/);
  assert.doesNotMatch(homepageSource, /const latestReleaseDownloadPromise/);
  assert.doesNotMatch(homepageSource, /await latestReleaseDownloadPromise/);
  assert.doesNotMatch(homepageSource, /window\.location\.assign\(/);
  assert.doesNotMatch(homepageSource, /event\.preventDefault\(\);\s+setZipDownloadLoading\(true\)/);
  assert.doesNotMatch(homepageSource, /localZipLink\.href = latestReleasePageUrl/);
});
