import { supportConfig } from "../support-config.js";
import { claimLicense, findClaim, recoverLicense } from "./checkout.js";

const apiBase = supportConfig.billingApiUrl;
const params = new URLSearchParams(window.location.search);
const result = params.get("result");
const purchaseId = params.get("purchase");
const pollInterval = 3000;
const pollLimit = 40;

// Never infer payment from the redirect: only the Worker's claim response shows a key.
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
    const order = await claimLicense(apiBase, claim);
    if (order.status === "paid" && order.licenseKey) return showKey(order.licenseKey);
    if (order.status === "failed") return show("failed");
    if (order.status === "canceled") return show("cancel");
    if (attempt + 1 >= pollLimit) return show("slow");
  } catch (error) {
    if (error.status === 401) return show("extension");
    if (attempt + 1 >= pollLimit) return show("error");
  }
  window.setTimeout(() => poll(claim, attempt + 1), pollInterval);
}

const claim = purchaseId ? findClaim(purchaseId) : null;
if (result === "cancel") show("cancel");
else if (!apiBase) show("error");
else if (claim) poll(claim);
else show("extension");

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
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const zh = document.documentElement.lang === "zh-CN";
    const button = form.querySelector("button");
    button.disabled = true;
    try {
      await recoverLicense(apiBase, new FormData(form).get("email"));
      status.textContent = zh ? "如果这个邮箱有有效的购买记录，许可证会发送过去。" : "If this email has an eligible purchase, the license key will be sent to it.";
    } catch {
      status.textContent = zh ? "暂时无法发送，请稍后再试或联系 support@polaris-ai.work。" : "We could not send it right now. Try again later or contact support@polaris-ai.work.";
    } finally {
      button.disabled = false;
    }
  });
});
