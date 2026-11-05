# Polaris Landing Design Guidelines

## Hero

- Use a full-bleed hero with the page background running behind the floating nav. Let its height follow its content instead of stretching it to the viewport.
- Start with a two-line headline at display scale, without a supporting sentence above it. Do not spend the hero on a four-line headline, and do not add a decorative wordmark that is not the Polaris name.
- For Simplified Chinese, keep the concise two-line headline with an explicit line break so no character is stranded.
- Hero copy: the two-line headline with platform marks, then one subtitle line ("A browser extension for long AI chats, on Chrome, Edge and Firefox." / "为长篇 AI 对话而做的浏览器扩展，支持 Chrome、Edge 和 Firefox") and one solid Clay Free trial pill. No eyebrow label, caption line or secondary "See how it works" link.
- Below the actions, show a large browser window with Polaris at work, after Notion's product shot: no device frame, no arc or background wordmark. The window is laid out at 1280×800 (Chrome toolbar, a ChatGPT page with its rail and composer, and the real Polaris side panel) and scaled to at most 1180px. A scripted cursor loops through streaming with the Table of Contents filling in, jumping to sections, searching, and opening the Outline. On phones it shows the right part of the window so the side panel stays legible. Apple product bezels are not used: their license covers only software that runs solely on Apple platforms.
- Match the extension conversation cover: paper `#fafaf8` in light and `#1a1918` in dark, with one top radial of the terracotta accent (`#b85c3a` / `#e69a78`) mixed at 12%. The field stays nearly the paper color. Do not fill it with a deep clay gradient or the peach, pink, and blue theme gradient.
- Show supported platforms as inline marks inside the headline, one slot per line. The marks cycle; hover pauses the cycle, and reduced motion keeps the first marks still. Keep the full platform names in an accessible list for screen readers, using the same names as `Polaris-for-Web/README.md`. Do not repeat that list as a visible strip under the nav.
- Keep the sequence as full-bleed hero, How it works, Features, Privacy, Pricing, installation panels, release notes, the closing CTA, then the footer. Platform names stay in the headline marks and in the accessible platform list.
- How it works is headed “Polaris reads between the headings” in Newsreader. From 800px up it is a top–bottom layout, not Dia's side rail: two bordered feature cards side by side (Jump to a section, See the structure), each with a Newsreader title and one short line, then one wide browser window (up to 1040×600) below. The active card gets a Clay border tint, an elevated surface and a short Clay bar on its top edge; clicking a card swaps the window between TOC and Outline in place without scrolling the page. Below 800px, each scene stacks its copy under its own window. Inside the window, margin markers sit on a long answer and a Polaris side panel switches between TOC (a jump list) and Outline (the same answer as a nested structure). Use the conversation-cover paper and terracotta for that mock in both themes.
- The How it works cards have no numeric indexes or check lists: the title stays muted until its card is active. Each window shows a ChatGPT page with real answer text and an Ask anything composer, and the real Polaris Chrome side panel as in the product screenshots: a side-panel title bar (Polaris: AI Chat Navigator, close), a header with the Polaris wordmark, the current platform icon and a settings gear, a search field, and equal Table of Contents | Outline tabs whose active tab is Clay-tinted with a Clay border; below, a dotted body with a grey user-question group and white rounded cards, the current one Clay-tinted, plus the ↑ ◎ ↓ float; Outline shows an Export button and a card of bulleted, expandable sections; settings open from the gear. Windows are visible as soon as they scroll in. While the section is on screen, a scripted cursor operates them through the demo controller; any visitor input pauses it for 12 seconds, and reduced motion disables it.
- Headline platform marks are opaque rounded tiles, white or black, with the mark inset from the tile edge. Align each headline row on the text baseline, keep the icon at 0.72em, and avoid a downward slot transform so the tile’s optical center lines up with the glyph center.

## Typography

- Follow the approved Polaris Clay design system in `Polaris-AI-Chat-Navigator/docs/show-me-design-system.html`. The website shares self-hosted fonts and semantic colors through `assets/theme.css`.
- Use Lora SemiBold Italic 600 for standalone Polaris wordmarks in navigation, the product illustration, and footer, and for the Pro plan title. Keep brand words together, with `-0.035em` tracking and no synthesized fonts.
- Use Newsreader Regular 400 for the hero, section headings and policy-page reading headings. Chinese falls back to Songti SC / Noto Serif CJK SC / SimSun; do not synthesize unbundled weights or italics.
- Use Inter for body copy, navigation, controls, feature lists, badges and metadata on every platform. Chinese falls back to PingFang SC / Microsoft YaHei and system sans-serif. Use the existing self-hosted Latin font subsets with `font-display: swap` and retain their OFL licenses.
- Preserve the current responsive sizes and two-line hero composition. Check both languages at 320px and wider after font changes.

