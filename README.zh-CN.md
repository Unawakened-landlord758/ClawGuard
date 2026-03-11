# ClawGuard / 龙虾卫士

<p align="center">
  <img src="./assets/hero-banner.svg" alt="ClawGuard hero banner" width="100%" />
</p>

<p align="center">
  <strong>OpenClaw 的安全卫士。</strong><br />
  拦危险动作、查 skills、堵泄密、把最后一票还给人。
</p>

<p align="center">
  <a href="./README.md">English</a> ·
   <a href="#用户到底能得到什么">用户价值</a> ·
   <a href="#我们最想让大家记住的-demo-场景">Demo 场景</a> ·
   <a href="#什么时候你会立刻意识到你需要它">为什么现在需要</a>
</p>

## 它是干什么的

`ClawGuard`（龙虾卫士）不是另一个 OpenClaw，也不是一个“更强的 agent”。

它是一个面向 OpenClaw 生态的**安全控制层**：

- 在危险动作执行前要求审批
- 在恶意 skill 安装前做扫描
- 在敏感信息外发前直接阻断
- 在事故发生后留下可解释、可回放的审计记录

一句话：

> **让 OpenClaw 能干活，但不能乱来。**

## 为什么现在就值得关注

OpenClaw 安全焦虑已经不是技术圈内部话题，而是普通人也能秒懂的真实风险：

- 一条群消息诱导 AI 发红包 / 转账
- 一个恶意 skill 读取凭证并外传
- 一个模糊命令导致 AI 批量删文件
- 一次错误集成把 API key、私钥、内部文档暴露出去

我们要做的不是“更复杂的安全平台”，而是先成为：

> **大家一想到 OpenClaw 安全，就会想到的那个项目。**

## 用户到底能得到什么

1. **危险动作审批**
   - 转账 / 支付 / 发红包
   - 发消息 / 发邮件 / 对外发链接
   - 删文件 / 批量改文件
   - 装 skill / 跑 shell / 改配置

2. **风险体检与安全评分**
   - 给实例一个直观的安全分
   - 标出高危项、扣分项和修复建议

3. **基础 skills 验毒**
   - 安装前扫描高危行为
   - 给出风险标签与解释

4. **基础泄密阻断**
   - 拦截 API key、Token、私钥、敏感配置、内部文档外发

## 我们最想让大家记住的 Demo 场景

- **群聊红包攻击被拦截**
- **恶意 skill 安装前被验出**
- **AI 想删文件，被要求审批**
- **AI 想把密钥发出去，被当场阻断**

这几个场景的共同特点只有一个：

**非技术用户也能一眼看懂为什么它重要。**

其中“红包攻击被拦截”是首发主 demo，不是产品能力边界。
ClawGuard 的底层目标是覆盖资金动作、删改文件、skills 安装、敏感信息外发等一整类高风险行为。

## ClawGuard 在使用中的感觉应该是什么

它不该像一个复杂后台，而应该像一个关键时刻会伸手拉住你的安全层：

- AI 要做危险动作时，**先问你**
- skill 看起来可疑时，**先提醒你**
- 敏感信息要外发时，**先拦下来**
- 真出过高风险动作时，**能解释给你看**

这才是首页最该传达的东西。
后面的实现细节、方法论、仓库说明，都应该往下放。

## 方法论骨架

ClawGuard 不是零散功能堆叠，而是想沉淀一套可被反复引用的方法：

- **五层需求模型**：资金 / 数据与隐私 / 执行 / 供应链 / 控制权
- **四大能力域**：Prevent / Approve / Protect / Prove
- **五级防护等级**：Observe / Alert / Approve / Protect / Govern
- **五类检测引擎**：Rule / Semantic / Context / Reputation / Policy
- **六级处置动作**：Log / Warn / Constrain / Approve / Block / Quarantine

详见：[`docs/security-methodology.md`](./docs/security-methodology.md)

## 什么时候你会立刻意识到你需要它

当下面这些事情开始变成真实风险时：

- 一条消息就可能诱导 AI 发红包 / 转账
- 一个 skill 就可能变成供应链后门
- 一次错误外发就可能泄露 key、文档、聊天记录
- 一个模糊命令就可能导致不可逆操作

你就会发现：

> **OpenClaw 不是不能干活，而是不能没人踩刹车。**

## 进一步了解

- [`docs/system-architecture.md`](./docs/system-architecture.md) — 总体平台架构与长期系统设计基线
- [`docs/mvp-information-architecture.md`](./docs/mvp-information-architecture.md) — MVP 信息架构、主流程与原型基线
- [`docs/market-research.md`](./docs/market-research.md) — 市场研究与生态位判断
- [`docs/competitive-analysis.md`](./docs/competitive-analysis.md) — 竞品与错位打法
- [`docs/demand-analysis.md`](./docs/demand-analysis.md) — 用户恐惧与媒体焦点
- [`docs/security-methodology.md`](./docs/security-methodology.md) — 方法论总纲

## 视觉素材计划

我们已经补上了第一版首页视觉资产：

- [`assets/hero-banner.svg`](./assets/hero-banner.svg) — 当前 GitHub 首页头图
- [`assets/nano-banana-prompts.txt`](./assets/nano-banana-prompts.txt) — Nano Banana 出图提示词清单

后续还会继续补：

- 红包攻击拦截场景图
- 恶意 skill 验毒场景图
- 密钥外发阻断场景图
- Open Graph 社媒封面图

## 给开发者 / 维护者看的说明

- [`docs/star-strategy.md`](./docs/star-strategy.md) — 传播与 10k+ star 策略
- [`CLAUDE.md`](./CLAUDE.md) — AI 助手索引

## 当前状态

当前仓库处于**文档驱动阶段**：

- 还没有可运行代码
- 暂无 build / test / lint 命令
- 重点在于打磨品牌、叙事、方法论和 MVP 边界

## 目标

不是先做最大最全的平台。

而是先做出那个让人一眼就想点星的认知：

> **OpenClaw needs an antivirus.**
