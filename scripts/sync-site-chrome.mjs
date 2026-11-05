#!/usr/bin/env node
// Apply the shared header and footer (scripts/site-chrome.mjs) to every page except the
// homepage and the generated release notes page (scripts/sync-release-notes.mjs does that one).
//
//   node scripts/sync-site-chrome.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { applyChrome } from "./site-chrome.mjs";

const site = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pages = {
  "privacy.html": "",
  "terms.html": "",
  "refund.html": "",
  "safety.html": "",
  "support/index.html": "../",
  "checkout-return/index.html": "../",
  "contact/index.html": "../",
  "blog/index.html": "../",
  "blog/why-i-built-polaris/index.html": "../../"
};

for (const [page, prefix] of Object.entries(pages)) {
  const path = join(site, page);
  writeFileSync(path, applyChrome(readFileSync(path, "utf8"), prefix));
  console.log(`site chrome → ${page}`);
}
