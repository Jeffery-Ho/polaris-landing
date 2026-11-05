// Shared header and footer for every page except the homepage, which keeps the same
// markup inline. `p` is the relative path back to the site root ("" or "../").
// Each label carries its Simplified Chinese text in data-zh; assets/site.js swaps it in.
const CWS = "https://chromewebstore.google.com/detail/polaris-ai-chat-navigator/lkdbbnpcfkjdfnopecpbdaeegncdmajb";
const EDGE = "https://microsoftedge.microsoft.com/addons/detail/fiaclpfiiiphgijkinloimjidelcfhgi";
const FIREFOX = "https://addons.mozilla.org/en-US/firefox/addon/polaris-ai-chat-navigator/";

const t = (en, zh) => `<span data-zh="${zh}">${en}</span>`;
const home = (p) => p || "./";

export function siteHeader(p = "") {
  return `<!-- site-header:start -->
<header class="site-header">
  <div class="nav-pill">
    <a class="brand" href="${home(p)}" aria-label="Polaris home">
      <img class="brand-icon" src="${p}icons/polaris-icon-96.png?v=e79cc968" alt="Polaris AI logo">
      <span class="brand-name">Polaris</span>
    </a>
    <nav id="primary-navigation" class="header-links" data-menu-panel aria-label="Polaris links">
      <a class="header-link" href="${home(p)}#features">${t("Features", "功能")}</a>
      <a class="header-link" href="${home(p)}#pricing">${t("Pricing", "Pricing")}</a>
      <a class="header-link" href="${p}blog/">${t("Blog", "博客")}</a>
      <a class="header-link" href="${p}contact/">${t("Contact", "联系我们")}</a>
      <a class="header-link header-link--drawer" href="${home(p)}#install">${t("Free trial", "免费试用")}</a>
    </nav>
  </div>
  <div class="header-utilities">
    <div class="header-preferences">
      <div class="language-control" data-language-control>
        <button class="language-toggle" data-language-toggle type="button" aria-expanded="false" aria-haspopup="listbox" aria-label="Language" data-zh-label="语言">
          <svg class="language-toggle-icon" viewBox="0 0 1024 1024" aria-hidden="true" focusable="false"><path d="M938.666667 981.333333c-17.066667 0-29.866667-8.533333-38.4-25.6l-59.733334-119.466666h-277.333333l-59.733333 119.466666c-8.533333 21.333333-34.133333 29.866667-55.466667 17.066667-25.6-8.533333-34.133333-34.133333-21.333333-51.2l72.533333-140.8 145.066667-290.133333c12.8-21.333333 34.133333-38.4 59.733333-38.4s46.933333 12.8 59.733333 38.4l145.066667 290.133333 72.533333 140.8c8.533333 21.333333 0 46.933333-17.066666 55.466667-12.8 4.266667-17.066667 4.266667-25.6 4.266666z m-332.8-226.133333h192l-98.133334-192-93.866666 192zM85.333333 844.8c-17.066667 0-29.866667-8.533333-38.4-25.6-8.533333-21.333333 0-46.933333 21.333334-55.466667 93.866667-46.933333 179.2-110.933333 247.466666-187.733333-46.933333-64-85.333333-128-110.933333-192-8.533333-21.333333 4.266667-46.933333 25.6-55.466667 21.333333-8.533333 46.933333 4.266667 55.466667 25.6 21.333333 51.2 46.933333 102.4 81.066666 149.333334 59.733333-85.333333 102.4-179.2 128-281.6H85.333333c-25.6 0-42.666667-17.066667-42.666666-42.666667s17.066667-42.666667 42.666666-42.666667h243.2V85.333333c0-25.6 17.066667-42.666667 42.666667-42.666666s42.666667 17.066667 42.666667 42.666666v51.2h238.933333c25.6 0 42.666667 17.066667 42.666667 42.666667s-17.066667 42.666667-42.666667 42.666667h-68.266667c-25.6 128-85.333333 247.466667-162.133333 349.866666l25.6 25.6c17.066667 17.066667 17.066667 42.666667 0 59.733334-17.066667 17.066667-42.666667 17.066667-59.733333 0l-17.066667-17.066667c-72.533333 81.066667-162.133333 149.333333-264.533333 200.533333-8.533333 0-17.066667 4.266667-21.333334 4.266667z" fill="currentColor"></path></svg>
          <span data-language-current>EN</span>
          <svg class="language-toggle-chevron" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"></path></svg>
        </button>
        <div class="language-menu" data-language-menu role="listbox" aria-label="Language">
          <button class="language-option" data-language-option="en" type="button" role="option" aria-selected="true">English</button>
          <button class="language-option" data-language-option="zh-CN" type="button" role="option" aria-selected="false">简体中文</button>
        </div>
      </div>
      <div class="theme-toggle" data-theme-toggle role="group" aria-label="Theme" data-zh-label="主题">
        <button class="theme-option" data-theme-option="dark" type="button" aria-label="Dark theme" data-zh-label="深色" aria-pressed="true">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 15.2A8.4 8.4 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"></path></svg>
        </button>
        <button class="theme-option" data-theme-option="light" type="button" aria-label="Light theme" data-zh-label="浅色" aria-pressed="false">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="3.4" fill="none" stroke="currentColor" stroke-width="1.7"></circle><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.7"></path></svg>
        </button>
      </div>
    </div>
    <button class="header-menu-toggle" data-menu-toggle type="button" aria-controls="primary-navigation" aria-expanded="false" aria-label="Open menu" data-zh-label="打开菜单">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path class="menu-line menu-line--top" d="M4 6.5h16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.75"></path>
        <path class="menu-line menu-line--middle" d="M4 12h16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.75"></path>
        <path class="menu-line menu-line--bottom" d="M4 17.5h16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.75"></path>
      </svg>
    </button>
  </div>
</header>
<!-- site-header:end -->`;
}