## Header

- On desktop, use a fixed, centered floating pill over the page, about 50px tall with a 16px radius, a 1px low-contrast border, a soft shadow, and a light backdrop blur. Let the page background run behind it. Do not add a header bottom border. At 800px and below, use a full-width opaque header in the current theme's page color, covering the top safe area; remove the brand wrapper and control backgrounds while preserving control positions, touch targets, menus, and keyboard focus feedback.
- Inside the pill, show the logo mark with a minimal wordmark and quiet text links — Features, Privacy, and Pricing — at about 70% opacity, with no underlines. Do not place Free trial or GitHub Issues in that pill. Release notes stay reachable from the footer.
- At the top of the page, the hero Free trial action owns the install section. After the visitor scrolls past the hero, show one Free trial pill fixed at the bottom center, like Dia's download pill: solid Clay with a down arrow. Hide it while the installation section, the closing CTA or the footer is on screen, and on narrow screens while the analytics prompt is open. Do not add a second Free trial pill to the header.
- Keep language and theme switches outside the center pill as small controls on the right. On narrow screens they stay beside the menu button.
- On mobile, collapse the text links behind the menu button. The open panel uses at least 44px touch targets and includes Free trial so the install section stays reachable. GitHub Issues lives in the footer.
- In-page header links scroll to their targets with enough scroll padding to clear the fixed pill.

## SEO and AEO content

- All demo conversations (hero, How it works, Features) use one realistic long answer: a 14-day Europe trip for two in June, with Route overview, a Day-by-day itinerary parent holding Days 1–7 (Paris and the Swiss Alps) and Days 8–14 (Florence and Rome), and Budget and booking. Keep the copy identical across demos and in both languages. Do not use skeleton bars or grey placeholder blocks in demos: every line is real itinerary text and every icon is a real glyph.

