# 项目交接文档

## 项目当前状态

- 项目：AI Diet Partner（AI 健身饮食管理产品）。
- 当前版本：饮食管理 MVP 原型，保持 Next.js + TypeScript + 移动端优先。
- 当前分支：`hermes/round-02`。
- 当前功能提交：`59e862c`（已推送到 GitHub）。
- Pull Request：[#2 feat: build diet planning MVP flows](https://github.com/Felix8686/ai-diet-partner/pull/2)，目标分支 `main`，当前 OPEN，未合并。
- CI：PR 最新提交的 GitHub Actions `build` 已通过。
- ChatGPT 验收状态：**本轮验收修正已完成，等待 ChatGPT 填写下一阶段任务；PR 暂不合并。**
- 当前数据：继续使用 mock data；建档资料与反馈仅保存到浏览器 localStorage，尚未接入真实 AI Provider、Supabase 或第三方服务。
- 可体验入口：
  - `/`：根据本机时间展示早餐、午餐或晚餐，并提供每日反馈入口。
  - `/onboarding`：三步建档，完成后保存资料并进入 `/week`。
  - `/week`：按用户设备本地当前周生成日期，横向日期栏切换周一至周日，查看当前日期的吃什么、场景、准备时间和替换方案。
  - `/shopping`：在“未买 / 已买”两个状态间查看并勾选采购项目。
  - `/feedback`：约 30 秒填写计划执行、零食情况和偏离原因；部分完成/没执行需填写原因，提交后显示确认状态。

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
- 验收修正：新增本地日历工具层，周方案和首页改用设备本地当前周/星期；移除 mock 餐单固定日期字段。
- 反馈修正：localStorage 使用本地日期 key；部分完成/没执行必须填写偏离原因；选择“其他”时填写的文本会随反馈保存。
- 回归覆盖：新增本地日期/当前周和反馈提交规则测试，并修复“其他”输入的 React 事件值读取导致的客户端异常。

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
- `lib/local-calendar.test.ts`
- `lib/local-calendar.ts`
- `lib/feedback-validation.test.ts`
- `lib/feedback-validation.ts`
- `lib/mock-data.ts`
- `package.json`
- `package-lock.json`
- `types/index.ts`
- `docs/HANDOFF.md`

## 验证结果

- 基线：从远端 `hermes/round-02` 最新提交 `1db9e3a` fast-forward 拉取后继续开发；工作树初始干净。
- `npm run lint`：通过（当前实际为 `tsc --noEmit`）。
- `npm test`：通过，9 个测试全部通过（首页时段、本地日历、反馈校验）。
- `npm run build`：通过；Next.js 成功生成 `/`、`/onboarding`、`/week`、`/shopping`、`/feedback`、`/profile` 等静态路由。
- 本地页面核验：生产服务启动后，干净无头 Chrome/CDP 验证周方案默认真实今天、首页当天餐单、反馈原因拦截、“其他”文本保存、采购状态切换，5 项全部 PASS 且无 Console 异常。
- GitHub Actions：PR #2 最新 `build` 检查已通过。
- 页面内容核验：首页、建档、本周方案、采购清单、每日反馈和个人页关键文案均存在；没有引入喝水、步数、久坐、运动打卡、健身训练、卡路里记录或库存管理等偏离 MVP 的功能。
- GitHub：功能代码提交 `59e862c` 已真实存在远端 `hermes/round-02`，PR #2 head 已核对为该提交；PR #2 指向 `main`、状态 OPEN，未执行合并。

## ChatGPT 验收发现

整体方向正确，分支规则、PR、CI、产品边界和主要交互均符合要求，但有 3 个需要在合并前修正的用户可见/数据正确性问题：

1. **“今天”与真实星期/日期不一致。** 当前 `weekPlan` 把 `9/1` 写成周一、`9/2` 写成周二，并且 `/week` 默认把索引 0 标记为“今天”；首页也固定使用 `weekPlan[0]`。例如 2026-09-01 实际是周二，因此现在会把错误的一天当成今天，并展示错误餐单。
2. **每日反馈的日期键使用 UTC 日期。** `/feedback` 使用 `new Date().toISOString().slice(0, 10)` 作为本地反馈日期，在部分本地时区的午夜附近会把反馈保存到前一天或后一天。这里应该按用户设备本地日期计算。
3. **“部分完成 / 没执行”允许不填写任何偏离原因。** 这与产品最核心的“理解为什么没执行”相冲突。完成时可以不填原因；部分完成或没执行时，至少需要一个原因。如果选择“其他”，应出现简短文本输入，让原因真正可用。

这些问题不意味着本轮失败，但属于合并 `main` 前应修正的问题。因此 PR #2 暂不合并。

## 本轮验收修正结果

- 已按上述 3 项验收发现逐项修正，没有扩展 Supabase、AI Provider、地图、食材识别或其他新功能。
- 日期逻辑现在完全基于 `Date` 的本地字段；反馈业务 key 使用 `getLocalDateKey()`，不再通过 UTC 字符串截取。
- 本轮代码已推送到 `hermes/round-02` 并更新 PR #2；等待下一阶段产品/验收任务，不自行合并或继续开发。

## 已知问题 / 技术债

- 当前方案和采购项目仍是 mock data，不会根据建档资料生成真实个性化周计划。
- 建档资料和每日反馈写入 localStorage，但尚未提供资料回读、编辑页或跨设备同步。
- 采购勾选状态只存在当前页面会话，刷新后恢复 mock 初始状态。
- 尚未接入 Supabase、认证、真实 AI Provider、预算计算或外部食材/餐饮数据。
- 当前 `lint` 是 TypeScript 编译检查，仓库仍未配置 ESLint 规则。
- 本轮使用临时 CDP smoke 脚本完成浏览器核验，但没有将完整浏览器 E2E 脚本纳入仓库。

## 已做出的产品决策

- 下一小轮**继续保持 mock data**，暂不接 Supabase 和真实 AI Provider；先把当前 MVP 的时间、日期和反馈语义做正确。
- 三步建档完成后，暂时继续进入 `/week`。按钮本身叫“生成我的第一周方案”，生成后直接看到周方案符合用户预期。
- 周计划从现在开始使用**用户设备本地时间对应的真实当前周**展示日期与“今天”，不再使用固定示例日期。

## 下一阶段任务

等待 ChatGPT 填写下一阶段任务。

## 执行历史

- 2026-09-01：拉取 GitHub `main` 最新代码，确认上一轮基础提交已在 `main`；建立本轮分支 `hermes/round-02`。
- 2026-09-01：完整阅读 `AGENTS.md`、`docs/PRODUCT.md`、现有 `app/`、`components/`、`lib/`、`types/`、`supabase/`；完成基线依赖安装和构建。
- 2026-09-01：先为首页时段规则编写失败测试，再实现首页时段 helper；随后完成本轮 MVP 页面和 mock 数据调整。
- 2026-09-01：通过 `npm run lint`、`npm test`、`npm run build` 及生产路由核验。
- 2026-09-01：创建功能提交 `0511c16`，推送 `hermes/round-02`。
- 2026-09-01：创建 Pull Request #2，目标 `main`，等待 ChatGPT 检查和决定是否合并。
- 2026-09-01：ChatGPT 检查 PR #2、CI、关键页面代码与 `docs/HANDOFF.md`；确认总体方向正确，但发现真实日期/“今天”错位、反馈 UTC 日期键、偏离原因校验三项合并前问题；暂不合并，并写入验收修正任务。
- 2026-09-01：拉取 `hermes/round-02` 最新提交 `1db9e3a`，先为本地日期/当前周和反馈校验编写失败测试，再实现并通过回归测试。
- 2026-09-01：完成日期工具、首页/周方案日期接入、反馈本地日期 key、原因校验和“其他”文本保存；修复“其他”输入触发的 React 客户端异常。
- 2026-09-01：通过 `npm run lint`、`npm test`（9 个测试）、`npm run build` 和干净 Chrome/CDP 页面验收；临时服务与浏览器进程已停止。
- 2026-09-01：创建修正提交 `59e862c` 并推送；确认远端分支和 PR #2 head 均为该提交，PR 保持 OPEN，未合并 `main`；随后 GitHub Actions `build` 通过。
