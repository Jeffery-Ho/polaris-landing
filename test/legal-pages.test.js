import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = name => readFileSync(new URL(name, root), 'utf8');
const kinds = ['privacy', 'terms', 'safety', 'refund'];

test('all legal pages are bilingual, linked from the homepage and included in deployment', () => {
  const home = read('index.html'); const release = read('deploy/release.sh'); const sitemap = read('sitemap.xml');
  for (const kind of kinds) {
    const page = read(`${kind}.html`);
    assert.match(page, /<article lang="en" data-legal-locale="en">/);
    assert.match(page, /<article lang="zh-CN" data-legal-locale="zh-CN">/);
    assert.match(page, new RegExp(`rel="canonical" href="https://polaris-ai.work/${kind}.html"`));
    assert.ok(home.includes(`href="${kind}.html"`));
    assert.ok(release.includes(`  ${kind}.html\n`));
    assert.ok(sitemap.includes(`https://polaris-ai.work/${kind}.html`));
    assert.doesNotMatch(page, /googletagmanager|aliyun-sls-web|<iframe|<form/);
    assert.deepEqual([...page.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(match => match[1]), ['assets/legal.js']);
    for (const target of kinds) assert.ok(page.includes(`href="${target}.html"`));
    assert.equal([...page.matchAll(/<article\b[^>]*hidden/g)].length, 0, 'both translations remain readable without JavaScript');
  }
});

function runLanguage({ query = '', saved = null, blocked = false, browser = 'en-US' } = {}) {
  const articles = ['en', 'zh-CN'].map(locale => ({ dataset: { legalLocale: locale }, hidden: false }));
  const buttons = ['en', 'zh-CN'].map(locale => ({ dataset: { legalLanguage: locale }, attributes: {},
    setAttribute(key, value) { this.attributes[key] = value; }, addEventListener(_name, callback) { this.click = callback; } }));
  const values = new Map(saved ? Object.entries(saved) : []);
  const document = { documentElement: { dataset: {}, lang: 'en' }, title: '',
    querySelectorAll(selector) { return selector === '[data-legal-locale]' ? articles : buttons; },
    querySelector(selector) { return { textContent: selector.includes('zh-CN') ? '隐私政策' : 'Privacy Policy' }; } };
  const context = { document, location: { search: query }, navigator: { language: browser, platform: 'MacIntel' }, URLSearchParams,
    localStorage: { getItem(key) { if (blocked) throw new Error('blocked'); return values.get(key) || null; },
      setItem(key, value) { if (blocked) throw new Error('blocked'); values.set(key, value); } },
    fetch() { throw new Error('Legal pages must not initiate network API calls'); } };
  vm.runInNewContext(read('assets/legal.js'), context);
  return { articles, buttons, values, document };
}

test('legal language follows query, saved preference and browser while preserving the homepage theme', () => {
  const s = runLanguage({ query: '?lang=zh-CN', saved: { 'polaris-landing-locale': 'en', 'polaris-landing-theme': 'dark' } });
  assert.equal(s.document.documentElement.lang, 'zh-CN');
  assert.equal(s.document.documentElement.dataset.theme, 'dark');
  assert.deepEqual(s.articles.map(article => article.hidden), [true, false]);
  s.buttons[0].click();
  assert.deepEqual(s.articles.map(article => article.hidden), [false, true]);
  assert.equal(s.values.get('polaris-landing-locale'), 'en');
  assert.equal(s.buttons[0].attributes['aria-pressed'], 'true');
  assert.equal(runLanguage({ browser: 'zh-SG' }).document.documentElement.lang, 'zh-CN');
  assert.equal(runLanguage({ query: '?lang=invalid', saved: { 'polaris-landing-locale': 'zh-CN' } }).document.documentElement.lang, 'zh-CN');
});

test('legal reading and language switching still work when browser storage is unavailable', () => {
  const s = runLanguage({ blocked: true });
  assert.equal(s.document.documentElement.lang, 'en');
  assert.doesNotThrow(() => s.buttons[1].click());
  assert.equal(s.document.documentElement.lang, 'zh-CN');
});

test('refunds describe the approved activation rule without treating activation as a statutory waiver', () => {
  const refund = read('refund.html');
  assert.match(refund, /14 calendar days/);
  assert.match(refund, /including automatic activation following checkout/);
  assert.match(refund, /duplicate or incorrect charges/);
  assert.match(refund, /does not by itself waive a statutory withdrawal right/);
  assert.match(refund, /事先明确同意与知情确认/);
  assert.match(refund, /经原支付路径发起退款/);
  assert.doesNotMatch(refund, /all sales are final|lose your statutory 14-day right/i);
});
