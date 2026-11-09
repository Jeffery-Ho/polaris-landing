const params = new URLSearchParams(window.location.search);
const result = params.get("result");

// The query is not proof of payment. Cancel is only the aborted-checkout
// state. Every other value, including success, stays unverified.
function show(state) {
  document.querySelectorAll("[data-state]").forEach((section) => {
    section.hidden = section.dataset.state !== state;
  });
}

show(result === "cancel" ? "cancel" : "unconfirmed");

document.querySelectorAll("[data-recover-form]").forEach((form) => {
  const status = form.querySelector("[data-recover-status]");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const zh = document.documentElement.lang === "zh-CN";
    status.textContent = zh
      ? "本页不发送许可证。请在 Polaris 设置中找回，或联系 support@polaris-ai.work。"
      : "This page does not send a license key. Recover it in Polaris settings, or contact support@polaris-ai.work.";
  });
});