- Name the two views **Table of Contents** (目录) and **Outline** (大纲) everywhere in site copy, metadata and JSON-LD. Do not use Chapter View, Chapters or Navigation as feature names, including in mirrored release notes (rename them when copying from the extension's release-notes.js); only demo UI may show the extension's own placeholder labels.

- Do not add a separate definition or platform-list block under the hero: the hero marks already show the platforms. Give the marks their meaning in text instead: a visually hidden `#hero-description` right after the H1 (linked with `aria-describedby`) holds the definition sentence followed by the full platform list, in both languages. The definition sentence opens the first FAQ answer, the full platform list is the second FAQ answer (anchored as `#platforms`, opened when linked), and both are in the JSON-LD.
- Put the FAQ at `#faq` after installation: native disclosures with the spec's questions plus the pricing questions. Keep the visible text identical to the FAQPage JSON-LD. Pricing no longer has its own FAQ.
- Every image needs descriptive alt text; decorative demo windows stay `aria-hidden`. The footer links How it works, Features, Supported platforms and FAQ.

## Features, privacy and closing

- Lead the Features bento with a wide "Long conversations · Pro" card spanning both columns: copy on the left (Clay label, Newsreader title "When the AI forgets, you can still find it." / "AI 忘了，你还能找回来。", one paragraph) and a demo on the right. Frame the pain honestly: the AI loses track of earlier messages and the page keeps only the latest part; Polaris reads the whole conversation so the visitor can find earlier answers and hand the context back. Never claim Polaris makes the AI remember. The demo starts at the latest exchange, scrolls the Table of Contents back to the first question, jumps to the earliest answer while earlier messages load, then exports the conversation as Markdown. Full-conversation reading works on every supported platform.
- Follow How it works with a Features bento: a Newsreader heading and six bordered cards in two columns (one column at 800px and below). Each card has a small uppercase label, one short sentence and a live demo of the real product: an AI chat page on the left and the real Polaris Chrome side panel as in the product screenshots: a side-panel title bar (Polaris: AI Chat Navigator, close), a header with the Polaris wordmark, the current platform icon and a settings gear, a search field, and equal Table of Contents | Outline tabs whose active tab is Clay-tinted with a Clay border; below, a dotted body with a grey user-question group and white rounded cards, the current one Clay-tinted, plus the ↑ ◎ ↓ float; Outline shows an Export button and a card of bulleted, expandable sections; settings open from the gear, with the extension's real labels in both languages. The window is laid out at 600×360 and scaled to the card. A scripted cursor operates it: Markers (hover, preview, jump), Outline (switch tab, expand sections, switch back), Search (type, filter, open), Streaming (markers appear as text streams), Platforms (the site cycles through every supported platform, names kept accessible) and Your markers (open settings from the gear, turn on Bold text, then jump to the new markers). Demos run only on screen and show a still frame under reduced motion.
- Privacy follows Features in the same Polaris v2 language: a small outlined lock tile, a centered two-line Newsreader heading (the second sentence in tertiary text), one lead line ending in a bold claim, then three bordered cards that match the Features cards, each with a Clay-tinted icon tile, bold title and short copy, and a centered link to the privacy policy. Do not use a full-bleed tinted band, a dashed frame or scrolling chips. Every statement must match `privacy.html`. Stack the cards at 800px.
- End the page with a centered closing block on the page background: a faded dot field sits behind the Newsreader question only (no card, photo or illustration), then one short lead line, three real store links with official logos and descriptive labels: Add to Chrome (the Marker highlight from the side panel: muted fill, strong border, ink text), Get it for Edge and Get it for Firefox (outlined), and the quiet Local installation link. Below 560px the three links stack at full width.

## Release notes

- Data comes from the extension's `src/release-notes.js` through `node scripts/sync-release-notes.mjs`, which dates each version by the commit that added it, applies the Table of Contents / Outline naming rule and writes `assets/release-notes.js` and the static `release-notes/index.html`. Do not edit either output by hand.
- The homepage shows the latest six versions as a compact list: version, date and title on one line and a one-line summary below, each row linking to that version on the full page, then a single "See all release notes" pill. No cards and no expand/collapse.
- `/release-notes/` uses the policy-page layout in both languages: a sticky row of month links, then months newest first, each entry with version, date, title and its full list of changes. It is indexable and listed in the sitemap.

## Visual system

- Use the Polaris Clay semantic palette throughout the homepage, Pricing, footer and policy pages. Light: Paper `#fafaf8`, elevated `#ffffff`, text `#2a2724`, secondary `#57534c`, border `#e0ddd7`, accent `#b85c3a`. Dark: Ink `#1a1918`, elevated `#222120`, text `#f3f1ed`, secondary `#c4c0b8`, border `#3a3835`, accent `#e69a78`.
- Keep colors in `assets/theme.css`; section-specific aliases must refer to those tokens. Do not use the old orange/pink/blue gradient for text, borders or interaction states. Preserve the official colors of third-party platform marks and the red author-attribution heart.
- Main product actions use a solid Clay surface with theme-aware foreground: white in light mode and `#271812` in dark mode. Installation actions use a solid surface, a single Clay border and readable Clay labels.
- Keep existing panel and button geometry, grid dividers, spacing, hero radial wash and floating-navigation blur. Hover uses a subtle theme-aware surface or the Clay hover tone, stable text and no vertical lift.
- Focus and selection use the shared Clay tokens. Selection foreground must follow the accent foreground in each theme; body and control text must meet 4.5:1 contrast.
- Keep language and theme controls, persistence and system-preference behavior. Theme-color metadata follows the Paper / Ink page background.

## Installation section

- Place a two-option installation section after Pricing; Header and Hero in-page CTA links smoothly scroll to their targets without an abrupt jump, unless reduced motion is requested.
- Use equal 1px bordered panels on desktop and a single-column stack on mobile.
- Keep the local-installation steps readable as a numbered list and surface `chrome://extensions` in a distinguishable code style.
- Installation options carry no regional labels or recommendations; visitors choose the store or the local ZIP themselves.
- The local ZIP action must use a same-site relative asset path and keep the installation instructions short; the Chrome Web Store action opens the verified store listing in a new tab.
- The store card covers all three official listings. A small pill switch at its top right shows Chrome, Microsoft Edge and Firefox marks; the selected browser changes the card title, copy, button label, note and link together, in both languages. The default follows the visitor's browser (Edge, then Firefox, otherwise Chrome).
- After the local ZIP action is clicked, show a short loading state with a spinner and ignore repeat clicks while the browser starts the native download; restore the normal label automatically because native downloads do not expose completion to the page.

## Pricing section

- Use the extension paywall's Clay design within `#pricing` and the same shared palette as the surrounding homepage. Use Inter for interface text, Newsreader for the headline and Free title, and Lora SemiBold Italic for Pro. Self-host all three fonts and their licenses.
- Start with a narrow 7-day trial information banner, followed by the approved headline “Get long conversation like a pro.”, a concise description, and “Choose your plan”. Do not start a website-only trial or invent a personal countdown.
- On desktop, show Free on the left and Pro on the right, with their prices and actions aligned. Below 640px use a native Free/Pro radio selector with a gray track and theme-aware raised highlight, and center the selected card at a maximum width of 520px. Default to Pro; preserve keyboard arrow selection. Slide the highlight and fade the newly selected card over 220ms, disabling both effects for reduced motion.
- Give both plans the same six feature rows in the same order (platforms, TOC, Outline export, local data, light/dark mode, settings). Mark Pro's two differences, every platform and a full-conversation TOC, in semibold ink. Under the cards, add a long-conversation spotlight: a Clay label, a Newsreader headline, one paragraph and an accurate platform note on the left, and side-by-side Free / Pro TOC columns on the right (Free shows only the last loaded replies, Pro the full list).
- Keep 24px outer radii, the inset rounded top under the Pro accent band, terracotta primary action, and secondary Free action. Explain the seven-day $12.90 welcome price and $19.99 regular price next to the amount. Put the "Save $7.09" badge directly above the struck-through $19.99, beside the price, not in the plan heading.
- Follow with a compact three-column comparison and native disclosure FAQs; place them side by side on desktop and stack on narrow screens. Keep all content within the viewport at 320px.
- Finish with the approved terracotta dotted card, star asset, pale gradient Get Pro action, and a reachable free-use link. Dots belong only inside this closing card.
- Get Pro opens Stripe Checkout from the website at the $12.90 welcome price; show a short loading label while it opens and an inline, translated error with the extension fallback if it cannot. Explain next to the price that the extension keeps its own 7-day $12.90 / $19.99 rule, and say before the click that the key appears right after payment.
- `/checkout-return/` uses the policy-page layout. It shows checking, paid (key with Copy and redeem steps), extension, slow, canceled, failed and error states in both languages, never infers payment from the redirect, and offers key recovery by checkout email. Keep it out of search with `noindex`.

## Localization

- Support English and Simplified Chinese through a small page-local translation dictionary.
- Follow the browser language only on first visit; persist a manual choice locally and update the document language, title, description, and control labels together.

## Video loading and analytics consent

- Keep the thumbnail visible until the video can play its first segment; do not show a playback button while it loads or plays normally.
- Do not display loading, buffering, playback-failure, or other video state text. Show a centered black play button only when playback cannot proceed.
- The consent prompt is a compact white card with a fine border and shadow fixed to the lower edge. It must clearly state that analytics is optional, keep the decline action equally reachable, and allow a later withdrawal from the footer.

## Footer

- Use a full-width Paper-subtle surface in light mode and Ink-subtle in dark mode, with a fine top divider and a 1200px content width.
- Desktop has a wider brand column followed by Product, Install & help, and Legal. Group headings are small uppercase labels in the tertiary text color. Keep the existing Polaris mark, independent-developer introduction, support email, copyright, and author link.
- Use plain labels: Features, What's new, and Install for Chrome / Edge / Firefox. Footer Pricing and Free trial entries stay hidden for now. Keep the red heart in the author attribution. Preserve the official destination URLs and the existing Analytics settings action.
- Below 950px, put the brand above three link columns; below 560px, use two link columns with 44px targets and a stacked bottom row. Localize with the homepage dictionaries and preserve theme and keyboard focus behavior.

## Subpages

- Every page except the homepage (legal pages, support, checkout return, release notes, blog) uses the same floating header pill and the same footer as the homepage. The markup lives in `scripts/site-chrome.mjs`, styles in `assets/site-chrome.css` (extracted from the homepage's rules), and behavior (language, theme, mobile menu, bilingual articles) in `assets/site.js`.
- After changing the homepage header or footer, mirror it in `scripts/site-chrome.mjs` and run `node scripts/sync-site-chrome.mjs`; the release notes page picks it up on its next sync.
- Single-language pages such as blog posts keep their own `lang`; only the header and footer follow the visitor's language choice.
- The header pill carries Features, Pricing, Blog and Contact on every page (Free trial joins them in the mobile drawer). Privacy stays a homepage section and a footer link, not a header item.
- /contact/ opens with a centered Newsreader “How can we help?” over a faded dot field and the support email, then three bordered cards (Common questions → FAQ, Email support → mailto, GitHub Issues ↗), each with a small dot patch in the top-right corner and an action line pinned to the bottom, then three compact channel links with an icon tile (X, blog, release notes). Internal links end in →, external ones in ↗. One column below 760px.
- Chinese copy is written for Chinese readers, not translated word for word. Product terms follow the extension UI: 目录, 大纲, Marker, 关于与设置; use 扩展 rather than 插件. The Chinese release notes map TOC and Outline to 目录 and 大纲.
- Prices stay in US dollars because checkout charges USD. Chinese pages write US$ and add an approximate RMB figure at 1 USD ≈ 7.2 CNY with a note that the actual charge applies; update both if prices or the rate change. Structured data keeps USD.
- The store install card lists four numbered steps that follow the selected store (open the listing, add and confirm with that store's own button names, pin from the puzzle menu, refresh the AI page), then the version note, then a softly tinted ask to rate or review Polaris in that store.
- Clay fills are for primary actions (hero Free trial, the floating pill, Get Pro). Lower-priority install links, such as the closing CTA, use the Marker highlight instead so Clay is not repeated down the page.
