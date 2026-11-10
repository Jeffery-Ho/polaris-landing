// Public website contract from the production license Worker:
// GET /api/catalog returns the trial welcome price, USD 12.90, with originalAmount 19.99.
// POST /api/checkout/web-session accepts { planId: "pro", expectedAmount: 1290 }.
// The extension still charges USD 19.99 after that installation's first 7 days.
export const PRODUCTION_BILLING_ORIGIN = "https://polaris-license-production.hexianji.workers.dev";
export const PROMO_PRICE_CENTS = 1290;
export const REGULAR_PRICE_CENTS = 1999;

const storageKey = "polaris-web-checkout";
const claimLifetime = 24 * 60 * 60 * 1000;

function assertProduction(apiBase) {
  let url;
  try {
    url = new URL(apiBase);
  } catch {
    throw new Error("billing_unavailable");
  }
  if (url.origin !== PRODUCTION_BILLING_ORIGIN || url.username || url.password) throw new Error("billing_unavailable");
}

async function request(fetchImpl, apiBase, path, body) {
  const response = await fetchImpl(new URL(path, apiBase), {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "omit",
    cache: "no-store"
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "billing_unavailable");
    error.status = response.status;
    throw error;
  }
  return data;
}

function readClaims() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(value) ? value.filter((entry) => entry && Date.now() - entry.createdAt < claimLifetime) : [];
  } catch {
    return [];
  }
}

function writeClaims(claims) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(claims.slice(-5)));
    return true;
  } catch {
    return false;
  }
}

export function findClaim(purchaseId) {
  return readClaims().find((entry) => entry.purchaseId === purchaseId) || null;
}

export async function createWebCheckout(apiBase, fetchImpl = globalThis.fetch) {
  assertProduction(apiBase);
  const catalog = await request(fetchImpl, apiBase, "/api/catalog");
  const plan = catalog.plans?.find((item) => item.id === "pro" && item.currency === "usd");
  if (!plan || plan.amount !== PROMO_PRICE_CENTS || plan.originalAmount !== REGULAR_PRICE_CENTS) throw new Error("price_changed");
  const session = await request(fetchImpl, apiBase, "/api/checkout/web-session", {
    planId: "pro",
    expectedAmount: PROMO_PRICE_CENTS
  });
  if (session.amount !== PROMO_PRICE_CENTS || session.currency !== "usd" || session.originalAmount !== REGULAR_PRICE_CENTS) {
    throw new Error("price_changed");
  }
  const checkoutUrl = new URL(session.checkoutUrl);
  if (checkoutUrl.origin !== "https://checkout.stripe.com" || !checkoutUrl.pathname.includes("cs_live_")) throw new Error("invalid_checkout");
  if (!session.purchaseId || !session.claimToken) throw new Error("invalid_checkout");
  return session;
}

export async function startCheckout(apiBase, fetchImpl = globalThis.fetch) {
  const session = await createWebCheckout(apiBase, fetchImpl);
  if (!writeClaims([...readClaims(), { purchaseId: session.purchaseId, claimToken: session.claimToken, createdAt: Date.now() }])) {
    throw new Error("storage_unavailable");
  }
  globalThis.location.assign(session.checkoutUrl);
  return session.checkoutUrl;
}

export function claimLicense(apiBase, claim, fetchImpl = globalThis.fetch) {
  assertProduction(apiBase);
  return request(fetchImpl, apiBase, "/api/web-purchases/claim", {
    purchaseId: claim.purchaseId,
    claimToken: claim.claimToken
  });
}
