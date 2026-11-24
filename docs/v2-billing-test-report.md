# Polaris v2 购买与许可证测试报告

日期：2026-11-06。只读核查加本地夹具，没有改产品代码，没有部署，没有合并，没有用真实银行卡，没有发邮件。

## 结论

**预览不能作为收款上线版本。** 2026-11-06 17:48（UTC+8）之后的复测仍是这个结论。详见下面的「复测」一节。站点展示的是一次性美元买断，Worker 也只接受 Stripe 测试密钥，但新创建的沙箱结账返回后仍落到生产根路径，而根路径上的 `/checkout-return/` 是 404。

## 复测（2026-11-06，请求时间 17:48 UTC+8）

对照的是复测当时的线上，不沿用上一节的假设。

| 组件 | 复测时的版本 |
| --- | --- |
| 前端 | `v2` @ `ab8cfb9dada2af4d280fca39efdb317b702a4352`。Preview 工作流 run `42176542583` 在 2026-11-06 06:46:38Z 成功。线上首页含该提交的新句子 “other popular AI chat sites”，`/v2/` 的 Last-Modified 为 06:46:31 GMT |
| 结账脚本 | `assets/checkout.js` SHA-256 `4b2fdb997956f88a014cf28f7ceec28683611be516d134fd812da9782df57062`，与上一轮相同 |
| Worker | `polaris-license-test`，部署 `9c939555-0a01-420b-af37-bb4583d92ce0`，创建于 2026-11-05 08:38:05Z，版本 `7c4a5dfb-4cb8-4c1f-9eb9-c8ab96e2d9c9` 占 100%。health 仍是 `env=test`、`version=0.1.3`。当场下载的脚本 26307 字节，FNV-1a `233e6f7e`，与仓库夹具 `test/billing/worker-snapshot.js` 相同。没有 `/v2/checkout-return` |
| 邮件绑定 | 当前绑定仍只有 D1、两个价格 ID、`ENVIRONMENT=test`、`PUBLIC_APP_URL=https://polaris-ai.work`、`ALLOWED_ORIGINS`，以及三个 secret 名称。没有 `EMAIL`、`EMAIL_FROM_ADDRESS`、`EMAIL_PROVIDER_API_KEY`。脚本里仍有「缺少发信地址或发送绑定就直接 return」 |

| 上次问题 | 复测 | 期望 | 实际 |
| --- | --- | --- | --- |
| 回跳落到根路径并 404 | **仍失败** | 新会话的成功和取消地址在 `/v2/checkout-return/` | 新会话只创建了 1 个，模式 `cs_test_`，金额 1290，未付款。结账页上唯一指向本站的链接是取消地址，主机 `polaris-ai.work`，路径 `/checkout-return/`，参数只有 `result=cancel` 和 `purchase`。点它之后页面是 nginx 1.24.0 的 404。`/v2/checkout-return/` 单独打开仍是 200。成功回跳没有走完付款，所以没有单独导航；同一段未改动的 Worker 用同一个函数生成成功地址，只是 `result=success` |
| 付款后看不到许可证，邮件未配置 | **邮件仍未配置；领取未验证** | 付款后能看到密钥，或有已配置的发信 | 没有发证，因为没有完成付款。完成付款要在 Stripe 填写邮箱，这里没有获准的测试邮箱或捕获邮箱，共享测试 D1 也不是隔离库，所以没有提交成功、拒付或 3DS。不能再说「已经证明发不出去」以外的话：按当前绑定，定时任务会在发信前返回；这是这次读到的配置，不是上次的记录 |
| 免费试用胶囊压住 Get Pro | **仍失败** | 桌面和 390 宽下购买按钮不被挡住 | 最新首页上，胶囊 `data-visible=true`。桌面和 390 宽截图里，胶囊盖住 Get Pro 下沿。见 `docs/test-artifacts/retest-20261106-desktop-en.png` 和 `retest-20261106-mobile-390-en.png` |
| 360 宽横向溢出 | **仍测到** | 不出现横向溢出 | 请求视口 360 时 `innerWidth` 为 376，`scrollWidth - clientWidth` 为 16。价格和 Get Pro 仍可读。见 `retest-20261106-mobile-360-en.png` |
| 中英文价格 | **仍是美元 12.90** | 不把估算人民币当成扣款货币 | 英文 `$12.90`，条款 `USD · One-time payment · Lifetime access`。页面内切到简体后是 `US$12.90` 和 `约 ¥93 · 一次买断 · 永久使用`，按钮「购买 Pro」。见 `retest-20261106-desktop-zh.png` |