export function siteFooter(p = "") {
  const h = home(p);
  const li = (href, en, zh, external = false) => `<li><a href="${href}"${external ? ' target="_blank" rel="noreferrer"' : ""}>${t(en, zh)}</a></li>`;
  return `<!-- site-footer:start -->
<footer class="site-footer" id="footer">
  <div class="footer-inner">
    <div class="footer-grid">
      <div class="footer-brand">
        <a class="footer-brand-link" href="${h}" aria-label="Polaris home"><img src="${p}icons/polaris-icon-96.png?v=e79cc968" width="36" height="36" alt="Polaris AI logo"><span>Polaris</span></a>
        <p class="footer-description">${t("Navigate long AI conversations. Built and maintained by an independent developer.", "为长篇 AI 对话提供清晰导航。由独立开发者打造并持续维护。")}</p>
        <a class="footer-email" href="mailto:support@polaris-ai.work">support@polaris-ai.work</a>
      </div>
      <nav class="footer-nav" aria-label="Product"><h2>${t("Product", "产品")}</h2>
        <ul>
          ${li(`${h}#capabilities`, "How it works", "工作方式")}${li(`${h}#features`, "Features", "功能介绍")}${li(`${h}#platforms`, "Supported platforms", "支持平台")}${li(`${h}#faq`, "FAQ", "常见问题")}${li(`${p}release-notes/`, "Release notes", "版本说明")}${li(`${p}blog/`, "Blog", "博客")}
        </ul>
      </nav>
      <nav class="footer-nav" aria-label="Install &amp; help"><h2>${t("Install &amp; help", "安装与帮助")}</h2>
        <ul>
          ${li(CWS, "Install for Chrome", "Chrome 安装", true)}
          ${li(EDGE, "Install for Edge", "Edge 安装", true)}
          ${li(FIREFOX, "Install for Firefox", "Firefox 安装", true)}
          ${li(`${h}#install`, "Local installation", "本地安装")}
          <li><a href="https://github.com/Jeffery-Ho/Polaris-AI-Chat-Navigator/issues" target="_blank" rel="noreferrer">GitHub Issues</a></li>
          ${li(`${p}contact/`, "Contact", "联系我们")}
        </ul>
      </nav>
      <nav class="footer-nav" aria-label="Legal"><h2>${t("Legal", "法律")}</h2>
        <ul>
          ${li(`${p}privacy.html`, "Privacy policy", "隐私政策")}
          ${li(`${p}safety.html`, "Security", "安全说明")}
          ${li(`${p}terms.html`, "Terms of use", "使用条款")}
          ${li(`${p}refund.html`, "Refund policy", "退款政策")}
        </ul>
      </nav>
    </div>
    <div class="footer-bottom">
      <p>© 2026 Polaris</p>
      <p>Made with <svg class="footer-heart" viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" focusable="false"><path d="M12 21 3.5 12.5a5.3 5.3 0 0 1 7.5-7.5L12 6l1-1a5.3 5.3 0 0 1 7.5 7.5Z"></path></svg><span class="sr-only">love</span> by <a href="https://x.com/JefferyHo_" target="_blank" rel="noreferrer">Jeffery Ho</a></p>
    </div>
  </div>
</footer>
<!-- site-footer:end -->`;
}

// Head tags every subpage needs for the shared chrome.
export const chromeHead = (p = "") => `<link rel="stylesheet" href="${p}assets/site-chrome.css">
  <script src="${p}assets/site.js"></script>`;

// Put the shared chrome into a page: replaces an earlier copy, the old legal-page nav and
// language buttons, the old blog header, and any footer, then wires the stylesheet and script.
export function applyChrome(html, p = "") {
  let out = html
    .replace(/\n?<!-- site-header:start -->[\s\S]*?<!-- site-header:end -->\n?/, "\n")
    .replace(/\n?<!-- site-footer:start -->[\s\S]*?<!-- site-footer:end -->\n?/, "\n")
    .replace(/\n\s*<nav aria-label="(?:Legal pages|Polaris)">[\s\S]*?<\/nav>/, "")
    .replace(/\n\s*<header class="blog-nav">[\s\S]*?<\/header>/, "")
    .replace(/\n\s*<footer(?: class="blog-footer")?>[\s\S]*?<\/footer>/, "")
    .replace(/\n\s*<script src="[^"]*assets\/legal\.js"[^>]*><\/script>/, "")
    .replace(/\n\s*<link rel="stylesheet" href="[^"]*assets\/site-chrome\.css">/, "")
    .replace(/\n\s*<script src="[^"]*assets\/site\.js"[^>]*><\/script>/, "")
    .replace(/\n\s*<script>\s*try \{ const theme = localStorage[\s\S]*?<\/script>/, "");
  out = out.replace(/(<link rel="stylesheet" href="[^"]*assets\/theme\.css[^"]*">)/, `$1\n  ${chromeHead(p)}`);
  out = out.replace(/<body([^>]*)>\n?/, (match, attrs) => `<body${attrs}>\n${siteHeader(p)}\n`);
  out = out.replace(/\n?<\/body>/, `\n${siteFooter(p)}\n</body>`);
  return out.replace(/\n{3,}/g, "\n\n");
}
