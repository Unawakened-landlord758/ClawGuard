# TODO

## 当前阶段

- Alpha / first usable version install-demo
- 当前形态是 OpenClaw 原生插件 + 插件自有 `/plugins/clawguard/*` 页面
- 当前口径仍是：本地安装、unpublished、fake-only、非 GA

## 当前判断

- 项目已经不是纯文档阶段，`src/`、`plugins/openclaw-clawguard/`、`tests/` 都已形成可运行骨架
- 当前最稳定的主链是 `exec`、minimal outbound、minimal workspace mutation
- 当前最稳定的控制面是五个插件页面：
  - `/plugins/clawguard/dashboard`
  - `/plugins/clawguard/checkup`
  - `/plugins/clawguard/approvals`
  - `/plugins/clawguard/audit`
  - `/plugins/clawguard/settings`
- 当前应继续沿“OpenClaw 原生插件优先”推进，不回退到 wrapper / launcher 首宿主路线
- 当前应继续减少插件 runtime 与共享 Core 的重复逻辑，而不是再开一套平行判定链

## 当前验证基线

- [x] `pnpm typecheck`
- [x] `pnpm test`
- [x] 当前本地验证结果：`19` 个测试文件通过，`239` 个测试通过，`1` 个跳过
- [x] install-demo tarball surface 已有集成测试覆盖
- [x] 插件五页 direct-route smoke 已有自动化回归覆盖

## 当前主线

## 路线图

### P0. 当前必须完成

- [ ] 继续扩 `workspace mutation` 主链，优先补宿主 hook coverage、`operation_type` 语义和结果态审计表达
- [ ] 继续扩 `outbound` 主链，优先补 lifecycle closure、route context 和 audit / approval surface 的一致性
- [ ] 持续收紧插件控制面，保持 `dashboard / checkup / approvals / audit / settings` 的 operator flow 一致
- [ ] 每轮有意义改动后更新本文件与 `docs/releases/unreleased/`，把这里当作实时路线图而不是静态备忘

### P1. 当前明确延后

- [ ] 不做 Control UI 左侧 `Security` tab 集成
- [ ] 不做 wrapper / launcher 作为首宿主路线
- [ ] 不做 outbound delivery queue 的 retry / recovery 建模
- [ ] 不做 enterprise 级规则中心、多实例治理、复杂语义层主控

### 并行执行板

- [x] 主线程：已完成本轮控制面收口、TODO / changeset 追平与集成验证
- [x] Sub-agent A：已完成本轮 `workspace mutation` 推进，补了 `edit` 路径引用的保守 rename-like 细化
- [x] Sub-agent B：已完成本轮控制面 handoff 推进，收紧了 dashboard / checkup 对 Approvals / Audit 去向的表达
- [ ] 每完成一轮小闭环后回写本节，标注已完成、搁置和下一步
- [ ] 下一轮并行建议：Workspace 继续补更稳定的结果态细节；控制面继续把 domain breakdown 与 main drag / first-fix 表达进一步对齐

### 近期执行顺序

1. 先继续做 `workspace mutation`，把“能判”补到“能解释、能审计、能回放”。
2. 再继续做 `outbound`，把“能拦”补到“route / title / audit 一致表达”。
3. 同步收口插件控制面，但不单独开新页面战线。
4. 文档和 release posture 跟随更新，不再反向主导开发节奏。

### 1. 扩 workspace mutation 主链