沙箱端到端：**未完成。** 结账页已打开，Sandbox 标记和 `$12.90` 都在，没有点 Pay。这个美国出口下能看到 Apple Pay、Link（两者呈不可用的浅色）、Card、Alipay。没有看到微信支付或 Google Pay。这只是展示，不是扣款成功，也不能代表其他国家。截图 `docs/test-artifacts/retest-20261106-stripe-sandbox.png` 不含地址栏。取消后的 404 是 `docs/test-artifacts/retest-20261106-after-cancel.png`。

阻塞：Stripe Checkout 必须填邮箱；没有获准的测试身份或捕获邮箱。付款写入会进共享的 `polaris-license-test` D1，不是一次性空库。因此没有使用测试卡。

地区和设备：本机出口仍是美国。`zh-HK`、`de-DE` 的 `navigator.language` 覆写在这次线上加载里没有生效，页面仍是英文；部署后的首页源码仍是 `/^zh(?:-|$)/` 才进简体，否则英文。真 Safari、Edge、Firefox 和真机仍未测。语言切换只在已打开的页面上点了简体，没有再为每个国家重新拉整页。

本地回归：在确认 Worker 字节与夹具一致之后重跑了功能和负载。这不是线上容量。同一 IP 35 次结账仍是 30 次 200、5 次 429。50 个并发重复事件仍是 1 张许可证，邮件发送 0。2026-11-06 09:54:36Z 的负载：

| 并发 | 请求 | 耗时 ms | 吞吐 req/s | 错误 % | p50 | p95 | p99 | 许可证 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 4.0 | 252.28 | 0 | 3.93 | 3.93 | 3.93 | 1/1 |
| 5 | 5 | 6.5 | 766.22 | 0 | 6.16 | 6.42 | 6.42 | 5/5 |
| 10 | 10 | 13.4 | 744.85 | 0 | 12.84 | 13.24 | 13.24 | 10/10 |
| 25 | 25 | 28.8 | 866.83 | 0 | 26.76 | 28.21 | 28.36 | 25/25 |
| 50 | 50 | 64.3 | 777.43 | 0 | 44.12 | 62.98 | 63.66 | 50/50 |
| 100 | 100 | 150.5 | 664.52 | 0 | 83.60 | 146.44 | 148.99 | 100/100 |

本次新沙箱会话 1 个，上限 5。线上只读约 6 次 GET，加上浏览器打开首页和这一次结账页，没有压测 Stripe。

复测计数：先前 4 项缺陷里 3 项仍失败、1 项（360 溢出）仍测到；许可证领取未验证；沙箱成功、拒付、3DS 未跑。本地 16 项重跑通过。仍不能收款上线。

## 沙箱端到端（2026-11-06 约 18:15 UTC+8）

付款前再次请求 `GET /health`，返回 `{"ok":true,"env":"test","version":"0.1.3"}`。三笔会话的结账地址都含 `cs_test_`，页面有 Sandbox 标记和 `$12.90`，没有 `cs_live_`。只用已授权邮箱。没有删除原有数据。本次新建 3 笔，前缀 `298b3cda`、`073534a9`、`9360afca`。

| 场景 | 付款结果 | 回跳 | 许可证 | 邮件行 |
| --- | --- | --- | --- | --- |
| 成功，官方测试卡 | Stripe 接受并离开结账页 | 落到 `polaris-ai.work/checkout-return/`，`result=success`，nginx 404。网站没有显示密钥 | 同一笔 claim 返回 `paid`，密钥以 `POL-` 开头、长度 68。立刻再查一次，状态和密钥都相同 | 1 条，状态 `pending`，没有发出 |
| 拒付，官方拒付测试卡 | 停在 Stripe，原文 “Your credit card was declined.” | 没有跳转 | claim 为 `pending`，没有密钥。再查一次仍是这样 | 0 |
| 3DS，官方需要验证的测试卡 | 出现 Stripe 自己的 “3D Secure 2 Test Page”，按钮是 COMPLETE 和 FAIL，不是银行页面 | 没有完成验证。浏览器关掉后，保存的链接缺少片段，Stripe 提示链接不完整。没有再开第 4 笔 | claim 仍是 `pending`，没有密钥 | 0 |

