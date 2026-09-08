# Polaris Landing

Static GitHub Pages source for the Polaris AI website. The current homepage retains the existing introduction and support experience while its metadata establishes Polaris AI Navigator as the Chrome extension brand.

Published at [jeffery-ho.github.io/polaris-landing](https://jeffery-ho.github.io/polaris-landing/).

## Assets

- `assets/polaris-introduction.mp4` is a 1440×916, 30fps H.264 muted autoplay video with a fast-start MP4 index.
- `assets/polaris-introduction-thumbnail.jpg` remains visible until the browser has buffered a playable video segment.
- `assets/Polaris-for-Web-0.48.3-build-196.zip` is the current unpacked-extension bundle for local installation; its archive root contains the generated extension files and `manifest.json` reports `0.48.3(196)`.
- `fonts/roboto-flex-latin.woff2` is the self-hosted Windows typeface; `fonts/OFL.txt` contains its license.
- `vendor/liquid-glass-0.1.0.js` is the self-hosted ESM build from `xcyberpunkx0/liquid-glass` commit `b131349`; its MIT license is in `vendor/liquid-glass-MIT.txt`.
- `support-config.js` contains the video URL, PayPal URL, GA4 Measurement ID, and deployed SLS endpoint configuration.

## SEO

- The homepage canonical URL is `https://jeffery-ho.github.io/polaris-landing/` and its page title is `Polaris AI — AI Chat Navigator for Long Answers`.
- `robots.txt` permits crawling, while `sitemap.xml` lists the homepage and privacy page for submission in Google Search Console.
- The homepage emits Organization and SoftwareApplication/WebApplication JSON-LD. The reserved `/support/` path is intentionally excluded from indexing until its content is ready.
- [SEARCH_CONSOLE.md](SEARCH_CONSOLE.md) records the remaining account-only indexing steps and the 7/28/90-day brand-query baseline.

## Analytics and privacy

- The page does not initialize or send analytics through Google Analytics or SLS until a visitor explicitly chooses “Allow analytics”.
- Once enabled, GA4 receives only the support-entry arrival from Polaris and a click on the video recovery play button; automatic page views are disabled. SLS records UTM-tagged landing-page arrivals and local ZIP download clicks. Neither service receives AI conversation content, extension settings, or PayPal payment details.
- Visitors can change this choice from “Analytics settings” in the footer. The full disclosure is available at [privacy.html](privacy.html).
- SLS event definitions, query examples, and the Aliyun deployment checklist are documented in [Doc/sls-analytics.md](Doc/sls-analytics.md).

## Design

The homepage follows a restrained black-and-white visual system inspired by Vercel's dark minimal information hierarchy. Its content sequence is product value, introduction video, verified capabilities, installation choices, and support. Detailed rules are recorded in [design-guideline.md](design-guideline.md).

- macOS uses the browser's native system font stack.
- Windows uses the self-hosted open-source Roboto Flex variable font as the Polaris Sans visual substitute; no Google Sans or Google Fonts request is used.
- The transparent header keeps Install as the primary action. The failure-recovery video play control is minimal, while the PayPal support link uses a high-contrast orange CTA.

## Installation and localization

- The homepage header links to an installation section with local ZIP installation and Chrome Web Store installation options.
- The local option explains the shortest path: download and unzip the package, then load the folder from `chrome://extensions` with Developer mode enabled.
- The homepage supports English and Simplified Chinese. The first visit follows the browser language, and a manual choice is saved locally in the browser.
