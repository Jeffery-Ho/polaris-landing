(() => {
  const localeKey = "polaris-landing-locale";
  let savedLocale; let savedTheme;
  try { savedLocale = localStorage.getItem(localeKey); savedTheme = localStorage.getItem("polaris-landing-theme"); } catch { /* The policy remains readable when storage is unavailable. */ }
  if (/^Win/i.test(navigator.userAgentData?.platform || navigator.platform || "")) document.documentElement.dataset.platform = "windows";
  if (["light", "dark"].includes(savedTheme)) document.documentElement.dataset.theme = savedTheme;
  const requested = new URLSearchParams(location.search).get("lang");
  function setLanguage(value, persist) {
    const locale = value === "zh-CN" ? "zh-CN" : "en";
    document.documentElement.lang = locale;
    document.querySelectorAll("[data-legal-locale]").forEach(article => { article.hidden = article.dataset.legalLocale !== locale; });
    document.querySelectorAll("[data-legal-language]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.legalLanguage === locale)));
    document.title = document.querySelector(`[data-legal-locale="${locale}"] h1`).textContent + " · Polaris AI";
    if (persist) try { localStorage.setItem(localeKey, locale); } catch { /* Language selection also works without persistence. */ }
  }
  const initial = ["en", "zh-CN"].includes(requested) ? requested : ["en", "zh-CN"].includes(savedLocale) ? savedLocale : /^zh(?:-|$)/i.test(navigator.language || "") ? "zh-CN" : "en";
  document.querySelectorAll("[data-legal-language]").forEach(button => button.addEventListener("click", () => setLanguage(button.dataset.legalLanguage, true)));
  setLanguage(initial, false);
})();