成功这笔证明：webhook 已签发许可证，领取接口对这笔已知订单可用，重复领取不会换一把新密钥。买家在网站上看不到，因为回跳页是 404。邮件只入队，绑定仍不会发送。截图 `docs/test-artifacts/e2e-success-return-404.png` 只有 404，没有密钥或会话号。含卡号的页面没有放进仓库。

沙箱成功付款：**付款成功，网站交付失败。** 拒付：**符合预期，未发证。** 3DS：**只看到测试挑战，没有完成。** 仍不能作为正式收款版本。

## 版本与归属

| 项 | 结果 |
| --- | --- |
| 默认分支 | `main` @ `47cdd10549f8b9517f0a7c1935f755b3e45469f9`。没有结账代码，也没有 `billingApiUrl` |
| 预览分支 | `v2` @ `780f4ed071167d3d85e43f702a0e548eec76ef76`。GitHub Actions「Preview v2 at /v2/」成功，run `42172703869` |
| 线上核对 | `https://polaris-ai.work/v2/support-config.js`、`assets/checkout.js`、`assets/checkout-return.js` 的 SHA-256 与该提交一致 |
| 结账 API | `https://polaris-license-test.hexianji.workers.dev`。`GET /health` 返回 `{"ok":true,"env":"test","version":"0.1.3"}` |
| Cloudflare | 账号 `Hexianji6275@gmail.com's Account` 下的 Worker `polaris-license-test`，100% 部署版本 `7c4a5dfb-4cb8-4c1f-9eb9-c8ab96e2d9c9`（2026-11-05） |
| D1 | 库名 `polaris-license-test`，绑定名 `DB`。`version: production` 是 Cloudflare D1 的库版本字段，不是 Stripe 正式模式 |
| 源码仓库 | README 写的 `Polaris-for-Web/workers/license-test` 不在可访问的 Git 树里。`Jeffery-Ho/Polaris-for-Web` 会转到公开仓库 `Polaris-AI-Chat-Navigator`，其中没有 `workers/`。本报告的夹具是只读下载的已部署 Worker 包，不是猜测出来的实现 |
| Stripe 模式 | Worker 在调用 Stripe 前要求密钥匹配 `sk_test_` 或 `rk_test_`，并拒绝 `livemode: true` 和非 `cs_test_` 会话。本次创建的唯一会话是 `cs_test_`，金额 1290，未付款 |
| 出口 | 本机 Cloudflare trace 为 `loc=US`、`colo=IAD`。这不是中国、香港、欧盟、英国或新加坡的网络 |

价格：页面和 Worker 的官网价都是 **USD 12.90（1290 分）一次性、永久**。扩展内试用期内同价，试用结束后 **USD 19.99**。未使用、未入库的旧 `server/` 被说明为 USD 12。当前价等于口头说的 $12.9，不等于那套未部署的 $12。

## 缺陷

### 严重：v2 付款回跳到根路径，根路径 404

- 期望：在 `https://polaris-ai.work/v2/` 付款后回到 `/v2/checkout-return/`，用浏览器里的 claim token 领取许可证。
- 实际：已部署 Worker 用请求的 Origin 拼接 `/checkout-return/`，Origin 只有 `https://polaris-ai.work`，不含 `/v2/`。线上 `GET /checkout-return/` 返回 nginx 404；`GET /v2/checkout-return/` 返回 200。
- 证据：本地夹具断言成功/取消 URL 的路径是 `/checkout-return/`。线上直接打开该路径返回 nginx 404。沙箱结账页点返回后，真实 Chrome 落在 `polaris-ai.work/checkout-return/?result=cancel&purchase=…`，页面是 nginx 1.24.0 的 404。见 `docs/test-artifacts/return-after-cancel.png`。没有输入卡号。`docs/test-artifacts/return-cancel-390.png` 只是本地快照里取消页能正常渲染的样子。
- 叠加：已部署绑定里没有 `EMAIL`、没有发信密钥。定时任务在缺少发信配置时直接返回。回跳页写明「开启许可证邮件后才会发送」。买家看不到密钥，邮件也不会发。

### 高：浮动「免费试用」压住购买按钮

