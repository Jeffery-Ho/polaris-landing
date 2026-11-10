# Stripe Checkout 上线清单

## 待填写的值

生产 Checkout 沿用现有的一次性付款模式、已配置的回跳 URL 和正式 Stripe Price。官网匿名买家使用 `STRIPE_PRICE_PRO_PROMO`（USD 12.90），原价为 USD 19.99。扩展内同样在首次打开后 7 天内使用该优惠价，试用结束后使用 `STRIPE_PRICE_PRO_DEFAULT`（USD 19.99）。生产调用没有示例占位值。

- 官网入口见 [assets/checkout.js](assets/checkout.js)，回跳与领取见 [assets/checkout-return.js](assets/checkout-return.js)。
- 正式 Checkout 创建于扩展仓库的 `workers/license-production/src/index.js`，对应 [生产支付 Worker PR](https://github.com/Jeffery-Ho/Polaris-AI-Chat-Navigator/pull/9)。本仓库的旧 `server/` 目录不参与官网购买。

## 已配置的参数

Worker 通过现有的 Stripe REST 客户端发送表单参数，沿用已锁定的 API 版本。

| 参数 | 值 |
| --- | --- |
| `ui_mode` | `hosted_page` |
| `billing_address_collection` | `auto` |
| `phone_number_collection.enabled` | `false` |
| `automatic_tax.enabled` | `false` |
| `allow_promotion_codes` | `false` |
| `submit_type` | `auto` |
| `integration_identifier` | `hosted_web_0001` |
| `origin_context` | `web` |

`payment_method_collection` 仅用于订阅。生产调用保留 `metadata[purchaseId]`，由 webhook 关联并校验订单。 [Stripe Checkout Session API](https://docs.stripe.com/api/checkout/sessions/create)

## 配置与验收

1. 生产 Worker 使用 `STRIPE_SECRET_KEY` 和 `STRIPE_WEBHOOK_SECRET` 两个秘密绑定，Price ID 使用 `STRIPE_PRICE_PRO_DEFAULT` 和 `STRIPE_PRICE_PRO_PROMO`。生产 D1、许可证签名与加密秘密、邮件绑定独立于沙盒。仅使用 Worker 秘密绑定保存凭据。 [Stripe 密钥管理](https://docs.stripe.com/keys-best-practices)
2. 在 Dia WORK 打开 v2，点击「购买 Pro」，确认跳转至 USD 12.90 的正式 Stripe Checkout。取消后确认返回页正确显示取消状态。重新发起一笔指定的正式验收订单并完成付款。 [v2 预览](https://polaris-ai.work/v2/#pricing)
3. 在原浏览器核对付款成功回到 `/v2/checkout-return/`，等待已签名 webhook 确认并签发许可证。确认网页可领取、在扩展中可兑换，并检查实际收件箱中的许可证邮件。 [Stripe 付款履约](https://docs.stripe.com/checkout/fulfillment)
4. 仅对这笔验收订单操作退款，核对 webhook、订单状态、旧激活凭证和再次兑换。确认退款后的凭证已失效。 [Stripe 退款](https://docs.stripe.com/refunds)
5. 沙盒回归使用独立的 `polaris-license-test` Worker、Price 和 webhook。成功卡为 `4242 4242 4242 4242`，拒付卡为 `4000 0000 0000 0002`。正式 Checkout 使用真实付款方式。 [Stripe 测试卡](https://docs.stripe.com/testing)
6. 在 Stripe 正式环境核对 Worker 使用的是替换后的密钥，撤销曾暴露的旧密钥并确认旧密钥失效。确认当前 Worker 版本没有以 `rk_live_` 开头的明文变量。 [Stripe 密钥管理](https://docs.stripe.com/keys-best-practices)
7. v2 验收通过后，通过 PR 合并到 `main`，检查 ECS 部署及官网首页、结账按钮和回跳页。 [官网部署说明](README.md)

本仓库新增此清单，支付服务和路由沿用现有结构。 [Stripe 支持](https://support.stripe.com/) · [Stripe MCP 文档](https://docs.stripe.com/mcp)
