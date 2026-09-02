# 项目交接文档

## 固定协作方式

- **ChatGPT 负责产品判断、代码修改、自动测试补充、PR 创建、代码复验与最终合并。**
- **Hermes 不负责自主开发产品代码。** Hermes 负责拉取 ChatGPT 已完成的代码，在用户真实 Windows / Chrome / Cloudflare 环境执行本地验证、浏览器 smoke、Preview / Production 部署，并准确报告结果。
- Hermes 验证失败时：记录复现步骤、错误、日志和环境信息，然后停止；由 ChatGPT 修改代码。
- 用户只需要反馈实际体验或转告验收成功/失败。
- Hermes 永远不得直接 commit / push / merge `main`。

## 当前状态

- 项目：AI Diet Partner。
- TRIAL-01 已提前暂停并保留为 Round 05 的失败试用记录。
- Round 06 已完成、通过验收并正式上线 Production。
- PR #6 `feat: restore reality data and trial-blocker fixes` 已由 ChatGPT squash merge 到 `main`。
- Round 06 merge commit：`3b05e6cce821160df800d2f5e650fd520c267725`。
- Production 部署时 main HEAD：`8bb7e28`。
- exact-head GitHub CI：PASS。
- Hermes 本地验收：lint PASS；`npm test` 59/59 PASS；build PASS。
- Cloudflare Preview：`https://hermes-round-06.ai-diet-partner.pages.dev`。
- Cloudflare Production Deployment ID：`b47d3051`。
- 正式地址：`https://ai-diet-partner.pages.dev`。
- 六个正式线上路由：`/`、`/onboarding/`、`/food-environment/`、`/week/`、`/shopping/`、`/feedback/` 均 PASS。
- TRIAL-02 已于 2026-09-02 正式开始，计划到 2026-09-08 完成 Day 7。

## Round 06 已接受内容

1. 建档目标支持多选，并兼容旧 `goal` localStorage 数据。
2. 新增“我的食材与常见价格”手工录入。
3. 预算逻辑改为用户真实价格优先；缺少真实价格时明确标记“参考估价”。
4. 外食不再用家庭原料价格冒充整餐真实价格。
5. 采购清单改成结构化真实采购数量与单位，不再使用“X 份餐食用量”。
6. 食堂 / 外卖商家提供的原料不进入家庭采购清单。
7. 首页改为真实时间驱动的“下一顿”，去掉时间段与餐别混合 tab。
8. 旧版周方案迁移时，缺少安全元数据的未验证替换方案会被清空。
9. 当前仍保持 localStorage，不接 Supabase / 登录 / 云同步 / LLM / 地图 / OCR。

## 当前阶段：TRIAL-02

现在不进入 Round 07 开发，先完成 Round 06 的 7 天真实自用。

试用规则：

1. Day 1 正式建档前，为避免 TRIAL-01 / Round 05 旧 localStorage 污染，只初始化一次：清除正式站点旧数据，或使用全新浏览器 Profile。
2. Day 1 建档完成后，7 天内不再清除站点数据，不使用无痕模式，并尽量固定同一台手机、同一个浏览器。
3. 使用真实资料、真实常买食材、真实外食 / 食堂价格。
4. 非阻断问题只记录，不在试用中途连续修改产品代码。
5. 若出现会污染试用结论的核心阻断，立即暂停 TRIAL-02 并交回 ChatGPT。
6. Day 7 重点验证：一周真实反馈是否让下一周方案更符合现实。
7. 试用记录写入 `docs/TRIAL-02.md`。

## 当前禁止范围

- Round 07 新功能开发
- 小票 OCR / 货架识别正式实现
- Supabase / 登录 / 云同步
- 真实 AI / LLM Provider
- 地图 / 高德 / 美团 / MCP / 外部 Agent
- 冰箱库存
- 卡路里流水账 / 正式宏量营养处方
- 泛健康功能
- 吉祥物 / 卡通 IP