- 期望：定价区的 Get Pro / 购买 Pro 可被看到并点击。
- 实际：线上 Chrome 桌面截图里，滚动后出现的 Free trial 胶囊压在两张价格卡底部，盖住 Continue for free 和 Get Pro 的一部分。390 宽的线上视口里，Pro 卡下方被同一颗按钮挡住，Get Pro 还在首屏下面。
- 证据：`docs/test-artifacts/v2-pricing-desktop.png`、`v2-pricing-mobile.png`、`v2-pricing-zh.png`。这是真实 Chrome 打开线上预览，不是视口冒充 Safari。

### 中：简体中文把估算人民币放在价格说明的主行

- 期望：各语言都明确扣款货币是美元，估算汇率不能看起来像应付金额。
- 实际：英文是 `$12.90`，说明为 `USD · One-time payment · Lifetime access`。简体是大号 `US$12.90`，其下主说明是 `约 ¥93 · 一次买断 · 永久使用`。旁边有「1 美元约 7.2 元，以实际扣款为准」。免费价写成 `¥0`，和 Pro 的 `US$` 不一致。
- `zh-HK` 被规则 `/^zh/` 收成 `zh-CN`，因此香港看到简体和人民币估算，没有港币，也没有繁体。`de-DE`、`fr-FR`、`en-GB`、`en-SG` 都落到英文和美元。页面没有这些地区的语言、货币或税额。
- 证据：`docs/test-artifacts/desktop-zh-cn.png`、`desktop-zh-hk.png`、`desktop-de-de.png`。这是 Chrome 无头加语言覆写，不是当地网络。

### 中：360 CSS 像素宽有轻微横向溢出

Chrome 无头把视口设为 360×800 时，`scrollWidth - clientWidth` 为 16。320×700 为 4。1440 和 390 为 0。只在模拟视口里测到，没有用真机复核。

## 地区与设备矩阵

分类含义：

- **线上 Chrome**：本机真实 Google Chrome 打开 `polaris-ai.work`。出口是美国。
- **Chrome 无头模拟**：Chrome 156 无头，改视口、`navigator.language` 和时区。不是 Safari，不是真机，不是当地网络。
- **NOT RUN**：没有对应浏览器或真机。
- **NOT VERIFIED**：没有该地区出口，也没有当地发卡。

| 场景 | 环境 | 价格与条款 | 结果 |
| --- | --- | --- | --- |
| 美国桌面 | 线上 Chrome，en | `$12.90`，USD，一次性，永久 | PASS 展示。浮动按钮重叠见高优先级缺陷 |
| 简体桌面 | 线上 Chrome，zh-CN | `US$12.90`，`约 ¥93`，并写明以实际扣款为准 | PASS 扣款货币仍是美元。估算行见中优先级缺陷 |
| 手机宽 390 | 线上 Chrome 设备模式，en | `$12.90`，Free/Pro 上下排列 | PASS 展示。Get Pro 在首屏下，且被浮动按钮挡住 |
| zh-CN / zh-HK / de-DE / fr-FR / en-GB / en-SG 桌面 | Chrome 无头模拟 | 中文两档都是 `US$12.90` + `约 ¥93`；其余是 `$12.90` + USD | PASS 没有改成当地货币。当地语言、税、当地卡 NOT VERIFIED |
| 390 / 360 / 320 | Chrome 无头 + touch | 价格同上 | 390 无横向溢出。360 溢出 16px，320 溢出 4px |
| 取消回跳 | 本地快照，390 | 「Checkout canceled. You have not been charged.」邮箱框 `min-height: 44px` | PASS 页面本身。线上根路径仍是 404 |
| 伪造成功回跳 | 本地快照，zh-CN，无 claim | 中文「请回到 Polaris」，没有许可证 | PASS |
| 付款成功版式 | 本地快照注入假密钥 `FIXTURE-NOT-A-LICENSE` | 要求安装 Chrome / Edge / Firefox，再到 Polaris 设置兑换；同一密钥用于各设备 | PASS：不表示手机会装上扩展。真机键盘 NOT VERIFIED |
| Stripe 结账页 | 线上测试会话，美国出口，未输入卡 | Sandbox 标记，`$12.90`。可见 Apple Pay、Link、Card。国家默认 United States。未见支付宝、微信、Google Pay | 只证明这个出口下的展示。不能外推其他国家，也不能说这些钱包扣款成功 |
| 真实 Safari / Edge / Firefox | 本机没有这些浏览器 | — | NOT RUN |
| 真 iPhone Safari、真 Android | 没有真机 | WebKit 模拟未做，也不等于 Safari | NOT RUN |
| 中国、香港、德国、法国、英国、新加坡出口与当地卡、3DS、拒付 | 只有美国出口 | — | NOT VERIFIED / NOT RUN |
| 税额 | 静态页和这次未付款的 Checkout 都没有给出其他币种税额 | — | NOT VERIFIED |

