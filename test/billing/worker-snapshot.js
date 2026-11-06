var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/crypto.js
var encoder = new TextEncoder();
var randomToken = /* @__PURE__ */ __name(() => Array.from(crypto.getRandomValues(new Uint8Array(32)), (n) => n.toString(16).padStart(2, "0")).join(""), "randomToken");
async function hash(secret, value) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return Array.from(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))), (n) => n.toString(16).padStart(2, "0")).join("");
}
__name(hash, "hash");
function equal(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
__name(equal, "equal");
async function cipherKey(secret) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(secret));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}
__name(cipherKey, "cipherKey");
async function seal(secret, value) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await cipherKey(secret), encoder.encode(JSON.stringify(value))));
  return btoa(String.fromCharCode(...iv, ...encrypted));
}
__name(seal, "seal");
async function unseal(secret, value) {
  const bytes = Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes.slice(0, 12) }, await cipherKey(secret), bytes.slice(12))));
}
__name(unseal, "unseal");
async function verifyWebhook(body2, header, secret, now = Date.now()) {
  const pairs = (header || "").split(",").map((v) => v.split("="));
  const timestamp = Number(pairs.find(([k]) => k === "t")?.[1]);
  if (!Number.isSafeInteger(timestamp) || Math.abs(now / 1e3 - timestamp) > 300) return false;
  const expected = await hash(secret, `${timestamp}.${body2}`);
  return pairs.some(([k, v]) => k === "v1" && equal(v, expected));
}
__name(verifyWebhook, "verifyWebhook");

// src/stripe.js
var ApiError = class extends Error {
  static {
    __name(this, "ApiError");
  }
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
};
async function stripe(env, path, { method = "GET", body: body2, idempotencyKey } = {}) {
  if (!/^(sk|rk)_test_/.test(env.STRIPE_SECRET_KEY || "")) throw new ApiError(503, "test_stripe_not_configured");
  const headers = { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, "Stripe-Version": "2026-10-28.endive" };
  if (body2) headers["Content-Type"] = "application/x-www-form-urlencoded";
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  const response = await fetch(`https://api.stripe.com/v1/${path}`, { method, headers, body: body2 ? new URLSearchParams(body2) : void 0 });
  if (!response.ok) throw new ApiError(502, "stripe_unavailable");
  const result = await response.json();
  if (result.livemode === true) throw new ApiError(502, "live_mode_rejected");
  return result;
}
__name(stripe, "stripe");

