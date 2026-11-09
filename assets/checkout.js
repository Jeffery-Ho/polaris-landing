// Production checkout is not available to an anonymous website visitor.
// POST /api/checkout/session requires an existing installationId and
// X-Installation-Token. The server prices at 1290 only while that
// installation's trial_ends_at is still open, otherwise 1999. Calling
// /api/trial/start would create an installation and open the discount.
// This module does not send either request.

export function startCheckout() {
  throw new Error("website_checkout_unavailable");
}
