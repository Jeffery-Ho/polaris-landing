import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const definition = "Polaris is a free Chrome extension that detects headings in AI chat answers and lets you jump to each section with edge markers, a Table of Contents and an Outline.";
const platforms = ["ChatGPT", "Claude", "Gemini", "Grok", "Doubao", "Kimi", "Qwen", "Yuanbao", "Diandian AI", "Manus", "DeepSeek"];
const decode = (value) => value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

test("homepage meta follows the SEO spec", async () => {
  const home = await read("index.html");
  assert.match(home, /<title>Polaris AI — Chrome Extension to Navigate Long AI Chats<\/title>/);
  assert.match(home, /<meta name="description" content="Polaris adds heading markers and one-click jumps to long answers on ChatGPT, Claude, Gemini, Grok, DeepSeek, and more\. Local processing\. Install from Chrome Web Store or ZIP\.">/);
  assert.match(home, /<link rel="canonical" href="https:\/\/polaris-ai\.work\/">/);
  for (const tag of ["og:locale", "og:image:width", "og:image:height", "og:image:alt"]) assert.match(home, new RegExp(`property="${tag}"`));
  assert.match(home, /name="twitter:image:alt" content="Polaris AI edge markers on a long AI chat answer"/);
  assert.doesNotMatch(home, /hreflang/);
});

test("homepage exposes the definition, platforms, FAQ and alt text as crawlable HTML", async () => {
  const home = await read("index.html");
  const visible = home.slice(home.indexOf("<body"));
  assert.ok(visible.includes(definition), "definition sentence in visible text");
  assert.match(home, /id="faq"/);
  const platformAnswer = visible.match(/<details class="faq-item" id="platforms">[\s\S]*?<\/details>/);
  assert.ok(platformAnswer, "#platforms FAQ entry");
  for (const platform of platforms) assert.ok(platformAnswer[0].includes(platform), platform);
  assert.doesNotMatch(home, /<img[^>]*alt=""/);
  assert.doesNotMatch(home, /gpt-voyager/);
  const h1 = home.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1];
  assert.equal(h1.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(), "Navigate long AI conversations.", "one crawlable copy of the H1");
  const heroDescription = home.match(/<p class="sr-only" id="hero-description"[^>]*>([^<]*)<\/p>/);
  assert.ok(heroDescription, "hero description for the platform marks");
  assert.ok(heroDescription[1].startsWith(definition), "hero description opens with the definition");
  for (const platform of platforms) assert.ok(heroDescription[1].includes(platform), `hero description: ${platform}`);
  assert.match(home, /<h1 id="hero-title"[^>]*aria-describedby="hero-description"/);
});

test("JSON-LD describes the app, FAQ and both install paths, matching visible text", async () => {
  const home = await read("index.html");
  const graph = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"];
  const byType = (type) => graph.find((node) => [].concat(node["@type"]).includes(type));
  const app = byType("SoftwareApplication");
  assert.equal(app.name, "Polaris AI");
  assert.equal(app.alternateName, "Polaris: AI Chat Navigator");
  assert.equal(app.description, definition);
  for (const field of ["url", "applicationCategory", "operatingSystem", "browserRequirements", "softwareVersion", "featureList", "screenshot", "offers"]) assert.ok(app[field], field);
  assert.equal(app.isAccessibleForFree, true);
  assert.ok(app.offers.some((offer) => offer.price === "0"));
  assert.equal(byType("Organization").contactPoint.email, "support@polaris-ai.work");
  for (const node of graph) for (const link of node.sameAs || []) assert.doesNotMatch(link, /Polaris-for-Web/);
  assert.doesNotMatch(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1], /Polaris-for-Web/, "structured data links the current repository");
  assert.ok(!graph.some((node) => node.aggregateRating), "no unearned aggregateRating");
  const faq = byType("FAQPage");
  assert.ok(faq.mainEntity.length >= 6 && faq.mainEntity.length <= 10);
  for (const question of faq.mainEntity) {
    assert.ok(home.includes(`>${question.name}</summary>`), question.name);
    assert.ok(decode(home).includes(`>${question.acceptedAnswer.text}</p>`), `answer: ${question.name}`);
  }
  assert.equal(graph.filter((node) => node["@type"] === "HowTo").length, 2);
});

test("sitemap lists every public page with lastmod and never the /v2/ preview", async () => {
  const sitemap = await read("sitemap.xml");
  const urls = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);
  assert.ok(urls.length >= 8);
  for (const url of urls) assert.match(url, /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/, url);
  assert.doesNotMatch(sitemap, /\/v2\//);
  const home = await read("index.html");
  assert.match(home, /<figure class="hero-browser" data-nosnippet>/, "demo figures stay out of snippets");
});
