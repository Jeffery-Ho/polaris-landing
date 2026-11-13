import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = new URL(".", import.meta.url);
const outDir = "/opt/cursor/artifacts/polaris-qa";
const snap = "/tmp/polaris-v2-snapshot";
mkdirSync(outDir, { recursive: true });
rmSync("/tmp/polaris-chrome-matrix", { recursive: true, force: true });
rmSync(snap, { recursive: true, force: true });
mkdirSync(snap, { recursive: true });
const repo = fileURLToPath(new URL("../../", root));
const archive = execFileSync("git", ["archive", "origin/v2", "index.html", "checkout-return", "assets/pricing.css", "assets/checkout.css", "assets/checkout.js", "assets/checkout-return.js", "assets/theme.css", "assets/site-chrome.css", "assets/site.js", "assets/legal.css", "assets/footer.css", "support-config.js", "assets/feature-demos.js", "assets/release-notes.js", "icons", "fonts"], { cwd: repo, maxBuffer: 80 * 1024 * 1024 });
execFileSync("tar", ["-x", "-C", snap], { input: archive });

const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");
  let file = join(snap, decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname));
  try {
    if (statSync(file).isDirectory()) file = join(file, "index.html");
    const body = readFileSync(file);
    res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("missing");
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const chrome = spawn("google-chrome", ["--headless=new", "--disable-gpu", "--no-first-run", "--user-data-dir=/tmp/polaris-chrome-matrix", "--remote-debugging-port=9334", "about:blank"], { stdio: "ignore" });
await new Promise((resolve, reject) => {
  const started = Date.now();
  const timer = setInterval(async () => {
    try {
      await fetch("http://127.0.0.1:9334/json/version");
      clearInterval(timer);
      resolve();
    } catch {
      if (Date.now() - started > 15000) {
        clearInterval(timer);
        reject(new Error("chrome_debug_port"));
      }
    }
  }, 200);
});

const version = await (await fetch("http://127.0.0.1:9334/json/version")).json();
const list = await (await fetch("http://127.0.0.1:9334/json/list")).json();
const ws = new WebSocket(list[0].webSocketDebuggerUrl);
await new Promise((resolve) => { ws.addEventListener("open", resolve); });
let seq = 0;
const pending = new Map();
ws.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) pending.get(message.id)(message);
});
function send(method, params = {}) {
  const id = ++seq;
  return new Promise((resolve, reject) => {
    pending.set(id, (message) => message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result));
    ws.send(JSON.stringify({ id, method, params }));
  });
}
await send("Page.enable");
await send("Runtime.enable");
await send("Page.addScriptToEvaluateOnNewDocument", { source: `(() => {
  const locale = new URLSearchParams(location.search).get("qaLocale") || "en-US";
  const define = (target) => {
    try { Object.defineProperty(target, "language", { configurable: true, get: () => locale }); } catch (e) {}
    try { Object.defineProperty(target, "languages", { configurable: true, get: () => [locale] }); } catch (e) {}
  };
  define(Navigator.prototype);
  define(navigator);
  try { localStorage.removeItem("polaris-landing-locale"); } catch (e) {}
  window.__bootErrors = [];
  addEventListener("error", (event) => window.__bootErrors.push(String(event.message || event.error || "error")));
})();` });

const page = (locale) => `${origin}/?qaLocale=${encodeURIComponent(locale)}#pricing`;
const cases = [
  ["desktop-en-us", 1440, 900, "en-US", "America/New_York", false, page("en-US")],
  ["desktop-zh-cn", 1440, 900, "zh-CN", "Asia/Shanghai", false, page("zh-CN")],
  ["desktop-zh-hk", 1440, 900, "zh-HK", "Asia/Hong_Kong", false, page("zh-HK")],
  ["desktop-de-de", 1440, 900, "de-DE", "Europe/Berlin", false, page("de-DE")],
  ["desktop-fr-fr", 1440, 900, "fr-FR", "Europe/Paris", false, page("fr-FR")],
  ["desktop-en-gb", 1440, 900, "en-GB", "Europe/London", false, page("en-GB")],
  ["desktop-en-sg", 1440, 900, "en-SG", "Asia/Singapore", false, page("en-SG")],
  ["viewport-390-en-us", 390, 844, "en-US", "America/Los_Angeles", true, page("en-US")],
  ["viewport-390-zh-cn", 390, 844, "zh-CN", "Asia/Shanghai", true, page("zh-CN")],
  ["viewport-360-en-us", 360, 800, "en-US", "America/Los_Angeles", true, page("en-US")],
  ["viewport-320-zh-cn", 320, 700, "zh-CN", "Asia/Shanghai", true, page("zh-CN")],
  ["return-cancel-390", 390, 844, "en-US", "America/New_York", true, `${origin}/checkout-return/?result=cancel&qaLocale=en-US`],
  ["return-forged-success-390", 390, 844, "zh-CN", "Asia/Shanghai", true, `${origin}/checkout-return/?result=success&purchase=not-real&qaLocale=zh-CN`],
  ["return-paid-layout-390", 390, 844, "en-US", "America/New_York", true, `${origin}/checkout-return/?result=cancel&qaLocale=en-US&fixture=paid`]
];

