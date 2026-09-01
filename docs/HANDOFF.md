# 项目交接文档

## 项目当前状态

- 项目：AI Diet Partner（AI 健身饮食管理产品）。
- 当前版本：饮食管理 MVP 原型，Next.js + TypeScript，移动端优先。
- 当前开发分支：`hermes/round-03`；`main` 保持只读基线。
- PR #2 已通过 ChatGPT 复验并以 squash 方式合并到 `main`。
- 当前 `main` 合并提交：`a966e2f4ca1257c1099221cb9040c511d750ef42`。
- 本轮代码提交：`168a63e`（已推送到 GitHub）。
- Pull Request：[#3 feat: connect local personalized meal planning](https://github.com/Felix8686/ai-diet-partner/pull/3)，目标分支 `main`，当前 OPEN，未合并。
- PR #3 的 GitHub Actions `build` 已触发；交接文档更新时处于 pending，本地验证已通过。
- 当前数据使用本地确定性模板规划引擎和 localStorage，尚未接入 Supabase、认证或真实 AI Provider。
- 当前可体验入口：
  - `/`：按设备本地时间展示当天下一餐。
  - `/onboarding`：三步建档。
  - `/week`：真实当前周日期 + 横向日期切换。
  - `/shopping`：未买 / 已买切换。
  - `/feedback`：约 30 秒每日反馈；部分完成/没执行必须填写原因。

## 已完成的上一轮

- 完成首页按时段聚焦下一顿。
- 完成三步建档并将资料写入 localStorage。
- 完成本周方案、采购清单和每日反馈的主要交互。
- 修正“今天”与真实星期/日期错位问题。
- 反馈日期 key 改为设备本地日期，不再使用 UTC 日期截取。
- 部分完成/没执行时必须填写偏离原因；“其他”支持文本记录。
- `npm run lint`、`npm test`、`npm run build` 均通过；PR CI 通过。

## 本轮任务

完成 Round 03“本地个性化规划引擎 v0”：统一本地数据层，使用有限结构化餐食模板和确定性规则让建档资料真实改变周方案，并打通方案、采购清单、勾选状态和反馈的本地闭环；不接入外部服务。

## 本轮完成内容

- 建立结构化餐食模板池，记录餐别、场景、准备时间、厨房能力、粗略成本、主要食材、标签和替换方案。
- 实现确定性的 `generateWeekPlan(profile, week)`：按厨房能力、工作日制作时间、外食场景、喜欢/讨厌/禁忌、预算和重复度筛选；无法同时满足预算或条件时返回 `rulesCannotSatisfy` 与无责备提示。
- 建立统一 localStorage 数据层，集中管理 profile、当前周方案、采购清单和按日期反馈，并对损坏 JSON 安全回退。
- 打通建档完成后的 profile 保存、周方案生成保存、采购清单派生保存和 `/week` 跳转。
- 首页与周方案读取已保存的当前周方案；采购清单从方案主要食材派生，勾选状态刷新后保持；无方案页面显示建档引导。
- 反馈页改用统一数据层，按本地日期读取和保存每日反馈，为后续调整接口保留数据入口。

## 修改文件

- `app/feedback/page.tsx`
- `app/globals.css`
- `app/onboarding/page.tsx`
- `app/shopping/page.tsx`
- `app/week/page.tsx`
- `components/home-screen.tsx`
- `lib/local-calendar.ts`
- `lib/meal-planner.test.ts`
- `lib/meal-planner.ts`
- `lib/meal-templates.ts`
- `lib/mock-data.ts`
- `lib/shopping-list.test.ts`
- `lib/shopping-list.ts`
- `lib/storage.test.ts`
- `lib/storage.ts`
- `types/index.ts`
- `docs/HANDOFF.md`

## 验证结果

- 基线：从最新 `main` 创建 `hermes/round-03`；`npm install && npm run build` 通过。
- `npm run lint`：通过（当前实际为 `tsc --noEmit`）。
- `npm test`：18 个测试全部通过，覆盖首页时段、本地日期、反馈校验、规划差异、时间/厨房/场景/忌口/预算/稳定性、采购派生和存储回退。
- `npm run build`：通过；Next.js 成功生成全部应用路由。
- 本地浏览器 smoke：清空隔离 localStorage 后真实走通“无方案引导 → 三步建档 → 生成 7 天方案 → 首页/周方案读取 → 采购清单派生 → 勾选并刷新保持 → 反馈保存并刷新回读”，6 项全部 PASS 且无浏览器 Console 异常；临时服务和 Chrome 已停止。
- GitHub：代码提交 `168a63e` 已存在远端 `hermes/round-03`；PR #3 指向 `main`、状态 OPEN、未执行合并。
- 依赖审计：`npm install` 报告既有 2 个漏洞（1 moderate、1 high），本轮未执行破坏性 `npm audit fix --force`。

## 当前产品边界

继续严格遵守 `AGENTS.md` 与 `docs/PRODUCT.md`：

- 当前 MVP 只做饮食管理。
- 前五个大版本禁止加入吉祥物 / 卡通 IP / 拟人角色。
- 不加入喝水、步数、久坐、运动打卡、训练计划等泛健康功能。
- 不做卡路里流水账。
- 不做冰箱库存管理。
- 外卖、食堂、便利店、外食属于正常饮食环境。
- 避免“未达标、还差多少、预计减重”等考核式表达。
- 未经明确任务不得扩展地图、美团/高德、MCP、外部 Agent、真实 AI Provider 等能力。

## 已知问题 / 技术债

- 当前规划引擎是有限本地模板池和确定性规则，不是真实 AI，也没有完整营养计算。
- 预算、场景和食材成本目前是粗略估算，尚未接入个人长期食材环境模型或真实价格。
- profile、当前周方案、采购清单和每日反馈已统一通过本地 storage 层，但仍只存在当前浏览器，尚未跨设备同步。
- 重新完成建档会生成新方案并重置当前周采购清单，尚未支持历史周方案。
- 尚未接入 Supabase、认证、真实 AI Provider、预算计算服务或外部食材/餐饮数据。
- 当前 `lint` 实际为 TypeScript `tsc --noEmit`，尚未配置 ESLint。
- `npm install` 报告 2 个既有依赖漏洞（1 moderate、1 high），本轮未强制升级。

## 已做出的产品决策

- 下一阶段仍然**不接 Supabase、不接真实 AI Provider**。
- 先验证最核心的一件事：**用户建档资料是否能真实改变一周饮食方案。**
- 下一阶段允许使用本地确定性规则和有限餐食模板来实现个性化规划，不追求 AI 文案或复杂营养算法。
- 这一轮的重点不是增加页面，而是让现有闭环从“能点”升级为“数据真的贯通”。

## 需要产品决策的问题

- 本轮没有新增待决产品问题；下一阶段任务由 ChatGPT 填写。

## 下一阶段任务

等待 ChatGPT 填写下一阶段任务。

## 执行历史

- 2026-09-01：建立 MVP 基础代码并合并 PR #1。
- 2026-09-01：Hermes 在 `hermes/round-02` 完成首页、三步建档、本周方案、采购清单、每日反馈及移动端交互。
- 2026-09-01：ChatGPT 首轮验收发现真实日期错位、UTC 反馈日期键、偏离原因校验三项问题，暂缓合并。
- 2026-09-01：Hermes 完成三项验收修正，新增本地日历与反馈校验测试，9 项测试及 CI 通过。
- 2026-09-01：ChatGPT 复验确认三项问题均已解决，PR #2 squash 合并至 `main`，提交 `a966e2f4ca1257c1099221cb9040c511d750ef42`。
- 2026-09-01：ChatGPT 将 Round 03“本地个性化规划引擎 v0”写入本交接文档，等待 Hermes 从最新 `main` 新建 `hermes/round-03` 执行。
- 2026-09-01：确认 PR #2 已 squash 合并到 `main`，拉取最新 `main` 提交 `a3e4634`，新建 `hermes/round-03`。
- 2026-09-01：先为规划差异、约束过滤、预算状态、稳定性、采购派生和存储回退编写失败测试，再实现模板池、确定性规划引擎、统一 storage 与本地闭环。
- 2026-09-01：通过 `npm run lint`、`npm test`（18 个测试）、`npm run build` 和干净 Chrome/CDP 浏览器闭环；临时服务与浏览器进程已停止。
- 2026-09-01：创建代码提交 `168a63e` 并推送 `hermes/round-03`；创建 PR #3，目标 `main`，当前 OPEN、未合并；GitHub Actions `build` 已触发，交接文档更新时 pending。
