const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");

let harness;
let startHarness;
let postJson;
let postWebhook;
let paidEvent;

before(async () => {
  ({ startHarness, postJson, postWebhook, paidEvent } = await import("./billing/harness.mjs"));
  harness = await startHarness();
});

after(async () => {
  await harness?.close();
});

async function webSession(body, headers) {
  return postJson(harness.base, "/api/checkout/web-session", body, headers);
}

test("health reports the test worker version", async () => {
  const response = await fetch(`${harness.base}/health`);
  assert.deepEqual(await response.json(), { ok: true, env: "test", version: "0.1.3" });
});

test("web checkout rejects a live secret before calling Stripe", async () => {
  const live = await startHarness({ STRIPE_SECRET_KEY: "sk_live_not_used" });
  try {
    const before = live.stripe.calls.length;
    const response = await postJson(live.base, "/api/checkout/web-session", { planId: "pro", expectedAmount: 1290 });
    assert.equal(response.status, 503);
    assert.equal(response.data.error, "test_stripe_not_configured");
    assert.equal(live.stripe.calls.length, before);
    assert.equal(JSON.stringify(response.data).includes("sk_live"), false);
  } finally {
    await live.close();
  }
});

test("web checkout creates one test session at 1290 usd and returns to the site root", async () => {
  const response = await webSession({ planId: "pro", expectedAmount: 1290 });
  assert.equal(response.status, 200);
  assert.equal(response.data.amount, 1290);
  assert.equal(response.data.checkoutUrl.startsWith("https://checkout.stripe.com/c/pay/cs_test_"), true);
  const session = [...harness.stripe.sessions.values()].at(-1);
  const success = new URL(session.success_url);
  const cancel = new URL(session.cancel_url);
  assert.equal(success.origin, "https://polaris-ai.work");
  assert.equal(success.pathname, "/checkout-return/");
  assert.equal(success.searchParams.get("result"), "success");
  assert.equal(success.searchParams.get("purchase"), response.data.purchaseId);
  assert.equal(success.pathname.includes("/v2/"), false);
  assert.equal(cancel.searchParams.get("result"), "cancel");
  assert.equal(session.line_price, "price_promo_test");
  const stripeCall = harness.stripe.calls.find((call) => call.path === "checkout/sessions");
  assert.equal(stripeCall.idempotencyKey, response.data.purchaseId);
});

test("a second click creates a second purchase; the same idempotency key does not", async () => {
  const first = await webSession({ planId: "pro", expectedAmount: 1290 });
  const second = await webSession({ planId: "pro", expectedAmount: 1290 });
  assert.notEqual(first.data.purchaseId, second.data.purchaseId);
  const session = [...harness.stripe.sessions.values()].at(-1);
  const sizeBefore = harness.stripe.sessions.size;
  await harness.stripe.fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { "Idempotency-Key": session.metadata.purchaseId },
    body: new URLSearchParams()
  });
  assert.equal(harness.stripe.sessions.size, sizeBefore);
});

test("validation and origin failures do not create a session", async () => {
  const before = harness.stripe.sessions.size;
  assert.equal((await webSession({ planId: "enterprise", expectedAmount: 1290 })).data.error, "invalid_plan");
  assert.equal((await webSession({ planId: "pro", expectedAmount: 1200 })).data.error, "price_changed");
  assert.equal((await webSession("not-json")).data.error, "invalid_json");
  const missing = await postJson(harness.base, "/api/checkout/web-session", { planId: "pro", expectedAmount: 1290 }, { origin: "" });
  assert.equal(missing.status, 403);
  assert.equal(missing.data.error, "origin_required");
  const evil = await postJson(harness.base, "/api/checkout/web-session", { planId: "pro", expectedAmount: 1290 }, { origin: "https://evil.example" });
  assert.equal(evil.status, 403);
  assert.equal(evil.data.error, "origin_not_allowed");
  assert.equal(evil.headers.get("access-control-allow-origin"), null);
  assert.equal(harness.stripe.sessions.size, before);
});

test("livemode responses and non-test session ids are rejected", async () => {
  harness.stripe.state.livemode = true;
  try {
    const response = await webSession({ planId: "pro", expectedAmount: 1290 });
    assert.equal(response.status, 502);
    assert.equal(response.data.error, "live_mode_rejected");
  } finally {
    harness.stripe.state.livemode = false;
  }
});

