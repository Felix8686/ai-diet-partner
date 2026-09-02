# 项目交接文档

## 项目当前状态

- 项目：AI Diet Partner。
- 当前阶段：Round 05 云端试用版已部署，等待 ChatGPT 复验并开始首轮 7 天真实自用。
- Round 04 / PR #4 已通过 ChatGPT 复验并 squash 合并到 `main`。
- Round 04 合并提交：`004ab6c6ea46d3dd132be05d2c3564e8cd832d37`。
- PR #4 最终 head：`5e3145133d316dd092c9d58c55241c7caa481f08`；GitHub Actions CI 已通过。
- 当前已形成完整本地闭环：三步建档 → 个性化本周方案 → 采购清单 → 每日反馈 → 根据本周最新反馈生成/更新下周方案。
- 本周与下周方案、采购清单按 `weekStart` 隔离；更新下周方案会保留仍存在采购项的已买状态。
- 当前仍不接 Supabase、认证、真实 AI Provider 或第三方服务；数据保存在当前浏览器 localStorage。

## Round 04 最终验收结论

以下关键能力已通过复验：

- 本周真实日期才显示“今天”，查看下周时不会把下周一误标成今天。
- 下周方案提前生成后，仍可通过“根据最新反馈更新”重新读取本周全部反馈。
- 更新下周方案继续复用同一个 planner，不绕过过敏、禁忌、厨房能力、时间和预算硬约束。
- 本周方案与本周采购状态不会被下周更新覆盖。
- 下周采购清单更新时：仍存在项目保留已买状态；消失项目移除；新增项目默认未买。
- 相同 profile + 相同反馈 + 相同 nextWeekStart 的更新结果稳定。
- Hermes 本地验证：51 项测试、lint、build、最终浏览器 smoke 均通过。
- PR 最终 head 的 GitHub Actions CI 已通过。

## Round 05 完成内容

- 从已合并的最新 `main` 创建 `hermes/round-05`；本轮没有直接修改或提交 GitHub `main`。
- 采用 Cloudflare 官方静态 Next.js 部署路径：Next.js `output: "export"` + `trailingSlash: true`，使用 Cloudflare Pages，不新增数据库、认证或服务端状态。
- Cloudflare Pages 项目：`ai-diet-partner`；生产试用地址：<https://ai-diet-partner.pages.dev>。
- 生产部署记录：部署 ID `09b0aa82-ae2b-4713-b15e-a09cda3df206`，源码提交 `a08fc7d`；同一提交另有 `hermes/round-05` 预览部署 `0fb7e8a5-079f-4f38-90a6-c40f1a319892`。
- “生产部署 Branch: main”是 Wrangler `--branch main` 的 Pages 环境标记，代码来自本分支已推送的 `a08fc7d`，不代表 GitHub `main` 有本轮提交。
- 补齐 PWA manifest 的 `id`、`scope`、192/512 PNG 图标、Apple Web App 元数据；未增加 Service Worker 或复杂离线系统。
- 新增 `docs/TRIAL-01.md`，记录版本、部署地址、开始/结束日期、Day 1–7 真实问题等级和 localStorage 数据丢失提醒。

## Round 05 验证结果

- 本地：`npm install`、`npm run lint`、`npm test`（51/51）、`npm run build` 均通过；静态 `out/` 中的首页、manifest 和两个图标均生成。
- 公开 URL：生产域的 `/`、`/onboarding/`、`/week/`、`/shopping/`、`/feedback/`、`/profile/`、`/manifest.webmanifest`、`/icon-192.png`、`/icon-512.png` 均真实读取 HTTP 200；Pages 项目和 Production/Preview 部署记录已用 Wrangler 读回。
- 手机真实 smoke：在独立临时 Chrome profile 以 390×844 视口打开生产域，完成首次打开 → 三步建档 → 本周方案 → 采购勾选并刷新 → 每日反馈保存并刷新 → 生成下周 → 根据反馈更新下周；页面无全局横向溢出，日期栏横向滚动符合设计，固定导航不遮挡滚动到底的内容，runtime errors 为 0。
- 采购状态和本周/下周方案 key 在真实浏览器 localStorage 中分别保存，刷新后已买状态保持；本次 smoke 生成了本周 `2026-08-31` 和下周 `2026-09-07` 两组数据。

## Round 05 已知限制与运行方式

- 这是公开的静态前端试用版：方案、采购勾选和反馈只保存在当前浏览器 localStorage；清除浏览器数据、无痕模式或更换设备可能丢失全部试用数据。
- 没有登录、云同步、数据库、真实 AI Provider、Service Worker 离线缓存或行为追踪；同一 URL 不代表不同设备共享数据。
- Pages 项目未接 Git 自动构建，发布由已登录 Wrangler 手动执行：`npm run build` 后运行 `npm run deploy -- --branch main` 更新生产域；不要把密钥写入仓库。
- `npm install` 当前报告 2 个依赖审计告警（1 moderate、1 high），本轮未执行可能引入破坏性升级的 `npm audit fix --force`。

## 当前产品边界

继续严格遵守 `AGENTS.md` 与 `docs/PRODUCT.md`：

- MVP 只做饮食管理。
- 前五个大版本禁止加入吉祥物、卡通 IP、拟人角色。
- 不加入喝水、步数、久坐、运动打卡、训练计划等泛健康功能。
- 不做卡路里流水账，不做冰箱库存管理。
- 外卖、食堂、便利店、自己带饭、外食都是正常饮食环境。
- 避免考核式、责备式表达。
- 目前不要接 Supabase、认证、真实 AI Provider、地图/MCP/外部 Agent。

## 下一阶段任务

等待 ChatGPT 复验 Round 05 的 GitHub PR、Cloudflare Pages 公开 URL 和 `docs/TRIAL-01.md`，再决定 7 天真实自用后是否需要产品修正；本分支不继续扩展功能。

## 后续阶段候选（本轮不要做）

- 7 天真实自用后根据真实问题决定下一轮产品修正。
- 正式营养/份量层（goal、年龄、身高、体重）。
- Supabase / 认证 / 云同步。
- 真实 AI Provider。
- 个人食材环境模型与真实价格。
