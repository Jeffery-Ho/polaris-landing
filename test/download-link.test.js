import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const homepageSource = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("下载按钮始终指向 Latest Release 的稳定 ZIP 资产", () => {
  assert.match(
    homepageSource,
    /href="https:\/\/github\.com\/Jeffery-Ho\/Polaris-for-Web\/releases\/latest\/download\/Polaris-AI\.zip" data-analytics-event="zip_download"/
  );
  assert.match(homepageSource, /let latestReleaseAssetName = "Polaris-AI\.zip"/);
  assert.match(homepageSource, /localZipLink\.addEventListener\("click", \(event\) => \{/);
  assert.doesNotMatch(homepageSource, /latestReleaseApiUrl/);
  assert.doesNotMatch(homepageSource, /resolveLatestReleaseDownload/);
  assert.doesNotMatch(homepageSource, /window\.location\.assign\(/);
  assert.doesNotMatch(homepageSource, /event\.preventDefault\(\);\s+setZipDownloadLoading\(true\)/);
});
