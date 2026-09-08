# Changelog

## 2026-09-08

- 体验：顶部 Download 改为平滑滚动到安装区域，并将本地安装说明简化为四步操作。
- 功能：接入阿里云 SLS WebTracking，记录 UTM 到达 landing page 和本地 ZIP 下载事件，并通过 STS 临时凭证发送。
- 部署：完成 `cn-hangzhou` 生产 SLS、RAM 和 FC 配置，并将 STS 接口地址写入 landing page。
- 功能：新增 Polaris 本地 ZIP 安装和 Chrome Web Store 安装入口，并提供四步本地安装说明。
- 功能：landing homepage 支持英语和简体中文切换，首次访问跟随浏览器语言，用户选择保存到浏览器本地。
- 设计：参考 Readmate 的宽版透明导航，将 Download 设为 header 主按钮，保留其他入口为次级链接。
- 资源：新增当前 `Polaris-for-Web-0.48.3-build-196.zip` 离线安装包。
- 部署：新增 GitHub Actions Pages 部署流程，`main` 分支更新后自动发布 landing page。
