# Polaris Landing

Static source for the Polaris AI website. The current homepage retains the existing introduction and installation experience while its metadata establishes Polaris AI Navigator as the Chrome extension brand.

Published at [polaris-ai.work](https://polaris-ai.work/), served from the Polaris ECS instance through Alibaba Cloud ESA and deployed by its repository-scoped GitHub Actions runner.

## Payments

Website and extension purchases use the Polaris license Worker in the extension repository (`Polaris-for-Web/workers/license-test`), backed by Stripe hosted Checkout. `support-config.js` sets `billingApiUrl`; it currently points at the **Stripe test-mode** Worker, so no real payment can be taken. Replace it with a live Worker before merging this branch into `main`.

- **Get Pro** on the homepage calls `POST /api/checkout/web-session` for the one-time USD 12.90 welcome price and redirects to Stripe Checkout. The Worker returns a purchase ID and a claim token; `assets/checkout.js` keeps the token in this browser's `localStorage` for 24 hours and never puts it in a URL. Without site storage, checkout does not start.
- Stripe returns to `/checkout-return/`. The page never treats the redirect as proof of payment: it polls `POST /api/web-purchases/claim` with the stored token and shows the license key only after the signed webhook has issued it. Purchases started in the extension land on the same page and are told to return to Polaris, which activates through its own authenticated claim.
- Buyers redeem the key in Polaris → Settings on any device. The page also offers key recovery by checkout email (`/api/licenses/recover`), which works once the Worker's Cloudflare Email Sending binding is configured.
- `server/` is an earlier, unused Stripe backend with a legacy USD 12 price. It is kept out of version control and is not deployed.

## Pricing

- The homepage navigation includes **Pricing**, linking to `/#pricing` between How it works and installation. The same link is available in the mobile menu and both languages.
- The section carries over the extension's approved rounded price cards, feature comparison, FAQ, and dotted terracotta closing card. Desktop shows Free on the left and Pro on the right; below 640px a Free/Pro selector switches the visible card. The homepage and policy pages share self-hosted Inter for interface text, Newsreader for headings, and Lora SemiBold Italic for Polaris wordmarks and the Pro title.
- Both plans list the same six rows so they can be compared line by line. Free: 2 platforms at a time, TOC within the loaded messages, Outline export to Markdown / HTML, conversations kept on the device, light and dark mode, adjustable settings. Pro ($12.90 once on the website): every supported platform and a TOC across the full conversation for very long chats, plus the same remaining rows. A long-conversation spotlight under the cards contrasts the two TOCs and notes that full-conversation reading currently works on ChatGPT and Gemini.
- This public section explains the offer; it does not start a trial, create an installation identity, or infer a visitor's eligibility. The 7-day banner is informational, without a fabricated personal countdown. The extension confirms the authoritative price and offer deadline before Checkout.
- **Get Pro** opens Stripe Checkout directly (see Payments). **Continue for free** leads to installation. In the extension, the price stays $12.90 for seven days after first opening Polaris, then $19.99.
- `assets/pricing.css`, the font files and their OFL licenses, and `icons/pro-entry-star.svg` are included by the existing public-assets deployment allowlist. Run `node --test test/*.test.js` for deployment and download regressions. The site is buildless static HTML/CSS/JavaScript.

## Assets

- Brand icons are synchronized from the extension's `dist/icons` output. The homepage logo, product illustration, footer, structured data and all policy-page favicons use the current Clay star icon, with content-versioned URLs to refresh browser caches.

- `assets/polaris-introduction.mp4` is a 1440×916, 30fps H.264 muted autoplay video with a fast-start MP4 index.
- `assets/polaris-introduction-thumbnail.jpg` remains visible until the browser has buffered a playable video segment.
- The local-installation button uses the stable [latest GitHub Release ZIP asset](https://github.com/Jeffery-Ho/Polaris-for-Web/releases/latest/download/Polaris-AI.zip). The extension release workflow publishes that fixed asset name alongside the versioned ZIP only after validating the archive, so landing downloads do not depend on the GitHub API. The existing `assets/Polaris-for-Web-0.48.3-build-196.zip` file remains archived for compatibility.
- `fonts/` includes the self-hosted Inter, Newsreader and Lora assets with their OFL licenses; the older Roboto Flex asset remains for compatibility.
- `icons/browsers/{chrome,edge,firefox}.svg` come from [alrra/browser-logos](https://github.com/alrra/browser-logos) (MIT, commit-era files under `src/<browser>/<browser>.svg`, fetched 2026-11-05). The logos remain trademarks of Google, Microsoft and Mozilla and are used only to label the matching store listing.
- `vendor/liquid-glass-0.1.0.js` is the self-hosted ESM build from `xcyberpunkx0/liquid-glass` commit `b131349`; its MIT license is in `vendor/liquid-glass-MIT.txt`.
- `support-config.js` contains the video URL, GA4 Measurement ID, and deployed SLS endpoint configuration.

## SEO and AEO

The homepage follows the Polaris SEO + AEO spec (audit baseline 2026-11-05).

- Brand entity: product brand **Polaris AI**, store name **Polaris: AI Chat Navigator**. Do not use "Polaris for Web" or "Polaris AI Navigator" as a main name, or `gpt-voyager` file names; icons are `icons/polaris-icon-*.png`.
- Title `Polaris AI — Chrome Extension to Navigate Long AI Chats`, the agreed meta / OG / Twitter descriptions, `og:locale`, image size and image alt. English is the indexed language; the Simplified Chinese UI has no separate URL, so there is no hreflang.
- Visible, crawlable blocks under the hero: the definition sentence (verbatim from the spec), the 11-platform list at `#platforms`, and a video transcript taken from the video's own captions. `#faq` holds the FAQ; its questions and answers match the `FAQPage` JSON-LD word for word.
- JSON-LD graph: Organization (support ContactPoint, `sameAs` to the GitHub repository `Jeffery-Ho/Polaris-AI-Chat-Navigator` and the Chrome Web Store), WebSite, SoftwareApplication (alternateName, definition, version 0.88.0, featureList, screenshot, Free and Pro offers, store `sameAs`), FAQPage and two HowTo install paths (store and ZIP). No `aggregateRating` until there are stable public ratings.
- Every `<img>` has descriptive alt text. `sitemap.xml` lists the indexable pages with `lastmod` and excludes the noindex `/support/` and `/checkout-return/`. `test/seo.test.js` guards these rules.
- Origin Nginx uses `absolute_redirect off` so `/support` redirects to `/support/` without leaking `http://` or `:8080`.
- Outside this repository: make ESA redirect HTTP apex and www to `https://polaris-ai.work/` (Always Use HTTPS), raise HSTS to at least 15552000 only after that is stable, verify Search Console and Bing and submit the sitemap, update the store listings, and rename the extension README title to Polaris AI. [SEARCH_CONSOLE.md](SEARCH_CONSOLE.md) records the account-only indexing steps and the brand-query baseline.

## Analytics and privacy

- The page does not initialize or send analytics through Google Analytics or SLS until a visitor explicitly chooses “Allow analytics”.
- Once enabled, GA4 receives only the support-entry arrival from Polaris and a click on the video recovery play button; automatic page views are disabled. SLS records landing-page arrivals and local ZIP download actions, including UTM attribution when available, a same-origin extension-entry fallback, and `direct_share` attribution for homepage visits without source parameters. This direct category also includes bookmarks, manually entered URLs, and links whose parameters were removed. Events include normalized device, browser, operating-system, viewport, and language categories. A download action means the visitor triggered the browser download control; it does not confirm that the file was saved. Neither service receives raw User-Agent values, device models, IP addresses, full URLs, AI conversation content, extension settings, or PayPal payment details as event fields.
- Bilingual [Privacy Policy](privacy.html), [Terms of Use](terms.html), [Security](safety.html) and [Refund Policy](refund.html) describe extension and website data handling, third-party service boundaries, permissions and purchase support. The voluntary refund policy permits requests within 14 days for unactivated licenses, with specified exceptions after activation and mandatory consumer rights preserved. Legal pages initialize no analytics and reuse only homepage language/theme preferences.
- OpenAI disclosures distinguish existing website-session history reading from official Responses inference and Sign in with ChatGPT plan usage. OAuth plan authorization does not grant conversation access; the inference endpoint and store/stream rules are scoped to that flow and do not authorize website extraction.
- Visitors can change this choice from “Analytics settings” in the footer. The full disclosure is available at [privacy.html](privacy.html).
- SLS event definitions, query examples, and the Aliyun deployment checklist are documented in [Doc/sls-analytics.md](Doc/sls-analytics.md).

## Design

The homepage follows the Polaris Clay visual system, with warm Paper / Ink surfaces and a single terracotta accent. Its first screen is a full-bleed hero with a short two-line headline, inline platform marks, one Free trial pill, and a large introduction video, followed by a How it works browser illustration of TOC and Outline, a Features bento, a Privacy section, Pricing, bordered installation panels, release notes and a closing CTA. The layout borrows the narrative structure of diabrowser.com while keeping Polaris Clay. Detailed rules are recorded in [design-guideline.md](design-guideline.md).

- Self-hosted Inter handles body copy and controls, Newsreader Regular handles headings, and Lora SemiBold Italic handles Polaris wordmarks. Chinese uses the corresponding system sans-serif / serif fallbacks.
- `assets/theme.css` provides the shared font faces and light/dark semantic palette for the homepage, footer and policy pages, with local OFL licenses and no Google Fonts requests.
- The header is a centered floating pill with Features, Privacy and Pricing. The hero Free trial action leads to installation until the visitor scrolls past it; then a Free trial pill appears at the bottom center and hides again near installation, the closing CTA and the footer. Language and theme controls sit outside the pill, and GitHub Issues stays in the footer. Installation cards use solid Clay borders and labels. Hero and support actions use a solid Clay surface with a contrasting label. The hero starts with the headline over a large faint Polaris wordmark, and the video follows its actions at a responsive 28–48px gap inside a product window that a Paper arc overlaps. The video frame and failure-recovery play control keep their existing behavior.

- The full-width footer groups the Polaris introduction, Product, Install & help, and Legal links. Its Product group currently shows only Features and What's new; the attribution retains its heart icon. Browser actions use “Install for Chrome / Edge / Firefox” and link to their official listings. It follows the existing language/theme preferences, preserves Analytics settings, and reflows into two link columns on small screens.

## Installation and localization

- The homepage Free trial actions — the hero, the scroll-revealed header pill, and the mobile menu — lead to an installation section with local ZIP installation and Chrome Web Store installation options. The visible label is “Free trial” in English and “免费试用” in Simplified Chinese.
- On small screens, the header collapses to the Polaris logo and an accessible menu button; opening it reveals How it works, Updates, and Free trial without changing their URLs.
- The local option explains the shortest path: download and unzip the package, then load the folder from `chrome://extensions` with Developer mode enabled.
- The homepage supports English and Simplified Chinese. The first visit follows the browser language, and a manual choice is saved locally in the browser.

## ESA + ECS deployment

Run the installation in this order:

1. Create the ESA site and point its proxied records to the ECS origin `47.104.229.186`; the public DNS records then use the ESA CNAME targets.
2. Run `deploy/bootstrap-ecs.sh` as root to install the host prerequisites and create the deployment user. If the ECS already runs an edge proxy on 80/443, use `POLARIS_EDGE_MODE=existing-proxy deploy/bootstrap-ecs.sh`; native Nginx then listens only on `172.17.0.1:8080`, and the existing proxy must handle TLS plus forwarding for `polaris-ai.work`.
3. Run `deploy/configure-npm-edge-origin.sh` with `ACME_EMAIL` set locally. It creates the NPM origin proxy, requests the origin certificate, and installs its renewal timer.
4. With a fresh repository runner registration token, approved runner version, and matching SHA-256 checksum, first run `RUNNER_DOWNLOAD_ONLY=1 deploy/install-github-runner.sh` to cache the verified archive, then run it again with the fresh token. It registers only this repository and creates the `polaris-landing` runner label used by the workflow.
5. Configure ESA HTTPS, the root-domain canonical redirect, `www` redirect, and source protection only after the origin responds correctly. Keep automatic ESA IP-list confirmation disabled: copy the current ESA origin IPv4 ranges into an ECS prefix list, allow that prefix list on ports 80/443, and only then remove the public `0.0.0.0/0` rules. When ESA reports a newer list, update the ECS prefix list before confirming the change in ESA.

The repository-scoped runner executes `.github/workflows/deploy-ecs.yml`; `deploy/release.sh` stages only public assets and atomically moves the `current` symlink to the verified release. ESA terminates public HTTPS, while Nginx Proxy Manager maintains the HTTPS origin connection to native Nginx.
