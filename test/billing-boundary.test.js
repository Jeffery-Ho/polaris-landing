import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createWebCheckout, PRODUCTION_BILLING_ORIGIN, REGULAR_PRICE_CENTS } from "../assets/checkout.js";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const proAnswer = "Yes. Polaris is free to use on two platforms at a time. Pro bought on this website is a one-time purchase of $19.99 for lifetime access. It unlocks every supported platform and a table of contents across the full conversation for very long chats. Inside the extension, the server charges $12.90 only while that installation's first 7 days are still open. This website cannot verify that trial and does not request $12.90.";

function mockFetch(handler) {
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    const body = options.body ? JSON.parse(options.body) : undefined;
    calls.push({ url: String(url), method: options.method, body });
    return handler(calls.at(-1));
  };
  return { fetchImpl, calls };
}

test("website checkout requests only the regular production price", async () => {
  const { fetchImpl, calls } = mockFetch((call) => {
    if (call.url.endsWith("/api/catalog")) {
      return Response.json({ plans: [{ id: "pro", currency: "usd", amount: 1999, originalAmount: 1999 }] });
    }
    return Response.json({
      checkoutUrl: "https://checkout.stripe.com/c/pay/cs_live_fixture",
      purchaseId: "purchase-1",
      claimToken: "claim-token",
      amount: 1999,
      currency: "usd",
      originalAmount: 1999
    });
  });
  const session = await createWebCheckout(PRODUCTION_BILLING_ORIGIN, fetchImpl);
  assert.equal(session.purchaseId, "purchase-1");
  assert.equal(calls[1].body.planId, "pro");
  assert.equal(calls[1].body.expectedAmount, REGULAR_PRICE_CENTS);
  assert.equal("installationId" in calls[1].body, false);
  assert.equal(calls.some((call) => call.url.includes("/api/trial/start")), false);
});

test("a missing catalog does not open checkout", async () => {
  const { fetchImpl, calls } = mockFetch(() => Response.json({ error: "not_found" }, { status: 404 }));
  await assert.rejects(createWebCheckout(PRODUCTION_BILLING_ORIGIN, fetchImpl), /not_found/);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.endsWith("/api/catalog"), true);
});

test("the website does not send the promotional amount or use the test worker", async () => {
  const home = await read("index.html");
  const config = await read("support-config.js");
  const checkout = await read("assets/checkout.js");
  assert.match(config, /billingApiUrl: "https:\/\/polaris-license-production\.hexianji\.workers\.dev"/);
  assert.doesNotMatch(config, /polaris-license-test/);
  assert.doesNotMatch(checkout, /expectedAmount: 1290|trial\/start|polaris-license-test/);
  assert.match(home, /data-web-checkout/);
  assert.match(home, /data-i18n="pricing\.pro\.cta">Get Pro</);
  assert.match(home, /"pricing\.pro\.cta": "购买 Pro"/);
  assert.match(home, /data-i18n="pricing\.pro\.price">\$19\.99</);
  assert.doesNotMatch(home, /"pricing\.pro\.price": "(US)?\$12\.90"/);
  const graph = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"];
  const offer = graph.find((node) => [].concat(node["@type"]).includes("SoftwareApplication")).offers.find((item) => item.name === "Pro");
  assert.equal(offer.price, "19.99");
  const faq = graph.find((node) => [].concat(node["@type"]).includes("FAQPage")).mainEntity.find((item) => item.name === "Is Polaris free?");
  assert.equal(faq.acceptedAnswer.text, proAnswer);
  assert.ok(home.includes(`>${proAnswer}</p>`));
});

test("the return page does not treat the query as a paid license", async () => {
  const script = await read("assets/checkout-return.js");
  const page = await read("checkout-return/index.html");
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
