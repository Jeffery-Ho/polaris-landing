// Shared behavior for every page except the homepage: theme, language and the mobile menu
// in the site header, plus bilingual articles marked with data-legal-locale.
(() => {
  const localeKey = "polaris-landing-locale";
  const themeKey = "polaris-landing-theme";
  const root = document.documentElement;
  const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch { /* Works without persistence. */ } };
  const all = (selector) => Array.from(document.querySelectorAll(selector));

  if (/^Win/i.test(navigator.userAgentData?.platform || navigator.platform || "")) root.dataset.platform = "windows";

  function setTheme(value, persist) {
    const theme = value === "light" ? "light" : "dark";
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    all("[data-theme-option]").forEach((option) => option.setAttribute("aria-pressed", String(option.dataset.themeOption === theme)));
    if (persist) write(themeKey, theme);
  }

  function setLanguage(value, persist) {
    const locale = value === "zh-CN" ? "zh-CN" : "en";
    const zh = locale === "zh-CN";
    const blocks = all("[data-legal-locale]");
    // Single-language pages (the blog) keep their own lang; only the header and footer switch.
    if (blocks.length) root.lang = locale;
    else all(".site-header, .site-footer").forEach((node) => { node.lang = locale; });
    blocks.forEach((block) => { block.hidden = block.dataset.legalLocale !== locale; });
    all("[data-zh]").forEach((node) => {
      if (node.dataset.en === undefined) node.dataset.en = node.innerHTML;
      node.innerHTML = zh ? node.dataset.zh : node.dataset.en;
    });
    all("[data-zh-label]").forEach((node) => {
      if (node.dataset.enLabel === undefined) node.dataset.enLabel = node.getAttribute("aria-label") || "";
      node.setAttribute("aria-label", zh ? node.dataset.zhLabel : node.dataset.enLabel);
    });
    all("[data-language-current]").forEach((node) => { node.textContent = zh ? "简体中文" : "English"; });
    all("[data-language-option]").forEach((option) => option.setAttribute("aria-selected", String(option.dataset.languageOption === locale)));
    const heading = document.querySelector(`[data-legal-locale="${locale}"] h1`);
    if (heading) document.title = `${heading.textContent} · Polaris AI`;
    if (persist) write(localeKey, locale);
  }

  const savedTheme = read(themeKey);
  setTheme(["light", "dark"].includes(savedTheme) ? savedTheme : matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark", false);

  function start() {
    const requested = new URLSearchParams(location.search).get("lang");
    const saved = read(localeKey);
    const browser = /^zh(?:-|$)/i.test(navigator.language || "") ? "zh-CN" : "en";
    setLanguage(["en", "zh-CN"].includes(requested) ? requested : ["en", "zh-CN"].includes(saved) ? saved : browser, false);
    setTheme(root.dataset.theme, false);

    const menuToggle = document.querySelector("[data-menu-toggle]");
    const menuPanel = document.querySelector("[data-menu-panel]");
    const languageToggle = document.querySelector("[data-language-toggle]");
    const languageMenu = document.querySelector("[data-language-menu]");
    const setMenu = (open) => {
      if (!menuToggle || !menuPanel) return;
      menuToggle.setAttribute("aria-expanded", String(open));
      menuPanel.dataset.menuOpen = String(open);
    };
    const setLanguageMenu = (open) => {
      if (!languageToggle || !languageMenu) return;
      languageToggle.setAttribute("aria-expanded", String(open));
      languageMenu.dataset.menuOpen = String(open);
    };
    menuToggle?.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
    menuPanel?.addEventListener("click", (event) => { if (event.target.closest("a")) setMenu(false); });
    languageToggle?.addEventListener("click", () => setLanguageMenu(languageToggle.getAttribute("aria-expanded") !== "true"));
    all("[data-language-option]").forEach((option) => option.addEventListener("click", () => {
      setLanguage(option.dataset.languageOption, true);
      setLanguageMenu(false);
    }));
    all("[data-theme-option]").forEach((option) => option.addEventListener("click", () => setTheme(option.dataset.themeOption, true)));
    document.addEventListener("click", (event) => { if (!event.target.closest("[data-language-control]")) setLanguageMenu(false); });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      setMenu(false);
      setLanguageMenu(false);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
