// Website checkout against the Polaris license Worker.
// The claim token never leaves this browser except to the Worker; Stripe redirects only carry the purchase ID.
const storageKey = "polaris-web-checkout";
const claimLifetime = 24 * 60 * 60 * 1000;
export const WEB_PRICE_CENTS = 1290;

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

async function post(apiBase, path, body) {
  const response = await fetch(new URL(path, apiBase), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "omit",
    cache: "no-store"
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "service_unavailable");
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function startCheckout(apiBase) {
  const session = await post(apiBase, "/api/checkout/web-session", { planId: "pro", expectedAmount: WEB_PRICE_CENTS });
  const checkoutUrl = new URL(session.checkoutUrl);
  if (checkoutUrl.origin !== "https://checkout.stripe.com") throw new Error("invalid_checkout");
  // Without storage the buyer could not see the key on return, so stop before taking payment.
  if (!writeClaims([...readClaims(), { purchaseId: session.purchaseId, claimToken: session.claimToken, createdAt: Date.now() }])) {
    throw new Error("storage_unavailable");
  }
  window.location.assign(checkoutUrl.href);
}

export function claimLicense(apiBase, claim) {
  return post(apiBase, "/api/web-purchases/claim", { purchaseId: claim.purchaseId, claimToken: claim.claimToken });
}

export function recoverLicense(apiBase, email) {
  return post(apiBase, "/api/licenses/recover", { email });
}