- [ ] 在现有 `write` / `edit` / `apply_patch` 基础上继续补更广宿主 hook
- [x] 已把 `tool_result_persist` 接成 workspace-only 的结果收尾后备面；当前不会改 exec / outbound 的收尾所有权
- [x] 已把 `tool_result_persist` 的最小结构化结果明细接进 workspace audit detail；当前只做保守的 `status / paths` 提取
- [x] 已继续把结构化 workspace 结果摘要前推到 audit closure：当前 `operationType / status / paths` 都会进入 result detail，但宿主缺字段时仍保守回退
- [x] 已继续补 workspace 结果态字段：当宿主显式返回 `created / updated / deleted / renamed` 时，这些字段也会进入最终 audit detail
- [x] 已继续补 workspace 结果态摘要：final audit detail 现在会额外带 `workspace result state=...`，优先使用显式 `operation_type`，否则只在 `created / updated / deleted / renamed` 能稳定归一时才保守推断
- [x] 已把 shared Core 的 `action_title` 持久化进 pending action，workspace live queue 现在能直接显示 `rename-like` / `modify` / `insert` 这类审批标题语义
- [ ] 继续补共享 Core 的 `workspace_context.operation_type` 语义
- [x] 已补一轮更保守的高价值路径规则：`.github/actions`、`.gitlab-ci.yml`、`pyproject.toml`、`docker-compose.yml` 等自动化/工作区配置文件现在会进入 explainable review path
- [x] 已补 `apply_patch` 的保守 hunk 级语义细化：更新型 patch 在“仅新增行”时会收紧为 `insert`，“仅删除行”时会收紧为 `delete`，混合/冲突场景继续回退 `modify`
- [x] 已继续把 `apply_patch` 的 section 级语义往前推：没有显式 `@@` 的纯加/纯删 patch 现在也会保守收紧到 `insert` / `delete`，无结构上下文仍回退 `modify`
- [x] 已继续把 `apply_patch` 的 move-like 语义往前推：当 patch 只包含一个 `Add File` 和一个 `Delete File`，且同名文件仅发生目录搬移时，会保守收紧为 `rename-like`
- [x] 已给 `edit` 增加一条更窄的 rename-like 规则：当 old/new 文本都是明确路径引用，且同文件名只发生目录搬移时，会保守收紧成 `rename-like`
- [ ] 保持低置信场景默认回退 `modify`，不要做激进误判
- [ ] 优先补高价值场景：关键配置、仓库自动化、越界路径、删除/重命名倾向
- [ ] 下一批优先看 `tool_result_persist` 能否继续补稳定的 workspace 结果态字段，但不侵入 exec / outbound 的归档所有权
- [ ] 下一批优先看 `workspace_context.operation_type` 是否还能在低风险前提下细化更多 rename / delete / insert / modify 边界

### 2. 扩 outbound 主链

- [ ] 从当前 `message_sending` hard-block + `message_sent` 收尾，补更完整 lifecycle
- [x] 已收紧宿主级 direct outbound：`message_sending` 命中 `ApproveRequired` 时不再静默放行，而是与 `Block` 一样走 hard-block，避免 host-level 与 tool-level 口径割裂
- [x] 已统一当前插件页面、README 与 runbook 的 outbound 展示语义，明确 host-level direct send 不进入 pending approval loop，tool-level approvals 仍留在 `message` / `sessions_send`
- [x] 已把“fake-only 演示面”和“真实完整 outbound 治理”的边界说明继续收口到 installer strategy / FUV draft 等活跃文档
- [x] 已把宿主级 direct outbound 的 route context 带进 shared Core：`message_sending` 现在会把 `channelId` / `accountId` / `conversationId` / `thread` 统一进 destination explanation 与 approval impact scope
- [x] 已把最小 session delivery context 带进 shared Core：tool-level outbound 在没有显式 `to` 时，也能基于 `channel / to / accountId / threadId` 做 implicit route 风险判断，并区分 `explicit` / `implicit`
- [x] 已把 implicit outbound route 再前推一层到 approval surface：当前审批标题会直接标出 `implicit route`
- [x] 已把 outbound route mode 统一进 approval title、summary、explanation 与 audit replay；当前 explicit / implicit route 都能在控制面看到一致表达
- [x] 已把 tool-level outbound 的 after-tool-call closure 补成 route-aware final detail；当前最终 allowed / failed / blocked 结果会继续带着 `Route mode=explicit|implicit`
- [x] 已把 host-level direct outbound 的 blocked / allowed / failed 审计细节继续收口到 route-aware final detail；当前 `message_sending` / `message_sent` 也会显式带 `Route mode=explicit`
- [ ] 下一批优先补 tool-level outbound 的 lifecycle closure 与 audit expression，但不进入 retry / recovery / queue 建模
- [ ] 下一批优先统一 approvals / audit / dashboard / checkup 中对 outbound lifecycle handoff 的表达方式

### 3. 打磨插件控制面

