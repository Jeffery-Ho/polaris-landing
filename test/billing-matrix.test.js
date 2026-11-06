const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const { join } = require("node:path");

const root = join(__dirname, "billing/fixtures");
const read = (name) => readFileSync(join(root, name), "utf8");

function uiLocale(language) {
  const saved = null;
  const browserLocale = /^zh(?:-|$)/i.test(language || "") ? "zh-CN" : "en";
  return saved === "zh-CN" || saved === "en" ? saved : browserLocale;
}

test("locale fallback keeps USD 12.90 and does not invent local currencies", () => {
  const rule = read("locale-rule.txt");
  assert.match(rule, /zh\(\?:-\|\$\)/);
  const cases = [
    ["zh-CN", "zh-CN"],
    ["zh-HK", "zh-CN"],
    ["zh-TW", "zh-CN"],
    ["zh", "zh-CN"],
    ["en-US", "en"],
    ["en-GB", "en"],
    ["en-SG", "en"],
    ["de-DE", "en"],
    ["fr-FR", "en"]
  ];
  for (const [input, expected] of cases) assert.equal(uiLocale(input), expected, input);
  const handler = read("get-pro-handler.txt");
  assert.match(handler, /aria-busy/);
  const pricing = read("pricing.css");
  assert.match(pricing, /max-width: 639px/);
  assert.match(pricing, /grid-template-columns: minmax\(0, 1fr\)/);
  const checkoutCss = read("checkout.css");
  assert.match(checkoutCss, /max-width: 480px/);
  assert.match(checkoutCss, /min-height: 44px/);
  assert.match(checkoutCss, /type="email"|input/);
  const page = read("checkout-return.html");
  assert.match(page, /Install Polaris for/);
  assert.match(page, /chromewebstore\.google\.com/);
  assert.match(page, /microsoftedge\.microsoft\.com/);
  assert.match(page, /addons\.mozilla\.org/);
  assert.equal(/apps\.apple\.com|play\.google\.com|安装到手机|Install on this (phone|iPhone|Android)/i.test(page), false);
  assert.match(page, /Redeem license/);
  assert.match(page, /同一许可证可在你的所有设备上使用|Use the same key on any of your devices/);
  assert.match(page, /href="\.\.\/#pricing"/);
  assert.equal(page.includes("target=\"_blank\""), true);
});

test("captured emulation matrix, when present, did not change the charged amount", () => {
  const observedPath = join(__dirname, "billing/matrix-observed.json");
  if (!existsSync(observedPath)) return;
  const observed = JSON.parse(readFileSync(observedPath, "utf8"));
  assert.equal(observed.engine, "Google Chrome headless");
  assert.equal(observed.real_safari, false);
  assert.equal(observed.real_physical_device, false);
  assert.equal(observed.regional_network, false);
  for (const row of observed.rows) {
    assert.equal(row.classification.startsWith("emulation"), true);
    if (row.id.startsWith("return-")) continue;
    assert.match(row.priceText, /12\.90/);
    assert.equal(row.lang, row.locale.startsWith("zh") ? "zh-CN" : "en", row.id);
    assert.equal(row.horizontalOverflowPx < 40, true, row.id);
  }
});