test("unpaid, failed, then async success issues exactly one license", async () => {
  const created = await webSession({ planId: "pro", expectedAmount: 1290 });
  const session = [...harness.stripe.sessions.values()].at(-1);
  harness.stripe.markPaid(session.id, { paymentStatus: "unpaid", intentStatus: "requires_payment_method", sessionStatus: "complete", email: "buyer@example.com" });
  const unpaid = await postWebhook(harness, paidEvent(session));
  assert.equal(unpaid.status, 200);
  const pending = await postJson(harness.base, "/api/web-purchases/claim", {
    purchaseId: created.data.purchaseId,
    claimToken: created.data.claimToken
  });
  assert.equal(pending.data.status, "pending");
  assert.equal(pending.data.licenseKey, undefined);

  harness.stripe.markPaid(session.id, { paymentStatus: "unpaid", intentStatus: "requires_payment_method", sessionStatus: "complete" });
  const failed = await postWebhook(harness, paidEvent(session, "checkout.session.async_payment_failed"));
  assert.equal(failed.status, 200);
  const failedClaim = await postJson(harness.base, "/api/web-purchases/claim", {
    purchaseId: created.data.purchaseId,
    claimToken: created.data.claimToken
  });
  assert.equal(failedClaim.data.status, "failed");

  harness.stripe.markPaid(session.id, { email: "buyer@example.com" });
  const paid = await postWebhook(harness, paidEvent(session, "checkout.session.async_payment_succeeded"));
  assert.equal(paid.status, 200);
  const claim = await postJson(harness.base, "/api/web-purchases/claim", {
    purchaseId: created.data.purchaseId,
    claimToken: created.data.claimToken
  });
  assert.equal(claim.data.status, "paid");
  assert.match(claim.data.licenseKey, /^POL-/);
  const licenses = harness.db.prepare("SELECT COUNT(*) AS c FROM polaris_billing_licenses WHERE purchase_id=?").bind(created.data.purchaseId).first().c;
  assert.equal(licenses, 1);
});

test("forged success, wrong token, and duplicate events do not mint a second license", async () => {
  const created = await webSession({ planId: "pro", expectedAmount: 1290 });
  const session = [...harness.stripe.sessions.values()].at(-1);
  const forged = await postJson(harness.base, "/api/web-purchases/claim", {
    purchaseId: created.data.purchaseId,
    claimToken: "forged-token"
  });
  assert.equal(forged.status, 401);
  assert.equal(forged.data.error, "invalid_claim");
  assert.equal(JSON.stringify(forged.data).includes("sk_test"), false);

  harness.stripe.markPaid(session.id, { email: "buyer@example.com" });
  const event = paidEvent(session);
  await Promise.all(Array.from({ length: 25 }, () => postWebhook(harness, event)));
  const licenses = harness.db.prepare("SELECT COUNT(*) AS c FROM polaris_billing_licenses WHERE purchase_id=?").bind(created.data.purchaseId).first().c;
  assert.equal(licenses, 1);
  const claim = await postJson(harness.base, "/api/web-purchases/claim", {
    purchaseId: created.data.purchaseId,
    claimToken: created.data.claimToken
  });
  assert.match(claim.data.licenseKey, /^POL-/);
});

test("a later failure event does not revoke a license while Stripe still says paid", async () => {
  const created = await webSession({ planId: "pro", expectedAmount: 1290 });
  const session = [...harness.stripe.sessions.values()].at(-1);
  harness.stripe.markPaid(session.id);
  await postWebhook(harness, paidEvent(session, "checkout.session.async_payment_failed"));
  const claim = await postJson(harness.base, "/api/web-purchases/claim", {
    purchaseId: created.data.purchaseId,
    claimToken: created.data.claimToken
  });
  assert.equal(claim.data.status, "paid");
});

