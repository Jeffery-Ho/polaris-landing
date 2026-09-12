import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const homepageSource = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("下载按钮解析 Latest Release 的版本化 ZIP 并直接导航到资产", () => {
  assert.match(homepageSource, /latestReleaseApiUrl = "https:\/\/api\.github\.com\/repos\/Jeffery-Ho\/Polaris-for-Web\/releases\/latest"/);
  assert.match(homepageSource, /fetch\(latestReleaseApiUrl/);
  assert.match(homepageSource, /releaseAssetNamePattern = \/\^Polaris-AI-/);
  assert.match(homepageSource, /candidate\.browser_download_url\.startsWith\(latestReleaseAssetPrefix\)/);
  assert.match(homepageSource, /localZipLink\.href = asset\.browser_download_url/);
  assert.match(homepageSource, /event\.preventDefault\(\)/);
  assert.match(homepageSource, /window\.location\.assign\(href\)/);
  assert.match(homepageSource, /asset: latestReleaseAssetName/);
  assert.match(homepageSource, /localZipLink\.href = latestReleasePageUrl/);
});