// src/index.js
var DAY = 864e5;
var PLAN = "pro";
var json = /* @__PURE__ */ __name((data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } }), "json");
var stmt = /* @__PURE__ */ __name((env, sql, ...args) => env.DB.prepare(sql).bind(...args), "stmt");
var one = /* @__PURE__ */ __name((env, sql, ...args) => stmt(env, sql, ...args).first(), "one");
function configured(env) {
  if (!env.DB || !env.LICENSE_HASH_SECRET || env.LICENSE_HASH_SECRET.length < 32 || !env.LICENSE_DELIVERY_ENCRYPTION_KEY || env.LICENSE_DELIVERY_ENCRYPTION_KEY.length < 32) throw new ApiError(503, "test_environment_not_configured");
}
__name(configured, "configured");
function text(value, max = 256) {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new ApiError(400, "invalid_request");
  return value.trim();
}
__name(text, "text");
var installationHash = /* @__PURE__ */ __name((env, id) => hash(env.LICENSE_HASH_SECRET, `installation:${text(id)}`), "installationHash");
var WEB_AMOUNT = 1290;
var webPurchaseHash = /* @__PURE__ */ __name((env, id) => hash(env.LICENSE_HASH_SECRET, `web-purchase:${id}`), "webPurchaseHash");
function webReturnOrigin(req) {
  const origin = req.headers.get("Origin");
  if (!origin) throw new ApiError(403, "origin_required");
  const url = new URL(origin), local = url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname);
  if (url.protocol !== "https:" && !local) throw new ApiError(403, "origin_not_allowed");
  return url.origin;
}
__name(webReturnOrigin, "webReturnOrigin");
async function createCheckout(env, { amount, priceId, installationHash: installationHash2, returnBase, channel }) {
  if (!priceId) throw new ApiError(503, "prices_not_configured");
  const price = await stripe(env, `prices/${encodeURIComponent(priceId)}`);
  if (price.active !== true || price.currency !== "usd" || price.unit_amount !== amount || price.type !== "one_time") throw new ApiError(503, "price_configuration_mismatch");
  const id = crypto.randomUUID(), claim = randomToken(), hashValue = installationHash2 ?? await webPurchaseHash(env, id);
  await stmt(env, "INSERT INTO polaris_billing_purchase_intents(id,installation_hash,claim_hash,claim_expires_at,amount,created_at) VALUES(?,?,?,?,?,?)", id, hashValue, await hash(env.LICENSE_HASH_SECRET, `claim:${claim}`), Date.now() + DAY, amount, Date.now()).run();
  const back = /* @__PURE__ */ __name((result) => {
    const url = new URL("/checkout-return/", returnBase);
    url.searchParams.set("result", result);
    if (channel === "web") url.searchParams.set("purchase", id);
    return url.href;
  }, "back");
  const session = await stripe(env, "checkout/sessions", { method: "POST", idempotencyKey: id, body: { mode: "payment", "line_items[0][price]": priceId, "line_items[0][quantity]": "1", "metadata[purchaseId]": id, "metadata[channel]": channel, success_url: back("success"), cancel_url: back("cancel") } });
  if (!session.id?.startsWith("cs_test_") || new URL(session.url).origin !== "https://checkout.stripe.com") throw new ApiError(502, "invalid_test_checkout");
  await stmt(env, "UPDATE polaris_billing_purchase_intents SET session_id=? WHERE id=?", session.id, id).run();
  return { checkoutUrl: session.url, purchaseId: id, claimToken: claim, amount };
}
__name(createCheckout, "createCheckout");
function licenseEmail(env, key) {
  const support = env.SUPPORT_EMAIL || env.EMAIL_FROM_ADDRESS;
  const text2 = `Polaris Pro: lifetime access

Your license key:
${key}

To activate, open Polaris, go to Settings, choose Redeem license and paste the key. Use the same key on any of your devices.

Support: ${support}`;
  const html = `<p>Polaris Pro: lifetime access</p><p>Your license key:</p><p style="font-family:ui-monospace,Menlo,monospace;font-size:15px;padding:12px 14px;background:#f4f3f0;border-radius:8px">${key}</p><p>To activate, open Polaris, go to <strong>Settings</strong>, choose <strong>Redeem license</strong> and paste the key. Use the same key on any of your devices.</p><p>Support: ${support}</p>`;
  return { subject: "Your Polaris Pro license", text: text2, html };
}
__name(licenseEmail, "licenseEmail");
var bearer = /* @__PURE__ */ __name((req) => (req.headers.get("authorization") || "").replace(/^Bearer /, ""), "bearer");
async function readText(req, limit) {
  if (Number(req.headers.get("Content-Length")) > limit) throw new ApiError(413, "request_too_large");
  if (!req.body) return "";
  const reader = req.body.getReader(), decoder = new TextDecoder();
  let bytes = 0, raw = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > limit) {
        await reader.cancel();
        throw new ApiError(413, "request_too_large");
      }
      raw += decoder.decode(value, { stream: true });
    }
    return raw + decoder.decode();
  } finally {
    reader.releaseLock();
  }
}
__name(readText, "readText");
async function body(req) {
  const raw = await readText(req, 16384);
  try {
    return JSON.parse(raw);
  } catch {
    throw new ApiError(400, "invalid_json");
  }
}
__name(body, "body");
async function installation(env, id, token) {
  const idHash = await installationHash(env, id), row = await one(env, "SELECT * FROM polaris_billing_installations WHERE id_hash=?", idHash);
  if (!row || !equal(row.secret_hash, await hash(env.LICENSE_HASH_SECRET, `installation-secret:${text(token)}`))) throw new ApiError(401, "invalid_installation");
  return row;
}
__name(installation, "installation");
function entitlement(status = "active") {
  return { plan: PLAN, status, expiresAt: null };
}
__name(entitlement, "entitlement");
async function rateLimit(env, req, path) {
  const bucket = await hash(env.LICENSE_HASH_SECRET, `rate:${req.headers.get("CF-Connecting-IP") || "local"}:${path}:${Math.floor(Date.now() / 6e4)}`);
  const row = await stmt(env, "INSERT INTO polaris_billing_rate_limits(bucket,count,expires_at) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1 RETURNING count", bucket, Date.now() + 12e4).first();
  if (row.count > 30) throw new ApiError(429, "rate_limited");
}
__name(rateLimit, "rateLimit");
async function issueActivation(env, license, install) {
  const now = Date.now();
  await stmt(env, "INSERT INTO polaris_billing_activations(id,license_id,installation_hash,created_at) VALUES(?,?,?,?) ON CONFLICT(license_id,installation_hash) DO NOTHING", crypto.randomUUID(), license.id, install.id_hash, now).run();
  const activation = await one(env, "SELECT * FROM polaris_billing_activations WHERE license_id=? AND installation_hash=?", license.id, install.id_hash);
  const token = await hash(env.LICENSE_HASH_SECRET, `activation:${activation.id}:${activation.generation}`);
  await stmt(env, "UPDATE polaris_billing_activations SET credential_hash=?,status='active',last_validated_at=? WHERE id=? AND generation=?", await hash(env.LICENSE_HASH_SECRET, `credential:${token}`), now, activation.id, activation.generation).run();
  return json({ activationToken: token, entitlement: entitlement(), validatedAt: now, offlineUntil: now + DAY });
}
__name(issueActivation, "issueActivation");
async function purchaseOwner(env, req, id, claimToken, installationId) {
  const purchase = await one(env, "SELECT * FROM polaris_billing_purchase_intents WHERE id=?", id);
  if (!purchase || purchase.claim_expires_at < Date.now() || !equal(purchase.claim_hash, await hash(env.LICENSE_HASH_SECRET, `claim:${text(claimToken)}`))) throw new ApiError(401, "invalid_claim");
  const install = await installation(env, installationId, req.headers.get("X-Installation-Token"));
  if (install.id_hash !== purchase.installation_hash) throw new ApiError(401, "invalid_claim");
  return { purchase, install };
}
__name(purchaseOwner, "purchaseOwner");
async function webhook(env, req) {
  if (!env.STRIPE_WEBHOOK_SECRET) throw new ApiError(503, "webhook_not_configured");
  const raw = await readText(req, 262144);
  if (!await verifyWebhook(raw, req.headers.get("Stripe-Signature"), env.STRIPE_WEBHOOK_SECRET)) throw new ApiError(400, "invalid_signature");
  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    throw new ApiError(400, "invalid_json");
  }
  if (event.livemode !== false) throw new ApiError(400, "live_mode_rejected");
  if (await one(env, "SELECT id FROM polaris_billing_stripe_events WHERE id=?", event.id)) return json({ received: true });
  const relevant = ["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired", "charge.refunded", "charge.dispute.created", "payment_intent.payment_failed"];
  if (!relevant.includes(event.type)) return json({ received: true });
  const object = event.data?.object;
  let purchase;
  if (event.type.startsWith("checkout.session.")) purchase = await one(env, "SELECT * FROM polaris_billing_purchase_intents WHERE session_id=?", object.id);
  else purchase = await one(env, "SELECT * FROM polaris_billing_purchase_intents WHERE payment_intent_id=?", event.type.startsWith("payment_intent.") ? object.id : object.payment_intent);
  if (!purchase && event.type.startsWith("checkout.session.") && object.metadata?.purchaseId) throw new ApiError(503, "purchase_not_ready");
  if (!purchase) return json({ received: true });
  const session = await stripe(env, `checkout/sessions/${encodeURIComponent(purchase.session_id)}`);
  if (session.metadata?.purchaseId !== purchase.id || session.mode !== "payment") throw new ApiError(400, "purchase_mismatch");
  let status = "pending", intent;
  if (session.payment_intent) {
    intent = await stripe(env, `payment_intents/${encodeURIComponent(session.payment_intent)}?expand[]=latest_charge`);
  }
  const refunded = intent?.latest_charge?.refunded || intent?.latest_charge?.disputed || Number(intent?.latest_charge?.amount_refunded) > 0;
  if (refunded) status = "revoked";
  else if (session.payment_status === "paid" && intent?.status === "succeeded") status = "paid";
  else if (session.status === "expired") status = "canceled";
  else if (event.type === "checkout.session.async_payment_failed" || event.type === "payment_intent.payment_failed") status = "failed";
  const actions = [stmt(env, "UPDATE polaris_billing_purchase_intents SET status=CASE WHEN status='revoked' THEN 'revoked' ELSE ? END,payment_intent_id=? WHERE id=?", status, session.payment_intent || null, purchase.id)];
  if (status === "paid") {
    if (session.amount_total !== purchase.amount || session.currency !== "usd") throw new ApiError(400, "amount_mismatch");
    const existing = await one(env, "SELECT id FROM polaris_billing_licenses WHERE purchase_id=?", purchase.id);
    if (!existing) {
      const email = text(session.customer_details?.email, 320).toLowerCase(), key = `POL-${randomToken()}`, id = crypto.randomUUID();
      actions.push(stmt(env, "INSERT INTO polaris_billing_licenses(id,purchase_id,key_hash,delivery_cipher,email_hash,created_at) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM polaris_billing_purchase_intents WHERE id=? AND status='paid') ON CONFLICT(purchase_id) DO NOTHING", id, purchase.id, await hash(env.LICENSE_HASH_SECRET, `license:${key}`), await seal(env.LICENSE_DELIVERY_ENCRYPTION_KEY, { email, key }), await hash(env.LICENSE_HASH_SECRET, `email:${email}`), Date.now(), purchase.id));
      actions.push(stmt(env, "INSERT INTO polaris_billing_email_deliveries(id,license_id,next_attempt_at,created_at) SELECT ?,id,?,? FROM polaris_billing_licenses WHERE id=?", crypto.randomUUID(), Date.now(), Date.now(), id));
    }
  } else if (status === "revoked") actions.push(stmt(env, "UPDATE polaris_billing_licenses SET status='revoked' WHERE purchase_id=?", purchase.id));
  actions.push(stmt(env, "INSERT INTO polaris_billing_stripe_events(id,type,processed_at) VALUES(?,?,?) ON CONFLICT(id) DO NOTHING", event.id, event.type, Date.now()));
  await env.DB.batch(actions);
  return json({ received: true });
}
__name(webhook, "webhook");
async function route(req, env) {
  const url = new URL(req.url), path = url.pathname;
  if (path === "/health" && req.method === "GET") return json({ ok: true, env: "test", version: "0.1.3" });
  const routes = /* @__PURE__ */ new Set(["/api/trial/start", "/api/plans", "/api/checkout/session", "/api/checkout/web-session", "/api/web-purchases/claim", "/api/stripe/webhook", "/api/licenses/claim", "/api/licenses/redeem", "/api/licenses/validate", "/api/licenses/recover", "/api/licenses/deactivate"]);
  if (!routes.has(path) && !/^\/api\/purchases\/[^/]+\/status$/.test(path)) throw new ApiError(404, "not_found");
  configured(env);
  if (path === "/api/stripe/webhook" && req.method === "POST") return webhook(env, req);
  await rateLimit(env, req, path.replace(/^\/api\/purchases\/[^/]+\/status$/, "/api/purchases/:id/status"));
  if (path === "/api/trial/start" && req.method === "POST") {
    const data = await body(req), idHash = await installationHash(env, data.installationId), secret = text(data.installationToken);
    if (secret.length < 32) throw new ApiError(400, "invalid_installation_token");
    await stmt(env, "INSERT INTO polaris_billing_installations(id_hash,secret_hash,trial_ends_at,created_at) VALUES(?,?,?,?) ON CONFLICT(id_hash) DO NOTHING", idHash, await hash(env.LICENSE_HASH_SECRET, `installation-secret:${secret}`), Date.now() + 7 * DAY, Date.now()).run();
    const row = await installation(env, data.installationId, secret);
    return json({ trialEndsAt: row.trial_ends_at, offerEndsAt: row.trial_ends_at, serverTime: Date.now() });
  }
  if (path === "/api/plans" && req.method === "GET") {
    const row = await installation(env, url.searchParams.get("installationId"), req.headers.get("X-Installation-Token"));
    return json({ serverTime: Date.now(), trialEndsAt: row.trial_ends_at, offerEndsAt: row.trial_ends_at, plans: [{ id: PLAN, currency: "usd", amount: row.trial_ends_at > Date.now() ? 1290 : 1999, originalAmount: 1999, billing: "one_time", maxActivations: null }] });
  }
  if (path === "/api/checkout/session" && req.method === "POST") {
    const data = await body(req);
    if (data.planId !== PLAN) throw new ApiError(400, "invalid_plan");
    const row = await installation(env, data.installationId, req.headers.get("X-Installation-Token"));
    const promo = row.trial_ends_at > Date.now(), priceId = promo ? env.STRIPE_PRICE_PRO_PROMO : env.STRIPE_PRICE_PRO_DEFAULT;
    const amount = promo ? 1290 : 1999;
    if (data.expectedAmount !== void 0 && data.expectedAmount !== amount) throw new ApiError(409, "price_changed");
    const publicUrl = new URL(env.PUBLIC_APP_URL);
    if (publicUrl.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(publicUrl.hostname)) throw new ApiError(503, "invalid_return_origin");
    const { checkoutUrl, purchaseId, claimToken } = await createCheckout(env, { amount, priceId, installationHash: row.id_hash, returnBase: publicUrl, channel: "extension" });
    return json({ checkoutUrl, purchaseId, claimToken });
  }
  if (path === "/api/checkout/web-session" && req.method === "POST") {
    const returnBase = webReturnOrigin(req), data = await body(req);
    if (data.planId !== PLAN) throw new ApiError(400, "invalid_plan");
    if (data.expectedAmount !== void 0 && data.expectedAmount !== WEB_AMOUNT) throw new ApiError(409, "price_changed");
    return json(await createCheckout(env, { amount: WEB_AMOUNT, priceId: env.STRIPE_PRICE_PRO_PROMO, installationHash: null, returnBase, channel: "web" }));
  }
  if (path === "/api/web-purchases/claim" && req.method === "POST") {
    const data = await body(req), purchase = await one(env, "SELECT * FROM polaris_billing_purchase_intents WHERE id=?", text(data.purchaseId));
    if (!purchase || purchase.claim_expires_at < Date.now() || purchase.installation_hash !== await webPurchaseHash(env, purchase.id) || !equal(purchase.claim_hash, await hash(env.LICENSE_HASH_SECRET, `claim:${text(data.claimToken)}`))) throw new ApiError(401, "invalid_claim");
    const license = await one(env, "SELECT * FROM polaris_billing_licenses WHERE purchase_id=?", purchase.id);
    if (purchase.status === "paid" && license?.status === "active") {
      const { key } = await unseal(env.LICENSE_DELIVERY_ENCRYPTION_KEY, license.delivery_cipher);
      return json({ status: "paid", licenseKey: key });
    }
    return json({ status: purchase.status === "revoked" ? "failed" : purchase.status });
  }
  const match = path.match(/^\/api\/purchases\/([^/]+)\/status$/);
  if (match && req.method === "GET") {
    const { purchase } = await purchaseOwner(env, req, match[1], bearer(req), req.headers.get("X-Installation-Id"));
    const license = await one(env, "SELECT status FROM polaris_billing_licenses WHERE purchase_id=?", purchase.id);
    return json({ status: purchase.status === "revoked" ? "failed" : purchase.status, activationReady: purchase.status === "paid" && license?.status === "active" });
  }
  if (path === "/api/licenses/claim" && req.method === "POST") {
    const data = await body(req), { purchase, install } = await purchaseOwner(env, req, data.purchaseId, data.claimToken, data.installationId);
    const license = await one(env, "SELECT * FROM polaris_billing_licenses WHERE purchase_id=? AND status='active'", purchase.id);
    if (purchase.status !== "paid" || !license) throw new ApiError(409, "activation_not_ready");
    return issueActivation(env, license, install);
  }
  if (path === "/api/licenses/redeem" && req.method === "POST") {
    const data = await body(req), install = await installation(env, data.installationId, req.headers.get("X-Installation-Token"));
    const license = await one(env, "SELECT * FROM polaris_billing_licenses WHERE key_hash=? AND status='active'", await hash(env.LICENSE_HASH_SECRET, `license:${text(data.licenseKey)}`));
    if (!license) throw new ApiError(400, "invalid_license");
    return issueActivation(env, license, install);
  }
  if (["/api/licenses/validate", "/api/licenses/deactivate"].includes(path) && req.method === "POST") {
    const data = await body(req), activation = await one(env, "SELECT a.*,l.status AS license_status FROM polaris_billing_activations a JOIN polaris_billing_licenses l ON l.id=a.license_id WHERE a.credential_hash=?", await hash(env.LICENSE_HASH_SECRET, `credential:${text(data.activationToken)}`));
    if (!activation || activation.status !== "active" || activation.license_status !== "active") return json({ valid: false, entitlement: entitlement("revoked") });
    if (path.endsWith("deactivate")) {
      await stmt(env, "UPDATE polaris_billing_activations SET status='revoked',credential_hash=NULL,generation=generation+1 WHERE id=? AND credential_hash=?", activation.id, activation.credential_hash).run();
      return json({ deactivated: true });
    }
    await stmt(env, "UPDATE polaris_billing_activations SET last_validated_at=? WHERE id=?", Date.now(), activation.id).run();
    return json({ valid: true, entitlement: entitlement(), validatedAt: Date.now(), offlineUntil: Date.now() + DAY });
  }
  if (path === "/api/licenses/recover" && req.method === "POST") {
    const data = await body(req), email = text(data.email, 320).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, "invalid_email");
    const emailHash = await hash(env.LICENSE_HASH_SECRET, `email:${email}`);
    await stmt(env, "INSERT INTO polaris_billing_email_deliveries(id,license_id,next_attempt_at,created_at) SELECT lower(hex(randomblob(16))),l.id,?,? FROM polaris_billing_licenses l WHERE l.email_hash=? AND l.status='active' AND NOT EXISTS(SELECT 1 FROM polaris_billing_email_deliveries e WHERE e.license_id=l.id AND e.created_at>?)", Date.now(), Date.now(), emailHash, Date.now() - 36e5).run();
    return json({ message: "If an eligible purchase exists, recovery instructions will be sent." });
  }
  throw new ApiError(404, "not_found");
}
__name(route, "route");
var index_default = {
  async fetch(req, env) {
    const origin = req.headers.get("Origin"), allowed = (env.ALLOWED_ORIGINS || "").split(",").map((x) => x.trim());
    if (origin && !allowed.includes(origin)) return json({ error: "origin_not_allowed" }, 403);
    let response;
    try {
      response = req.method === "OPTIONS" ? new Response(null, { status: 204 }) : await route(req, env);
    } catch (error) {
      response = json({ error: error instanceof ApiError ? error.code : "service_unavailable" }, error instanceof ApiError ? error.status : 503);
    }
    if (origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Vary", "Origin");
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Installation-Token, X-Installation-Id");
    }
    return response;
  },
  async scheduled(_controller, env) {
    configured(env);
    await stmt(env, "DELETE FROM polaris_billing_rate_limits WHERE expires_at<?", Date.now()).run();
    if (!env.EMAIL_FROM_ADDRESS || !env.EMAIL && !env.EMAIL_PROVIDER_API_KEY) return;
    const jobs = await stmt(env, "SELECT e.*,l.delivery_cipher,l.status AS license_status FROM polaris_billing_email_deliveries e JOIN polaris_billing_licenses l ON l.id=e.license_id WHERE e.status='pending' AND e.next_attempt_at<=? LIMIT 20", Date.now()).all();
    for (const job of jobs.results) {
      if (job.license_status !== "active") {
        await stmt(env, "UPDATE polaris_billing_email_deliveries SET status='canceled' WHERE id=?", job.id).run();
        continue;
      }
      try {
        const payload = await unseal(env.LICENSE_DELIVERY_ENCRYPTION_KEY, job.delivery_cipher);
        const mail = licenseEmail(env, payload.key);
        if (env.EMAIL) await env.EMAIL.send({ to: payload.email, from: { email: env.EMAIL_FROM_ADDRESS, name: "Polaris" }, ...env.SUPPORT_EMAIL ? { replyTo: env.SUPPORT_EMAIL } : {}, subject: mail.subject, text: mail.text, html: mail.html });
        else {
          const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${env.EMAIL_PROVIDER_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": job.id }, body: JSON.stringify({ from: env.EMAIL_FROM_ADDRESS, to: [payload.email], subject: mail.subject, text: mail.text }) });
          if (!response.ok) throw new Error("email_unavailable");
        }
        await stmt(env, "UPDATE polaris_billing_email_deliveries SET status='sent',attempt_count=attempt_count+1 WHERE id=?", job.id).run();
      } catch {
        await stmt(env, "UPDATE polaris_billing_email_deliveries SET attempt_count=attempt_count+1,next_attempt_at=? WHERE id=?", Date.now() + Math.min(DAY, 6e4 * 2 ** Math.min(job.attempt_count, 10)), job.id).run();
      }
    }
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
