# 项目交接文档

## 项目当前状态

- 项目：AI Diet Partner（AI 健身饮食管理产品）。
- 当前版本：饮食管理 MVP 原型，保持 Next.js + TypeScript + 移动端优先。
- 当前分支：`hermes/round-02`。
- 当前代码提交：`0511c16`（已推送到 GitHub）。
- Pull Request：[#2 feat: build diet planning MVP flows](https://github.com/Felix8686/ai-diet-partner/pull/2)，目标分支 `main`，当前 OPEN，未合并。
- 当前数据：继续使用 mock data；建档资料与反馈仅保存到浏览器 localStorage，尚未接入真实 AI Provider、Supabase 或第三方服务。
- 可体验入口：
  - `/`：根据本机时间展示早餐、午餐或晚餐，并提供每日反馈入口。
  - `/onboarding`：三步建档，完成后保存资料并进入 `/week`。
  - `/week`：横向日期栏切换周一至周日，查看当前日期的吃什么、场景、准备时间和替换方案。
  - `/shopping`：在“未买 / 已买”两个状态间查看并勾选采购项目。
  - `/feedback`：约 30 秒填写计划执行、零食情况和偏离原因，提交后显示确认状态。

## 本轮任务

将项目推进到可以在本机完整体验的饮食管理 MVP 原型，完成首页、三步建档、本周方案、采购清单和每日反馈的核心闭环；遵守不加入泛健康提醒、运动计划、卡路里记录器、库存管理或拟人化角色等产品边界。

## 本轮完成内容

- 首页：按时间段（早上 / 中午 / 晚上）聚焦下一顿，分别呈现早餐、午餐、晚餐预览或每日反馈入口；餐卡展示场景、准备时间和替换方案。
- 三步建档：补齐身体与目标、现实生活条件、平时怎么吃三组信息；包含年龄、性别、身高、体重、目标、预算、做饭时间、工作日/周末差异、外食比例、外食场景、喜恶、禁忌、早餐、夜宵、零食、厨房条件和购物地点。
- 本周方案：将 7 天改为可横向滑动的日期栏，只展示当前选中日期；每餐展示吃什么、使用场景、准备时间和替换方案。
- 采购清单：实现“未买 / 已买”状态筛选和勾选切换，不引入库存功能。
- 每日反馈：实现计划执行（完成 / 部分完成 / 没执行）、零食（没有 / 少量 / 比较多）和偏离原因多选，提交后给出无考核感的确认反馈。
- 移动端样式：补充受控表单、焦点态、状态标签、窄屏布局和底部导航适配。
- 测试基础：加入 `tsx --test` 和首页时段规则测试；将原本会启动 ESLint 交互初始化的 `next lint` 脚本改为可自动执行的 TypeScript 检查。

## 修改文件

- `.gitignore`
- `app/feedback/page.tsx`
- `app/globals.css`
- `app/onboarding/page.tsx`
- `app/shopping/page.tsx`
- `app/week/page.tsx`
- `components/home-screen.tsx`
- `lib/home-view.test.ts`
- `lib/home-view.ts`
- `lib/mock-data.ts`
- `package.json`
- `package-lock.json`
- `types/index.ts`
- `docs/HANDOFF.md`

## 验证结果

- 基线：从最新 `main` 拉取后执行 `npm install && npm run build`，通过。
- `npm run lint`：通过（`tsc --noEmit`）。
- `npm test`：通过，3 个首页时段规则测试全部通过。
- `npm run build`：通过；Next.js 成功生成 `/`、`/onboarding`、`/week`、`/shopping`、`/feedback`、`/profile` 等静态路由。
- 生产服务核验：使用 `npm run start -- --hostname 127.0.0.1` 启动后，6 个页面路由均返回 HTTP 200。
- 页面内容核验：首页、建档、本周方案、采购清单、每日反馈和个人页关键文案均存在；禁止的喝水、步数、久坐、运动打卡、健身训练、本周目标、卡路里、库存等产品词未出现在应用页面源码中。
- 预览控件核验：建档字段、7 个日期标签、采购状态、反馈 3+3+7 个选项和提交按钮均能被页面控件清单识别。
- GitHub：功能提交 `0511c16` 已真实存在远端 `hermes/round-02`；PR #2 已创建并指向 `main`，未执行合并。

## 已知问题 / 技术债

- 当前方案、采购项目和日期仍是 mock data，不会根据建档资料生成真实个性化周计划。
- 建档资料和每日反馈写入 localStorage，但尚未提供资料回读、编辑页或跨设备同步。
- 采购勾选状态只存在当前页面会话，刷新后恢复 mock 初始状态。
- 尚未接入 Supabase、认证、真实 AI Provider、预算计算或外部食材/餐饮数据。
- 日期示例固定为 9/1–9/7，尚未切换为真实当前周。
- 当前 `lint` 是 TypeScript 编译检查，仓库仍未配置 ESLint 规则。
- 本轮没有引入完整浏览器 E2E 测试，交互状态主要由 React 受控状态、类型检查、构建和本地页面控件核验覆盖。

## 需要产品决策的问题

- 下一轮是否继续保持 mock data，还是优先设计真实资料/反馈持久化的数据边界？
- 建档完成后的默认落点是否保持在“本周方案”，还是改为直接回到首页查看下一顿？
- 固定示例周是否需要在后续版本切换为用户所在时区的真实当前周？

## 下一阶段任务

等待 ChatGPT 填写下一阶段任务。

## 执行历史

- 2026-09-01：拉取 GitHub `main` 最新代码，确认上一轮基础提交已在 `main`；建立本轮分支 `hermes/round-02`。
- 2026-09-01：完整阅读 `AGENTS.md`、`docs/PRODUCT.md`、现有 `app/`、`components/`、`lib/`、`types/`、`supabase/`；完成基线依赖安装和构建。
- 2026-09-01：先为首页时段规则编写失败测试，再实现首页时段 helper；随后完成本轮 MVP 页面和 mock 数据调整。
- 2026-09-01：通过 `npm run lint`、`npm test`、`npm run build` 及生产路由核验。
- 2026-09-01：创建功能提交 `0511c16`，推送 `hermes/round-02`。
- 2026-09-01：创建 Pull Request #2，目标 `main`，等待 ChatGPT 检查和决定是否合并。
