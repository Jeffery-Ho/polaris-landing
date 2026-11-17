#!/usr/bin/env node
// Generate the indexable Simplified Chinese homepage (zh/index.html) from index.html.
// The homepage keeps both languages in its inline `translations` dictionary; this script
// renders the zh-CN strings into static HTML so Chinese search engines get a real page with
// its own title, description, canonical and hreflang. Run after every homepage edit:
//
//   node scripts/build-zh.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ORIGIN = "https://polaris-ai.work";
const ZH_URL = `${ORIGIN}/zh/`;

export function readTranslations(html) {
  const start = html.indexOf("const translations = Object.freeze({");
  const zhStart = html.indexOf('"zh-CN": Object.freeze({', start);
  const end = html.indexOf("\n      });", zhStart);
  if (start < 0 || zhStart < 0 || end < 0) throw new Error("translations dictionary not found in index.html");
  const literal = html.slice(start + "const translations = ".length, end + "\n      })".length);
  return new Function(`return ${literal};`)();
}

function readHeroLines(html) {
  const match = html.match(/"zh-CN": \[("[^"]*"), ("[^"]*")\]\s*\n\s*\}\);/);
  if (!match) throw new Error("heroVisualLines zh-CN entry not found");
  return [JSON.parse(match[1]), JSON.parse(match[2])];
}

// Replace the inner HTML of the element whose opening tag ends at `openEnd`, honoring nesting.
function innerRange(html, tag, openEnd) {
  const pattern = new RegExp(`<(/?)${tag}(?=[\\s>/])[^>]*>`, "g");
  pattern.lastIndex = openEnd;
  let depth = 1;
  for (let match; (match = pattern.exec(html));) {
    depth += match[1] ? -1 : 1;
    if (depth === 0) return [openEnd, match.index];
  }
  throw new Error(`unclosed <${tag}>`);
}

function replaceTranslatable(html, dictionary) {
  const opening = /<([a-z][a-z0-9]*)\b[^>]*\sdata-i18n="([^"]+)"[^>]*>/g;
  let output = "";
  let cursor = 0;
  const missing = new Set();
  for (let match; (match = opening.exec(html));) {
    const [tag, key] = [match[1], match[2]];
    const openEnd = match.index + match[0].length;
    if (openEnd <= cursor) continue;
    const value = dictionary[key];
    if (value === undefined) { missing.add(key); continue; }
    const [from, to] = innerRange(html, tag, openEnd);
    output += html.slice(cursor, from) + value;
    cursor = to;
    opening.lastIndex = to;
  }
  return { html: output + html.slice(cursor), missing };
}

const text = (value) => value.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const attr = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

function setMeta(html, selector, value) {
  const pattern = new RegExp(`(<meta ${selector} content=")[^"]*(">)`);
  if (!pattern.test(html)) throw new Error(`meta ${selector} not found`);
  return html.replace(pattern, `$1${attr(value)}$2`);
}

// /zh/index.html sits one level down, so every site-relative URL becomes root-absolute.
function absolutizeUrls(html) {
  return html
    .replace(/(["'`(])(?:\.\/)?((?:icons|assets|fonts|vendor|blog|contact|release-notes|support|entry|checkout-return|chatgpt-table-of-contents|claude-conversation-navigator)\/|(?:privacy|terms|safety|refund)\.html|support-config\.js)/g, "$1/$2")
    .replace(/href="\.\/"/g, 'href="/"');
}

export function buildZh(html) {
  const translations = readTranslations(html);
  const zh = translations["zh-CN"];
  const { html: translated, missing } = replaceTranslatable(html, zh);
  if (missing.size) throw new Error(`missing zh-CN strings: ${[...missing].join(", ")}`);
  let page = translated;

  const lines = readHeroLines(html);
  let lineIndex = 0;
  page = page.replace(/(<span class="headline-line" data-hero-line>)([\s\S]*?<\/span>[^<]*)(<\/span>)/g, (_, open, __, close) => `${open}${lines[lineIndex++]}${close}`);
  if (lineIndex !== 2) throw new Error("expected two hero lines");
  page = page.replace(/(<h1 id="hero-title" aria-label=")[^"]*"/, `$1${attr(zh["hero.titleAria"])}"`);

  page = page
    .replace('<html lang="en" data-page-locale="en">', '<html lang="zh-CN" data-page-locale="zh-CN">')
    .replace("<!doctype html>", "<!doctype html>\n<!-- Generated from index.html by scripts/build-zh.mjs. Do not edit by hand. -->")
    .replace(/<title>[^<]*<\/title>/, `<title>${zh["meta.title"]}</title>`)
    .replace('<link rel="canonical" href="https://polaris-ai.work/">', `<link rel="canonical" href="${ZH_URL}">`)
    .replace('<meta property="og:url" content="https://polaris-ai.work/">', `<meta property="og:url" content="${ZH_URL}">`)
    .replace('<meta property="og:locale" content="en_US">', '<meta property="og:locale" content="zh_CN">\n    <meta property="og:locale:alternate" content="en_US">')
    .replace('<span data-language-current>English</span>', "<span data-language-current>简体中文</span>")
    .replace('data-language-option="en" type="button" role="option" aria-selected="true"', 'data-language-option="en" type="button" role="option" aria-selected="false"')
    .replace('data-language-option="zh-CN" type="button" role="option" aria-selected="false"', 'data-language-option="zh-CN" type="button" role="option" aria-selected="true"');
  for (const selector of ['name="description"', 'property="og:description"', 'name="twitter:description"']) page = setMeta(page, selector, zh["meta.description"]);
  for (const selector of ['property="og:title"', 'name="twitter:title"']) page = setMeta(page, selector, zh["meta.title"]);

  // Structured data in Chinese: the FAQ mirrors the visible answers; the English HowTo steps are dropped.
  page = page.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/, (_, open, json, close) => {
    const data = JSON.parse(json);
    const faqs = [...page.matchAll(/<details class="faq-item"[^>]*><summary[^>]*>([\s\S]*?)<\/summary><p[^>]*>([\s\S]*?)<\/p><\/details>/g)];
    data["@graph"] = data["@graph"].filter((entry) => entry["@type"] !== "HowTo").map((entry) => {
      if (entry["@type"] === "WebSite") return { ...entry, inLanguage: ["en", "zh-CN"] };
      if (entry["@type"] === "SoftwareApplication") return { ...entry, description: text(zh["faq.what.a"]).split("。")[0] + "。", inLanguage: "zh-CN" };
      if (entry["@type"] === "FAQPage") {
        return {
          "@type": "FAQPage",
          "@id": `${ZH_URL}#faq`,
          inLanguage: "zh-CN",
          mainEntity: faqs.map(([, question, answer]) => ({ "@type": "Question", name: text(question), acceptedAnswer: { "@type": "Answer", text: text(answer) } }))
        };
      }
      return entry;
    });
    return `${open}\n${JSON.stringify(data, null, 2)}\n    ${close}`;
  });

  return absolutizeUrls(page);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const site = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const output = join(site, "zh", "index.html");
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, buildZh(readFileSync(join(site, "index.html"), "utf8")));
  console.log("zh homepage → zh/index.html");
}
