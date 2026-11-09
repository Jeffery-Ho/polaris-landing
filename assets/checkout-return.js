import { supportConfig } from "../support-config.js";
import { claimLicense, findClaim } from "./checkout.js";

const params = new URLSearchParams(window.location.search);
const result = params.get("result");
const purchaseId = params.get("purchase");
const pollInterval = 3000;
const pollLimit = 40;

function show(state) {
  document.querySelectorAll("[data-state]").forEach((section) => {
    section.hidden = section.dataset.state !== state;
  });
}

function showKey(key) {
  document.querySelectorAll("[data-license-key]").forEach((element) => { element.textContent = key; });
  show("paid");
}

async function poll(claim, attempt = 0) {
  try {
    const order = await claimLicense(supportConfig.billingApiUrl, claim);
    if (order.status === "paid" && order.licenseKey) return showKey(order.licenseKey);
    if (order.status === "failed") return show("failed");
    if (order.status === "canceled") return show("cancel");
    if (attempt + 1 >= pollLimit) return show("slow");
  } catch {
    if (attempt + 1 >= pollLimit) return show("unconfirmed");
  }
  window.setTimeout(() => poll(claim, attempt + 1), pollInterval);
}

// result=success is not proof of payment. A license appears only after claim.
const claim = purchaseId ? findClaim(purchaseId) : null;
if (result === "cancel") show("cancel");
else if (claim) {
  show("checking");
  poll(claim);
} else show("unconfirmed");

document.querySelectorAll("[data-copy-key]").forEach((button) => {
  const label = button.textContent;
  button.addEventListener("click", async () => {
    const key = button.parentElement.querySelector("[data-license-key]").textContent;
    try {
      await navigator.clipboard.writeText(key);
      button.textContent = document.documentElement.lang === "zh-CN" ? "已复制" : "Copied";
    } catch {
      window.getSelection()?.selectAllChildren(button.parentElement.querySelector("[data-license-key]"));
    }
    window.setTimeout(() => { button.textContent = label; }, 1600);
  });
});

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
