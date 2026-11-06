const { test } = require("node:test");
const assert = require("node:assert/strict");
const { writeFileSync } = require("node:fs");
const { join } = require("node:path");
const { cpus, totalmem, freemem } = require("node:os");

test("local mocked fulfillment ramp records latency and keeps one license per purchase", async () => {
  const { startHarness, postJson, postWebhook, paidEvent, percentile } = await import("./billing/harness.mjs");
  const harness = await startHarness();
  const startedAt = new Date().toISOString();
  const levels = [1, 5, 10, 25, 50, 100];
  const rows = [];
  try {
    const sameIp = [];
    for (let index = 0; index < 35; index += 1) {
      sameIp.push(postJson(harness.base, "/api/checkout/web-session", { planId: "pro", expectedAmount: 1290 }, { "cf-connecting-ip": "203.0.113.10" }));
    }
    const limited = await Promise.all(sameIp);
    const limitedOk = limited.filter((item) => item.status === 200).length;
    const limited429 = limited.filter((item) => item.status === 429).length;
    assert.equal(limitedOk, 30);
    assert.equal(limited429, 5);

    for (const concurrency of levels) {
      const purchases = [];
      for (let index = 0; index < concurrency; index += 1) {
        const created = await postJson(harness.base, "/api/checkout/web-session", { planId: "pro", expectedAmount: 1290 }, { "cf-connecting-ip": `198.51.100.${index % 200}` });
        assert.equal(created.status, 200);
        const session = [...harness.stripe.sessions.values()].at(-1);
        harness.stripe.markPaid(session.id, { email: `load${concurrency}-${index}@example.com` });
        purchases.push({ created, session });
      }
      const latencies = [];
      let errors = 0;
      const wallStart = performance.now();
      await Promise.all(purchases.map(async (purchase, index) => {
        const sampleStart = performance.now();
        const response = await postWebhook(harness, paidEvent(purchase.session, "checkout.session.completed", `evt_${concurrency}_${index}`));
        latencies.push(performance.now() - sampleStart);
        if (response.status !== 200) errors += 1;
      }));
      const wallMs = performance.now() - wallStart;
      latencies.sort((a, b) => a - b);
      const paidForLevel = purchases.length;
      const licenseRows = harness.db.prepare("SELECT COUNT(*) AS c FROM polaris_billing_licenses l JOIN polaris_billing_purchase_intents p ON p.id=l.purchase_id WHERE p.id IN (" + purchases.map(() => "?").join(",") + ")").bind(...purchases.map((purchase) => purchase.created.data.purchaseId)).get();
      const row = {
        concurrency,
        requests: purchases.length,
        wall_ms: Number(wallMs.toFixed(1)),
        throughput_rps: Number((purchases.length / (wallMs / 1000)).toFixed(2)),
        error_percent: Number(((errors / purchases.length) * 100).toFixed(2)),
        p50_ms: Number(percentile(latencies, 0.5).toFixed(2)),
        p95_ms: Number(percentile(latencies, 0.95).toFixed(2)),
        p99_ms: Number(percentile(latencies, 0.99).toFixed(2)),
        licenses: licenseRows.c,
        expected_licenses: paidForLevel
      };
      rows.push(row);
      assert.equal(row.licenses, row.expected_licenses);
      assert.equal(row.error_percent, 0);
      if (row.error_percent > 0) break;
    }

    const duplicateTarget = rows.at(-1);
    assert.ok(duplicateTarget);
    const stormPurchase = await postJson(harness.base, "/api/checkout/web-session", { planId: "pro", expectedAmount: 1290 }, { "cf-connecting-ip": "198.51.100.250" });
    const stormSession = [...harness.stripe.sessions.values()].at(-1);
    harness.stripe.markPaid(stormSession.id, { email: "storm@example.com" });
    const stormEvent = paidEvent(stormSession, "checkout.session.completed", "evt_same_session");
    const storm = await Promise.all(Array.from({ length: 50 }, () => postWebhook(harness, stormEvent)));
    assert.equal(storm.filter((item) => item.status === 200).length, 50);
    const stormLicenses = harness.db.prepare("SELECT COUNT(*) AS c FROM polaris_billing_licenses WHERE purchase_id=?").bind(stormPurchase.data.purchaseId).get().c;
    assert.equal(stormLicenses, 1);

    const report = {
      classification: "local_mocked_node_sqlite_not_cloudflare_capacity",
      started_at: startedAt,
      runtime: {
        node: process.version,
        cpus: cpus().length,
        cpu_model: cpus()[0]?.model,
        total_mem_bytes: totalmem(),
        free_mem_bytes_at_end: freemem(),
        percentile: "nearest-rank, ceil(p*n)-1"
      },
      same_ip_checkout: { attempted: 35, ok: limitedOk, http_429: limited429, limit: 30 },
      fulfillment_levels: rows,
      duplicate_event_storm: { concurrency: 50, http_200: 50, licenses: stormLicenses },
      email_sends: harness.stripe.calls.filter((call) => call.host === "resend").length
    };
    writeFileSync(join(__dirname, "billing/load-results.json"), JSON.stringify(report, null, 2));
    assert.equal(report.email_sends, 0);
  } finally {
    await harness.close();
  }
});