- [ ] 继续以 `/plugins/clawguard/dashboard` 作为 Alpha 入口
- [x] 本轮已继续收口 approvals / audit 的 operator flow：workspace action title 和 outbound route mode 已能跨页面一致显示
- [x] 本轮已继续收口 dashboard / checkup 的 handoff 表达：现在会更明确地区分 live item 去 `Approvals`，final closure 去 `Audit`
- [x] 本轮已把 approvals / audit 的 boundary 与 handoff 文案继续下沉到共享 helper，减少控制面页面之间的重复漂移点
- [x] 本轮已把 dashboard / checkup 的 install-demo coverage legend 收口成共享矩阵，显式说明 `exec` / `outbound` / `workspace` 三条当前 lane 的真实边界
- [x] 本轮已把 dashboard / checkup 的 live posture 继续拆成最小 domain breakdown，显式显示 `exec` / `outbound` / `workspace` / `other` 的当前混合
- [ ] 保持 dashboard / checkup / approvals / audit / settings 的 operator flow 一致
- [ ] 不把 Control UI 左侧 `Security` tab 当作当前迭代目标
- [ ] 继续把安装提示、限制说明、审计回放表达统一到插件页面

### 4. 收口文档与发布口径

- [x] 把当前 acceptance checklist / FUV draft 中仍活跃使用的 smoke path 统一到五页口径
- [x] 修正文档中的过时测试数字，避免继续引用旧基线
- [ ] 后续每轮有效改动继续补 `docs/releases/unreleased/` 条目

## 本轮发现的文档偏差

- [x] `CLAUDE.md` 之前过长，不符合“索引文件”定位，已压缩
- [x] `docs/v1-acceptance-checklist.md` 的测试数字已更新到当前结果
- [x] 当前仍活跃使用的 acceptance / FUV draft 已从三页 smoke 收敛到五页 direct-route smoke
- [ ] 后续需要再检查中英文 README、插件 README、acceptance checklist、release note 之间的措辞一致性

## 已完成的关键里程碑

### 产品与架构

- [x] 完成市场、竞品、需求、传播与安全方法论文档
- [x] 完成 MVP 信息架构、总体架构、UX 蓝图、低保真原型
- [x] 完成 V1 实现拆分、风险判定流水线、规则包设计、领域模型、运行时时序、测试计划、开发就绪清单
- [x] 完成 north star demo script、初始 backlog、installer demo strategy

### 代码与插件

- [x] 建立共享 Core：领域对象、OpenClaw 适配、风险分类器
- [x] 建立 OpenClaw 原生插件最小可运行形态
- [x] 打通 `before_tool_call` / `after_tool_call` 风险主链
- [x] 打通 `message_sending` / `message_sent` 的最小 outbound 闭环
- [x] 打通 `write` / `edit` / `apply_patch` 的最小 workspace mutation 闭环
- [x] 建立 pending action / allow-once grant / audit record 的最小状态流
- [x] 建立 dashboard / checkup / approvals / audit / settings 五页插件控制面

### 安装与验证

- [x] 固定 install-demo 路径安装口径
- [x] 固定本地 tarball 作为可选本地演示路径
- [x] 修复插件本地安装后运行时入口，切到自包含 `dist/index.js`
- [x] 建立 `pnpm typecheck` + `pnpm test` 验证基线
- [x] 建立 GitHub Actions CI 基线
- [x] 建立 unreleased changeset / release note / announcement 模板

### 对外材料

- [x] 完成仓库 README / README.zh-CN / hero 物料基线
- [x] 完成 BP v0.1、v2.0、HTML 演示稿、设计稿与 partner briefing
- [x] 完成 first usable version 的 release note / announcement / acceptance checklist 草稿

## 待补但不阻塞当前主线

- [ ] 补齐其他合伙人的正式对外介绍
- [ ] 补齐第一轮真实用户 / 社区访谈记录
- [ ] 评估是否补一页面向法务 / 合规合作方的说明页
- [ ] 在下一版 BP 中补更稳健的阶段性推进节奏

## 当前建议执行顺序

1. 先继续扩 `workspace mutation` 主链，优先补宿主结果面与 `operation_type` 语义。
2. 再继续扩 `outbound` 主链，优先补 lifecycle closure 与 route context 的统一展示。
3. 主线程同步收口插件控制面与活跃文档，不单独开新能力面。
4. 更远的 UI 嵌入、Control UI 导航、更广宿主集成继续延后，不在当前 Alpha 收口中分散注意力。
