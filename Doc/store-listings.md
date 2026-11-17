# Store listings and off-site copy

Drafted 2026-11-17. Paste these into the store dashboards by hand; nothing here is published automatically. Wording follows the website (`index.html` i18n, `llms.txt`), so the name and feature list stay the same on the site, the stores and GitHub.

## Current state (checked 2026-11-17)

| Store | Name | Short description | Long description | Privacy policy |
|---|---|---|---|---|
| Firefox Add-ons (AMO API v5) | Polaris: AI Chat Navigator | Old text: "Show heading markers for supported AI web answers and jump to headings from the right edge." | **Empty** (`description: null`) | **Not set** (`has_privacy_policy: false`) |
| Chrome Web Store | Polaris: AI Chat Navigator | Not checked here | Not checked here | Not checked here |
| Edge Add-ons | — | Not checked here | Not checked here | Not checked here |

AMO also shows `support_url` as `https://polaris-ai.work` (no trailing slash) and a support email that differs from `support@polaris-ai.work`. Point support to `https://polaris-ai.work/contact/`, and decide which email the stores should show.

Chrome Web Store has rejected a full list of platforms as keyword spam once before. Keep the supported sites to the single sentence below and do not repeat them elsewhere in the description.

## Name (all stores)

Polaris: AI Chat Navigator

## Short description

- EN (≤132 chars, fits Chrome): `Table of Contents, Outline and edge markers for long AI chats on ChatGPT, Claude, Gemini and more. Processed locally.`
- ZH: `为 ChatGPT、Claude、Gemini 等长对话提供目录、大纲和边缘标记，在本地处理。`

## Long description, English

```
Polaris: AI Chat Navigator adds a Table of Contents, an Outline and edge markers to long AI chat answers, so you can jump to any section instead of scrolling.

TABLE OF CONTENTS
Every heading of every answer is listed beside the chat, grouped under your prompt. One click lands on the right section.

OUTLINE
Read one long answer section by section, with tables, task lists, code and images kept. Copy a section, or export the answer as Markdown or HTML.

EDGE MARKERS
Headings, lists and tables become small markers on the edge of the page. Hover to preview, click to jump. You choose which structures get a marker.

SEARCH
Type a word to filter the Table of Contents and Outline, then jump straight to the match.

WORKS WHILE IT STREAMS
Markers appear as soon as the first section is written.

SUPPORTED SITES
ChatGPT, Claude, Gemini, Grok, Doubao, Kimi, Qwen, Yuanbao, Diandian AI, Manus and DeepSeek.

FREE AND PRO
Free: two supported sites at a time, with a Table of Contents for the messages already loaded. No payment details needed.
Pro: a one-time purchase, no subscription. Unlocks every supported site and Long conversation mode, which keeps earlier messages of very long chats in the Table of Contents. $12.90 during the first 7 days of the free trial, then $19.99.

PRIVACY
Polaris reads the answer on the page you have open and builds its navigation locally in your browser. Conversation content is not sent to the developer or to any third party. Pro license checks use a random installation identifier, not your chats.

Website: https://polaris-ai.work/
Privacy policy: https://polaris-ai.work/privacy.html
Support: https://polaris-ai.work/contact/
```

## Long description, Simplified Chinese

```
Polaris: AI Chat Navigator 为 AI 长回答加上目录、大纲和边缘标记，一键跳到任意一节，不用来回滚动。

目录
每条回答的全部标题列在对话旁，按你的提问分组，点一下就落到那一节。

大纲
逐节阅读一条长回答，保留表格、任务列表、代码和图片；可复制某一节，或导出为 Markdown / HTML。

边缘标记
标题、列表和表格在页面边缘生成标记，悬停预览，点击跳转；你可以决定哪些内容生成标记。

搜索
输入关键词筛选目录和大纲，直接跳到匹配位置。

边生成边导航
回答写出第一节，标记就会出现。

支持的网站
ChatGPT、Claude、Gemini、Grok、豆包、Kimi、通义千问、元宝、点点 AI、Manus 和 DeepSeek。

免费版与 Pro
免费版：同时在 2 个已支持网站上使用，目录覆盖页面已加载的消息，无需支付信息。
Pro：一次买断，不订阅。解锁全部网站和长对话模式，在超长对话里保留更早的消息、用目录跳转。免费试用前 7 天内 US$12.90，之后 US$19.99。

隐私
Polaris 只读取你当前打开页面上的回答，并在浏览器本地生成导航；对话内容不会发送给开发者或任何第三方。Pro 许可证校验只使用随机安装标识，不涉及对话内容。

官网：https://polaris-ai.work/zh/
隐私政策：https://polaris-ai.work/privacy.html
支持：https://polaris-ai.work/contact/
```

## Firefox-specific fields

- Summary (≤250 chars): use the English short description above.
- Description: the English long description; add the Chinese one as the zh-CN localization.
- Privacy policy: AMO accepts the policy text itself, not only a link. Paste the extension section of `privacy.html` and keep the link to `https://polaris-ai.work/privacy.html`.
- Homepage: `https://polaris-ai.work/`. Support site: `https://polaris-ai.work/contact/`.

## Screenshots

Use the five 1280×800 frames in `polaris-cws-screenshots-en/` on all three stores (Table of Contents, Markers, Outline, Search, Where it works). They are illustrations built from the website's demos, not captures of the live extension. Replace them with real captures on chatgpt.com and claude.ai when you have them, and use the same captures on the two landing pages.

## GitHub README and off-site mentions

Use the full name and link to the website. Suggested opening for the extension repository README:

```
# Polaris: AI Chat Navigator

A browser extension that adds a Table of Contents, an Outline and edge markers to long AI chat answers on ChatGPT, Claude, Gemini and more. Conversations are processed locally.

- Website: https://polaris-ai.work/
- Chrome Web Store · Edge Add-ons · Firefox Add-ons: links on https://polaris-ai.work/#install
- Use cases: [ChatGPT table of contents](https://polaris-ai.work/chatgpt-table-of-contents/), [Claude conversation navigator](https://polaris-ai.work/claude-conversation-navigator/)
```

When answering related community questions (for example "how to navigate long ChatGPT answers"), write "Polaris: AI Chat Navigator" in full and link the matching landing page, not the homepage alone. This helps tell it apart from other products called "Polaris AI".
