import { createServer } from "node:http";
import { closeSync, openSync, readFileSync, unlinkSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

const lockPath = "/tmp/polaris-billing-harness.lock";
let lockDepth = 0;
let lockFd = null;

function acquireLock() {
  if (lockDepth > 0) {
    lockDepth += 1;
    return;
  }
  const started = Date.now();
  for (;;) {
    try {
      lockFd = openSync(lockPath, "wx");
      lockDepth = 1;
      return;
    } catch {
      if (Date.now() - started > 180000) throw new Error("harness_lock_timeout");
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 25);
    }
  }
}

function releaseLock() {
  lockDepth -= 1;
  if (lockDepth > 0) return;
  if (lockFd != null) closeSync(lockFd);
  lockFd = null;
  try { unlinkSync(lockPath); } catch { /* already released */ }
}

const schema = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");

export function createDb() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(schema);
  const run = (sql, args) => db.prepare(sql).run(...args);
  const get = (sql, args) => db.prepare(sql).get(...args) ?? null;
  const all = (sql, args) => db.prepare(sql).all(...args);
  return {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            sql,
            args,
            run() { return run(sql, args); },
            first() { return get(sql, args); },
            get() { return get(sql, args); },
            all() { return { results: all(sql, args) }; }
          };
        }
      };
    },
    batch(statements) {
      db.exec("BEGIN IMMEDIATE");
      try {
        for (const statement of statements) run(statement.sql, statement.args);
        db.exec("COMMIT");
      } catch (error) {
        try { db.exec("ROLLBACK"); } catch { /* already closed */ }
        throw error;
      }
    },
    count(table) {
      return db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get().c;
    }
  };
}

export function createStripeMock() {
  const sessions = new Map();
  const intents = new Map();
  const idempotency = new Map();
  const calls = [];
  const prices = {
    price_promo_test: { id: "price_promo_test", active: true, currency: "usd", unit_amount: 1290, type: "one_time", livemode: false },
    price_default_test: { id: "price_default_test", active: true, currency: "usd", unit_amount: 1999, type: "one_time", livemode: false }
  };
  const state = { livemode: false, httpStatus: 200 };

  async function fetchImpl(url, options = {}) {
    const href = String(url);
    const method = options.method || "GET";
    if (href.startsWith("https://api.resend.com/")) {
      calls.push({ host: "resend", method });
      return new Response("email_not_used", { status: 599 });
    }
    if (!href.startsWith("https://api.stripe.com/v1/")) {
      throw new Error(`unexpected_outbound:${href.split("?")[0]}`);
    }
    const path = href.slice("https://api.stripe.com/v1/".length);
    const idempotencyKey = options.headers?.["Idempotency-Key"] || null;
    calls.push({ path: path.split("?")[0], method, idempotencyKey });
    if (state.httpStatus !== 200) return new Response("stripe_down", { status: state.httpStatus });

    if (method === "GET" && path.startsWith("prices/")) {
      const id = decodeURIComponent(path.slice("prices/".length));
      const price = prices[id];
      if (!price) return new Response("missing", { status: 404 });
      return Response.json({ ...price, livemode: state.livemode });
    }

    if (method === "POST" && path === "checkout/sessions") {
      if (idempotencyKey && idempotency.has(idempotencyKey)) return Response.json(idempotency.get(idempotencyKey));
      const params = new URLSearchParams(options.body);
      const id = `cs_test_${crypto.randomUUID().replaceAll("-", "")}`;
      const session = {
        id,
        url: `https://checkout.stripe.com/c/pay/${id}`,
        livemode: state.livemode,
        mode: params.get("mode"),
        metadata: { purchaseId: params.get("metadata[purchaseId]"), channel: params.get("metadata[channel]") },
        payment_status: "unpaid",
        status: "open",
        amount_total: null,
        currency: "usd",
        payment_intent: null,
        customer_details: null,
        success_url: params.get("success_url"),
        cancel_url: params.get("cancel_url"),
        line_price: params.get("line_items[0][price]")
      };
      sessions.set(id, session);
      if (idempotencyKey) idempotency.set(idempotencyKey, session);
      return Response.json(session);
    }

    if (method === "GET" && path.startsWith("checkout/sessions/")) {
      const id = decodeURIComponent(path.slice("checkout/sessions/".length).split("?")[0]);
      const session = sessions.get(id);
      if (!session) return new Response("missing", { status: 404 });
      return Response.json({ ...session, livemode: state.livemode });
    }

    if (method === "GET" && path.startsWith("payment_intents/")) {
      const id = decodeURIComponent(path.slice("payment_intents/".length).split("?")[0]);
      const intent = intents.get(id);
      if (!intent) return new Response("missing", { status: 404 });
      return Response.json({ ...intent, livemode: state.livemode });
    }

    return new Response("unmocked", { status: 404 });
  }

  return {
    fetch: fetchImpl,
    sessions,
    intents,
    calls,
    state,
    markPaid(sessionId, { email = "buyer@example.com", amount = 1290, currency = "usd", intentStatus = "succeeded", paymentStatus = "paid", sessionStatus = "complete", refunded = false, disputed = false, amountRefunded = 0 } = {}) {
      const session = sessions.get(sessionId);
      const intentId = session.payment_intent || `pi_test_${crypto.randomUUID().replaceAll("-", "")}`;
      session.payment_intent = intentId;
      session.payment_status = paymentStatus;
      session.status = sessionStatus;
      session.amount_total = amount;
      session.currency = currency;
      session.customer_details = { email };
      intents.set(intentId, {
        id: intentId,
        status: intentStatus,
        livemode: false,
        latest_charge: { refunded, disputed, amount_refunded: amountRefunded }
      });
      return session;
    }
  };
}

