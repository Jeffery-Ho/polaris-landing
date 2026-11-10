import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createWebCheckout, PRODUCTION_BILLING_ORIGIN, PROMO_PRICE_CENTS, REGULAR_PRICE_CENTS } from "../assets/checkout.js";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const proAnswer = "Yes. Polaris is free to use on two platforms at a time. Pro is a one-time purchase that unlocks every supported platform and a table of contents across the full conversation for very long chats. It costs $12.90 during the first 7 days of the free trial, and $19.99 after that.";

function mockFetch(handler) {
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    const body = options.body ? JSON.parse(options.body) : undefined;
    calls.push({ url: String(url), method: options.method, body });
    return handler(calls.at(-1));
  };
  return { fetchImpl, calls };
}

test("website checkout requests the trial welcome price", async () => {
  const { fetchImpl, calls } = mockFetch((call) => {
    if (call.url.endsWith("/api/catalog")) {
      return Response.json({ plans: [{ id: "pro", currency: "usd", amount: 1290, originalAmount: 1999 }] });
    }
    return Response.json({
      checkoutUrl: "https://checkout.stripe.com/c/pay/cs_live_fixture",
      purchaseId: "purchase-1",
      claimToken: "claim-token",
      amount: 1290,
      currency: "usd",
      originalAmount: 1999
    });
  });
  const session = await createWebCheckout(PRODUCTION_BILLING_ORIGIN, fetchImpl);
  assert.equal(session.purchaseId, "purchase-1");
  assert.equal(calls[1].body.planId, "pro");
  assert.equal(calls[1].body.expectedAmount, PROMO_PRICE_CENTS);
  assert.equal("installationId" in calls[1].body, false);
  assert.equal(calls.some((call) => call.url.includes("/api/trial/start")), false);
});

test("a missing catalog does not open checkout", async () => {
  const { fetchImpl, calls } = mockFetch(() => Response.json({ error: "not_found" }, { status: 404 }));
  await assert.rejects(createWebCheckout(PRODUCTION_BILLING_ORIGIN, fetchImpl), /not_found/);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.endsWith("/api/catalog"), true);
});

test("the website requests the trial price from production and does not use the test worker", async () => {
  const home = await read("index.html");
  const checkout = await read("assets/checkout.js");
  assert.equal(PRODUCTION_BILLING_ORIGIN, "https://polaris-license-production.hexianji.workers.dev");
  assert.equal(PROMO_PRICE_CENTS, 1290);
  assert.equal(REGULAR_PRICE_CENTS, 1999);
  assert.match(home, /startCheckout\(PRODUCTION_BILLING_ORIGIN\)/);
  assert.doesNotMatch(home, /supportConfig\.billingApiUrl/);
  assert.match(checkout, /expectedAmount: PROMO_PRICE_CENTS/);
  assert.doesNotMatch(checkout, /trial\/start|polaris-license-test/);
  assert.match(home, /data-web-checkout/);
  assert.match(home, /data-i18n="pricing\.pro\.cta">Get Pro</);
  assert.match(home, /"pricing\.pro\.cta": "购买 Pro"/);
  assert.match(home, /data-i18n="pricing\.pro\.price">\$12\.90</);
  assert.match(home, /data-i18n="pricing\.pro\.was">\$19\.99</);
  assert.match(home, /"pricing\.pro\.price": "\$12\.90"/);
  assert.match(home, /"pricing\.pro\.price": "US\$12\.90"/);
  assert.match(home, /"pricing\.pro\.was": "\$19\.99"/);
  assert.match(home, /"pricing\.pro\.was": "US\$19\.99"/);
  assert.match(home, /data-i18n="pricing\.pro\.offer">\$12\.90 during the first 7 days of the free trial, then \$19\.99\.</);
  assert.match(home, /"pricing\.pro\.offer": "免费试用前 7 天内为 US\$12\.90，之后为 US\$19\.99/);
  const graph = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"];
  const offer = graph.find((node) => [].concat(node["@type"]).includes("SoftwareApplication")).offers.find((item) => item.name === "Pro");
  assert.equal(offer.price, "12.90");
  const faq = graph.find((node) => [].concat(node["@type"]).includes("FAQPage")).mainEntity.find((item) => item.name === "Is Polaris free?");
  assert.equal(faq.acceptedAnswer.text, proAnswer);
  assert.ok(home.includes(`>${proAnswer}</p>`));
});

test("the return page does not treat the query as a paid license", async () => {
  const script = await read("assets/checkout-return.js");
  const page = await read("checkout-return/index.html");
  assert.match(script, /claimLicense\(PRODUCTION_BILLING_ORIGIN, claim\)/);
  assert.doesNotMatch(script, /support-config\.js/);
  assert.match(script, /order\.status === "paid" && order\.licenseKey/);
  assert.match(script, /error\.status === 401/);
  assert.match(script, /else show\("unconfirmed"\)/);
  assert.doesNotMatch(script, /licenses\/recover|trial\/start/);
  assert.match(page, /data-state="unconfirmed"/);
  assert.match(page, /data-state="paid" hidden/);
  const productAt = page.indexOf('aria-label="Product"');
  const product = page.slice(productAt, page.indexOf('aria-label="Install', productAt));
  assert.doesNotMatch(product, /blog\//);
});