test("amount mismatch does not issue a license", async () => {
  const created = await webSession({ planId: "pro", expectedAmount: 1290 });
  const session = [...harness.stripe.sessions.values()].at(-1);
  harness.stripe.markPaid(session.id, { amount: 100 });
  const response = await postWebhook(harness, paidEvent(session));
  assert.equal(response.status, 400);
  assert.equal(response.data.error, "amount_mismatch");
  const claim = await postJson(harness.base, "/api/web-purchases/claim", {
    purchaseId: created.data.purchaseId,
    claimToken: created.data.claimToken
  });
  assert.notEqual(claim.data.status, "paid");
});

test("bad webhook signatures and live events are refused", async () => {
  const response = await postJson(harness.base, "/api/stripe/webhook", JSON.stringify({ id: "evt_x", livemode: false }), {
    "stripe-signature": "t=1,v1=00",
    origin: ""
  });
  assert.equal(response.status, 400);
  assert.equal(response.data.error, "invalid_signature");
  const { signStripe } = await import("./billing/harness.mjs");
  const payload = JSON.stringify({ id: "evt_live", type: "checkout.session.completed", livemode: true, data: { object: {} } });
  const live = await postJson(harness.base, "/api/stripe/webhook", payload, {
    "stripe-signature": await signStripe(harness.env.STRIPE_WEBHOOK_SECRET, payload),
    origin: ""
  });
  assert.equal(live.status, 400);
  assert.equal(live.data.error, "live_mode_rejected");
});

test("extension promo and post-trial prices stay 12.90 then 19.99 usd", async () => {
  const installationId = "install-local-1";
  const installationToken = "t".repeat(40);
  const started = await postJson(harness.base, "/api/trial/start", { installationId, installationToken });
  assert.equal(started.status, 200);
  const promo = await fetch(`${harness.base}/api/plans?installationId=${installationId}`, { headers: { "x-installation-token": installationToken, origin: "https://polaris-ai.work" } });
  const promoBody = await promo.json();
  assert.equal(promoBody.plans[0].amount, 1290);
  assert.equal(promoBody.plans[0].currency, "usd");
  assert.equal(promoBody.plans[0].originalAmount, 1999);
  harness.db.prepare("UPDATE polaris_billing_installations SET trial_ends_at=? WHERE secret_hash IS NOT NULL").bind(Date.now() - 1000).run();
  const later = await fetch(`${harness.base}/api/plans?installationId=${installationId}`, { headers: { "x-installation-token": installationToken, origin: "https://polaris-ai.work" } });
  assert.equal((await later.json()).plans[0].amount, 1999);
});

test("recovery returns one message and does not send mail", async () => {
  const known = await postJson(harness.base, "/api/licenses/recover", { email: "buyer@example.com" });
  const unknown = await postJson(harness.base, "/api/licenses/recover", { email: "nobody@example.com" });
  assert.equal(known.data.message, unknown.data.message);
  assert.equal(harness.stripe.calls.some((call) => call.host === "resend"), false);
  const before = harness.stripe.calls.length;
  await harness.worker.scheduled(null, harness.env);
  assert.equal(harness.stripe.calls.length, before);
});

test("checkout client keeps the claim local and refuses a non-Stripe url", async () => {
  const assigned = [];
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value)
  };
  globalThis.window = { location: { assign(url) { assigned.push(url); } } };
  const { startCheckout, WEB_PRICE_CENTS } = await import("./billing/fixtures/checkout.js");
  assert.equal(WEB_PRICE_CENTS, 1290);
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ checkoutUrl: "https://evil.example/pay", purchaseId: "p", claimToken: "c" }), { status: 200 });
  await assert.rejects(startCheckout("https://license.local"), /invalid_checkout/);
  assert.equal(assigned.length, 0);
  globalThis.fetch = original;
});

test("same-button busy guard collapses a double click", async () => {
  const source = require("node:fs").readFileSync(require("node:path").join(__dirname, "billing/fixtures/get-pro-handler.txt"), "utf8");
  assert.match(source, /aria-busy/);
  assert.match(source, /startCheckout/);
  let calls = 0;
  const link = { busy: null, getAttribute: () => link.busy, setAttribute: (_name, value) => { link.busy = value; } };
  async function click() {
    if (link.getAttribute("aria-busy") === "true") return;
    link.setAttribute("aria-busy", "true");
    calls += 1;
    await Promise.resolve();
  }
  click();
  click();
  await Promise.resolve();
  assert.equal(calls, 1);
});