export async function signStripe(secret, payload, timestamp = Math.floor(Date.now() / 1000)) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`));
  const hex = [...new Uint8Array(mac)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `t=${timestamp},v1=${hex}`;
}

export async function startHarness(overrides = {}) {
  acquireLock();
  const db = createDb();
  const stripe = createStripeMock();
  const env = {
    DB: db,
    ENVIRONMENT: "test",
    LICENSE_HASH_SECRET: "local-harness-hash-secret-32chars-min",
    LICENSE_DELIVERY_ENCRYPTION_KEY: "local-harness-delivery-key-32chars",
    STRIPE_SECRET_KEY: "sk_test_local_harness_not_a_real_key",
    STRIPE_WEBHOOK_SECRET: "whsec_local_harness_not_a_real_secret",
    STRIPE_PRICE_PRO_PROMO: "price_promo_test",
    STRIPE_PRICE_PRO_DEFAULT: "price_default_test",
    PUBLIC_APP_URL: "https://polaris-ai.work",
    ALLOWED_ORIGINS: "https://polaris-ai.work,http://127.0.0.1:4317,http://localhost:4317",
    ...overrides
  };
  env.DB = overrides.DB || db;
  const worker = (await import("./worker-snapshot.js")).default;
  if (!globalThis.__polarisNativeFetch) globalThis.__polarisNativeFetch = globalThis.fetch.bind(globalThis);
  const previousStripe = globalThis.__polarisStripeFetch || null;
  globalThis.__polarisStripeFetch = stripe.fetch;
  if (!globalThis.__polarisFetchInstalled) {
    globalThis.fetch = (url, options) => {
      const href = String(url);
      if (href.startsWith("https://api.stripe.com/") || href.startsWith("https://api.resend.com/")) {
        return globalThis.__polarisStripeFetch(url, options);
      }
      return globalThis.__polarisNativeFetch(url, options);
    };
    globalThis.__polarisFetchInstalled = true;
  }
  const server = createServer(async (req, res) => {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = Buffer.concat(chunks);
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value == null) continue;
        headers.set(key, Array.isArray(value) ? value.join(", ") : String(value));
      }
      const request = new Request(`https://license.local${req.url}`, {
        method: req.method,
        headers,
        body: req.method === "GET" || req.method === "HEAD" ? undefined : body
      });
      const response = await worker.fetch(request, env);
      const buffer = Buffer.from(await response.arrayBuffer());
      const out = {};
      response.headers.forEach((value, key) => { out[key] = value; });
      res.writeHead(response.status, out);
      res.end(buffer);
    } catch (error) {
      res.writeHead(500, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "harness_exception", name: error.name }));
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    env,
    db,
    stripe,
    worker,
    base: `http://127.0.0.1:${server.address().port}`,
    async close() {
      if (globalThis.__polarisStripeFetch === stripe.fetch) globalThis.__polarisStripeFetch = previousStripe;
      await new Promise((resolve) => server.close(resolve));
      releaseLock();
    }
  };
}

export async function postJson(base, path, body, headers = {}) {
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://polaris-ai.work", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body)
  });
  const text = await response.text();
  let data = null;
  try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 180) }; }
  return { status: response.status, data, headers: response.headers };
}

export function paidEvent(session, type = "checkout.session.completed", eventId = `evt_${crypto.randomUUID()}`) {
  return {
    id: eventId,
    type,
    livemode: false,
    data: { object: { id: session.id, metadata: session.metadata, payment_intent: session.payment_intent } }
  };
}

export async function postWebhook(harness, event) {
  const payload = JSON.stringify(event);
  const signature = await signStripe(harness.env.STRIPE_WEBHOOK_SECRET, payload);
  return postJson(harness.base, "/api/stripe/webhook", payload, { "stripe-signature": signature, origin: "" });
}

export function percentile(sorted, ratio) {
  if (!sorted.length) return null;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(ratio * sorted.length) - 1));
  return sorted[index];
}
