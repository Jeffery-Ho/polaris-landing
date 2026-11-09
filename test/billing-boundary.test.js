import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const proAnswer = "Yes. Polaris is free to use on two platforms at a time. Pro is a one-time purchase of $19.99 for lifetime access. It unlocks every supported platform and a table of contents across the full conversation for very long chats. Inside the extension, the server charges $12.90 only while that installation's first 7 days are still open. This website cannot verify that trial and does not offer $12.90.";

test("the website does not call a billing worker or force the welcome price", async () => {
  const config = await read("support-config.js");
  const checkout = await read("assets/checkout.js");
  const home = await read("index.html");
  assert.doesNotMatch(config, /billingApiUrl|workers\.dev/);
  assert.doesNotMatch(checkout, /web-session|fetch\(|expectedAmount/);
  assert.doesNotMatch(home, /data-web-checkout|web-session|startCheckout|polaris-license-test/);
  assert.match(home, /data-i18n="pricing\.pro\.price">\$19\.99</);
  assert.match(home, /"pricing\.pro\.price": "\$19\.99"/);
  assert.match(home, /"pricing\.pro\.price": "US\$19\.99"/);
  assert.doesNotMatch(home, /"pricing\.pro\.price": "(US)?\$12\.90"/);
  const offer = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"]
    .find((node) => [].concat(node["@type"]).includes("SoftwareApplication"))
    .offers.find((item) => item.name === "Pro");
  assert.equal(offer.price, "19.99");
  assert.equal(offer.description.includes("$19.99"), true);
  assert.equal(offer.description.includes("does not offer $12.90"), true);
  const faq = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"]
    .find((node) => [].concat(node["@type"]).includes("FAQPage"))
    .mainEntity.find((item) => item.name === "Is Polaris free?");
  assert.equal(faq.acceptedAnswer.text, proAnswer);
  assert.ok(home.includes(`>${proAnswer}</p>`));
});

test("the return page does not treat the query as a paid license", async () => {
  const script = await read("assets/checkout-return.js");
  const page = await read("checkout-return/index.html");
  assert.doesNotMatch(script, /fetch\(|claimLicense|web-purchases|workers\.dev/);
  assert.match(script, /result === "cancel" \? "cancel" : "unconfirmed"/);
  assert.match(page, /data-state="unconfirmed"/);
  assert.match(page, /data-state="checking" hidden/);
  const productAt = page.indexOf('aria-label="Product"');
  const product = page.slice(productAt, page.indexOf('aria-label="Install', productAt));
  assert.doesNotMatch(product, /blog\//);
});
