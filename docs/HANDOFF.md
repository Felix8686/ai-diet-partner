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
- Round 06 已完成并通过验收。
- PR #6 `feat: restore reality data and trial-blocker fixes` 已由 ChatGPT squash merge 到 `main`。
- Round 06 merge commit：`3b05e6cce821160df800d2f5e650fd520c267725`。
- exact-head GitHub CI：PASS。
- Hermes 本地验收：lint PASS；`npm test` 59/59 PASS；build PASS。
- Cloudflare Preview：`https://hermes-round-06.ai-diet-partner.pages.dev`。
- 真实浏览器直连验收未发现新的产品阻断；15:00 与晚餐后时段逻辑已由单元测试覆盖。

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

## 当前部署任务

下一步不是 Round 07 开发，而是把已合并的 Round 06 `main` 部署到 Cloudflare Pages 正式环境。

Hermes 只执行部署：

1. 切到 `main`。
2. `git pull origin main`。
3. 确认 HEAD 至少包含 Round 06 merge commit `3b05e6cce821160df800d2f5e650fd520c267725` 以及本 HANDOFF 文档更新。
4. `npm run build`。
5. 使用已有 Cloudflare Pages 项目 `ai-diet-partner` 部署 **production / main branch**。
6. 必须确认正式地址仍为 `https://ai-diet-partner.pages.dev`。
7. 部署后仅做最小线上检查：首页、onboarding、food-environment、week、shopping、feedback 均可正常打开。
8. 不修改任何产品代码，不创建新功能，不进入 Round 07。
9. 最终只报告 Production 部署 PASS/FAIL、deployment ID、正式 URL、线上路由检查结果。

## 下一阶段

Production 部署确认后，开启 **TRIAL-02**：重新从 Day 1 开始真实 7 天自用，不沿用 TRIAL-01 的测试数据和结论。

TRIAL-02 期间：
- 使用同一台手机、同一个浏览器；
- 使用真实资料、真实常买食材和真实价格；
- 非阻断问题只记录，不连续改代码；
- 若出现会污染试用结论的核心阻断，立即暂停并交回 ChatGPT；
- Day 7 重点判断：系统是否根据一周真实反馈，让下一周方案更符合现实。

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