移动购买后的激活路径以页面文案为准：在电脑上的 Chrome、Edge 或 Firefox 安装扩展，打开 Polaris → 设置 → 兑换许可证。页面没有 App Store 或 Play 商店链接。

## 线上只读与一次测试会话

没有压测线上，也没有对 Stripe 做并发。Polaris 线上请求远低于 60 次、1 req/s 的上限。

| 检查 | 结果 | 类别 |
| --- | --- | --- |
| `GET /health` | 200，`env=test`，`version=0.1.3` | 线上只读 |
| 错误套餐 / 金额 1200 / 无 Origin / 坏 JSON | 400 `invalid_plan`、409 `price_changed`、403 `origin_required`、400 `invalid_json` | 线上测试 Worker，未创建会话 |
| 伪造 claim | 401 `invalid_claim`，响应只有错误码 | 线上 |
| 错误 Origin | 403 `origin_not_allowed` | 线上 |
| 一次 `POST /api/checkout/web-session` | 200，金额 1290，跳转主机 `checkout.stripe.com`，会话为 `cs_test_` | 沙箱，未付款 |
| 成功 / 拒付 / 3DS 卡支付 | 未输入任何卡 | NOT RUN |

## 本地夹具

Worker 包、内存版 SQLite、假的 Stripe。不访问 `api.stripe.com`，不发邮件。这不是 Cloudflare 或生产容量。

运行时：Node v22.23.4，4 vCPU Intel Xeon，约 16 GB 内存。百分位用 nearest-rank（`ceil(p*n)-1`）。

同一 IP 连续 35 次创建结账：30 次 200，5 次 429，与每分钟 30 次的限制一致。

| 并发 | 请求 | 耗时 ms | 吞吐 req/s | 错误 % | p50 ms | p95 ms | p99 ms | 许可证 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 6.2 | 161.29 | 0 | 6.16 | 6.16 | 6.16 | 1/1 |
| 5 | 5 | 9.6 | 520.90 | 0 | 9.18 | 9.48 | 9.48 | 5/5 |
| 10 | 10 | 15.1 | 661.92 | 0 | 14.42 | 15.02 | 15.02 | 10/10 |
| 25 | 25 | 34.5 | 725.65 | 0 | 32.47 | 33.72 | 34.03 | 25/25 |
| 50 | 50 | 64.5 | 774.93 | 0 | 47.51 | 62.62 | 63.65 | 50/50 |
| 100 | 100 | 168.3 | 594.09 | 0 | 102.48 | 164.47 | 166.34 | 100/100 |

同一会话的 50 个并发重复 webhook：50 次 HTTP 200，许可证 1 张。邮件发送次数 0。

本地功能 15 项通过，包括：未付款不发证、失败后再异步成功只发一张、伪造 claim 401、金额不符不发证、坏签名和 `livemode: true` 被拒绝、扩展价 1290/1999、恢复接口对有无购买返回同一句话。

## 计数

| 类别 | 通过 | 失败 | 阻塞 | 未跑 |
| --- | --- | --- | --- | --- |
| 本地自动化（功能 15 + 负载 1 + 矩阵断言 2） | 18 | 0 | 0 | 0 |
| 线上只读 / 一次沙箱会话 | 8 | 1（回跳 404） | 0 | 3（成功卡、拒付卡、3DS） |
| 地区与设备展示 | 14 个模拟或线上 Chrome 场景价格保持美元 | 1（浮动按钮压住购买） | 0 | 真实 Safari、Edge、Firefox、真机，以及非美国出口 |

仓库原有部署测试在本机最初因缺少 `rsync` 退出 127。装上 `rsync` 后该测试通过。这不是本次购买改动引入的。

## 仍未测试

真实 Safari、Edge、Firefox；真 iPhone 与真 Android；非美国网络下的支付方式、税和 3DS；沙箱成功、拒付和 3DS 的完整付款；线上双击（避免再创建会话）；生产或 Cloudflare 容量。本地吞吐不能当成线上容量。

重跑：`node --test --test-concurrency=1 test/billing-functional.test.js test/billing-load.test.js test/billing-matrix.test.js`。截图脚本：`node test/billing/capture-matrix.mjs`。