const rows = [];
for (const [id, width, height, locale, timeZone, mobile, url] of cases) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  await send("Emulation.setTouchEmulationEnabled", { enabled: mobile });
  await send("Emulation.setLocaleOverride", { locale });
  await send("Emulation.setTimezoneOverride", { timezoneId: timeZone });
  const loaded = new Promise((resolve) => {
    const timer = setTimeout(resolve, 8000);
    const onMessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.method === "Page.loadEventFired") {
        clearTimeout(timer);
        ws.removeEventListener("message", onMessage);
        resolve();
      }
    };
    ws.addEventListener("message", onMessage);
  });
  await send("Page.navigate", { url });
  await loaded;
  await new Promise((resolve) => setTimeout(resolve, 250));
  const banner = `EMULATION Chrome headless ${version.Browser} | ${width}x${height} | locale ${locale} | tz ${timeZone} | touch ${mobile} | NOT a physical device, NOT Safari, NOT a regional network`;
  await send("Runtime.evaluate", { expression: `(() => {
    const bar = document.createElement("div");
    bar.textContent = ${JSON.stringify(banner)};
    bar.style.cssText = "position:sticky;top:0;z-index:99999;background:#241c15;color:#fff8ef;font:12px/1.4 sans-serif;padding:8px 10px;white-space:normal";
    document.body.prepend(bar);
    if (${JSON.stringify(id)}.includes("paid")) {
      document.querySelectorAll("[data-state]").forEach((el) => { el.hidden = el.dataset.state !== "paid"; });
      document.querySelectorAll("[data-license-key]").forEach((el) => { el.textContent = "FIXTURE-NOT-A-LICENSE"; });
    }
    document.querySelector(${width < 700 ? '"#pricing-pro"' : '"#pricing"'})?.scrollIntoView({ block: "start" });
  })()` });
  await new Promise((resolve) => setTimeout(resolve, 300));
  const metrics = await send("Runtime.evaluate", {
    expression: `(() => ({ lang: document.documentElement.lang, navigatorLanguage: navigator.language, savedLocale: localStorage.getItem("polaris-landing-locale"), bootErrors: window.__bootErrors || [], price: document.querySelector("#pricing-pro .pricing-price")?.textContent || "", term: document.querySelector("#pricing-pro .pricing-term")?.textContent || "", cta: document.querySelector("[data-web-checkout]")?.innerText || "", visibleState: [...document.querySelectorAll("[data-state]:not([hidden])")].map(el => el.dataset.state + ":" + (el.closest("[lang]")?.lang || "")), overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, plans: document.querySelectorAll(".pricing-plan").length, emailMinHeight: document.querySelector("input[type=email]") ? getComputedStyle(document.querySelector("input[type=email]")).minHeight : "" }))()`,
    returnByValue: true
  });
  const value = metrics.result.value;
  const shot = await send("Page.captureScreenshot", { format: "png" });
  const file = `${outDir}/${id}.png`;
  writeFileSync(file, Buffer.from(shot.data, "base64"));
  rows.push({ id, classification: "emulation_chrome_headless_viewport_locale", width, height, locale, timeZone, mobile, file, ...value, horizontalOverflowPx: value.overflow, priceText: value.price });
}

const observed = {
  engine: "Google Chrome headless",
  browser: version.Browser,
  real_safari: false,
  real_edge: false,
  real_firefox: false,
  real_physical_device: false,
  regional_network: false,
  egress_note: "Runner Cloudflare trace loc=US colo=IAD. Locale and timezone above are emulation only.",
  source: "local static snapshot of origin/v2, not a repeat live fetch",
  rows
};
const checkoutFile = "/tmp/polaris-live/checkout-url.txt";
if (existsSync(checkoutFile)) {
  await send("Emulation.setDeviceMetricsOverride", { width: 1100, height: 900, deviceScaleFactor: 1, mobile: false });
  const loaded = new Promise((resolve) => {
    const timer = setTimeout(resolve, 12000);
    const onMessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.method === "Page.loadEventFired") {
        clearTimeout(timer);
        ws.removeEventListener("message", onMessage);
        resolve();
      }
    };
    ws.addEventListener("message", onMessage);
  });
  await send("Page.navigate", { url: readFileSync(checkoutFile, "utf8").trim() });
  await loaded;
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const text = await send("Runtime.evaluate", { expression: "document.body ? document.body.innerText.slice(0, 4000) : ''", returnByValue: true });
  const visible = String(text.result.value || "");
  const needles = ["test mode", "alipay", "wechat", "apple pay", "google pay", "link", "card", "klarna", "cash app", "sepa", "bancontact", "ideal", "grabpay", "paynow", "usd", "$12.90", "12.90"];
  const seen = needles.filter((needle) => visible.toLowerCase().includes(needle));
  const shot = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${outDir}/stripe-test-checkout-us-egress.png`, Buffer.from(shot.data, "base64"));
  observed.stripe_checkout = {
    classification: "sandbox_checkout_observed_from_runner_us_egress_only",
    real_regional_matrix: false,
    card_entered: false,
    visible_markers: seen,
    screenshot: `${outDir}/stripe-test-checkout-us-egress.png`
  };
}
writeFileSync(new URL("./matrix-observed.json", root), JSON.stringify(observed, null, 2));
ws.close();
chrome.kill();
server.close();
console.log(JSON.stringify(rows.map((row) => ({ id: row.id, lang: row.lang, price: row.priceText, term: row.term, overflow: row.horizontalOverflowPx, state: row.visibleState })), null, 2));
