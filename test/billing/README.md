# Billing test harness

Local checks for the Polaris v2 checkout page and the deployed test Worker. They do not call Stripe, do not send email, and do not deploy.

`worker-snapshot.js` is the deployed `polaris-license-test` bundle read on 2026-11-06 (health version 0.1.3, 26307 bytes). The Git path named in the v2 README, `Polaris-for-Web/workers/license-test`, is not in the accessible extension repository.

```bash
node --test --test-concurrency=1 test/billing-functional.test.js test/billing-load.test.js test/billing-matrix.test.js
node test/billing/capture-matrix.mjs
```

Load numbers in `load-results.json` are from this Node process and an in-memory SQLite database. They are not Cloudflare capacity. Chrome screenshots that say EMULATION change the viewport and `navigator.language` only.
