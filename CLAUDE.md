# 墨简 (Mojian) — Agent 地图

> 这是一张地图，不是说明书。细节在 docs/ 里。
> Agent 看不到的知识不存在——所有决策必须落库。

---

## 系统目标

**产品目标**：构建一个中古风 AI 驱动的简历编辑器。
**系统目标**：使 Agent 能够自主、可靠地构建和维护这个产品，人类只在意图输入和裁决节点介入。

核心原则见 `docs/design-docs/core-beliefs.md`。

---

## 项目简介

AI 驱动的中古风简历编辑器。核心三件套：
- **Typst 渲染**的多模板简历
- **多 AI 供应商**驱动的智能优化（初始：OpenRouter）
- **中国古风设计系统**（宣纸、墨砚、印章、窗棂、祥云）

---

## 项目阶段

```
阶段 0  意图              人类编写 intent.md                    ✅ 已完成
阶段 1  需求结构化         req-review agent → requirements.md   ⏳ 待执行
阶段 2  技术选型           tech-selection agent → tech-decisions.md
阶段 3  环境搭建           项目初始化 + lint 规则 + CI + 结构测试
         ↑ 阶段 3 不是 Agent 角色，是基础设施。
         ↑ 它的产出是 eslint.config.js、.github/workflows/、tests/structure/
         ↑ 这些代码在每次提交时自动运行，约束所有后续 Agent 的行为。
阶段 4a 设计规范           design agent 阶段A → design-spec.md
阶段 4b 业务开发           design agent 阶段B + feature agent 在约束环境中工作
持续    垃圾收集           doc-gardening agent 扫描漂移
```

---

## 三层约束体系

| 层级 | 机制 | 执行方式 | 能被绕过吗 |
|---|---|---|---|
| **硬约束** | 自定义 lint 规则 + CI 流水线 + 结构测试 | 代码执行，构建失败即阻断 | 不能 |
| **中约束** | `.claude/rules/` | 自动注入 Agent 上下文 | 理论上可以 |
| **软约束** | `docs/` | Agent 需主动读取 | 不读就不知道 |

**原则：当中约束被反复违反时，将其升级为硬约束（lint 规则）。**

---

## 知识地图

### 理解产品意图
```
docs/product-specs/intent.md          ← 原始意图（只读，人类编写）
docs/product-specs/requirements.md    ← 结构化需求（req-review agent 输出）
docs/product-specs/index.md           ← 产品规格索引
```

### 设计系统
```
docs/DESIGN.md                        ← 古风设计系统总纲
docs/design-docs/classical-tokens.md ← 设计令牌定义
docs/design-docs/index.md             ← 设计决策索引
```

### 技术架构
```
ARCHITECTURE.md                       ← 域分层与依赖规则
docs/design-docs/tech-decisions.md   ← 技术选型决策记录
```

### 当前任务
```
docs/exec-plans/active/               ← 进行中的执行计划
docs/exec-plans/completed/            ← 已完成（供参考）
docs/exec-plans/tech-debt-tracker.md ← 技术债追踪
```

### 外部参考
```
docs/references/typst-api.md          ← Typst WASM / CLI 接口
docs/references/openrouter-api.md     ← OpenRouter API 规范
docs/references/design-inspiration.md ← 古风设计参考资料
```

---

## Agent 角色

| Agent | 触发场景 | 输入 | 输出位置 |
|---|---|---|---|
| **req-review** | 新功能意向、需求变更 | intent.md + 对话 | docs/product-specs/ |
| **tech-selection** | 引入新依赖、架构决策 | requirements.md + 候选方案 | docs/design-docs/tech-decisions.md |
| **design(A)** | 设计规范制定 | requirements.md + tech-decisions.md + 网络调研 | docs/design-docs/design-spec.md |
| **design(B)** | UI 组件实现 | design-spec.md (approved) | src/ui/, docs/design-docs/ |
| **feature** | 功能实现 | exec-plan + 架构文档 | src/ |
| **doc-gardening** | 定期运行（扫描漂移） | 全库 docs/ | 修复 PR |

Agent 定义见 `.claude/agents/`。

---

## 链接协议

系统元素之间通过三个协议连接（完整定义见 `.claude/rules/protocols.md`）：

### ⑥ 交接（Agent → Agent）
输出文档带 `status` frontmatter（draft → review → approved）。
下游 Agent 启动前检查输入文档状态，非 `approved` 则拒绝工作。

### ④ 上报（Agent → 人类）
无法自行判断时，在输出文档末尾写"待人类裁决"章节。
每个问题必须给选项、标明阻塞关系。禁止自行假设。

### ⑤ 裁决回注（人类 → 系统）
人类裁决后，决策必须写回对应文档。口头回答不算数。
产品决策 → requirements.md，技术决策 → tech-decisions.md，行为修正 → .claude/rules/。

---

## 人类在系统中的角色

人类不是 Agent，但有明确的触点：

| 触点 | 人类做什么 | 何时发生 |
|---|---|---|
| 意图输入 | 编写 intent.md | 项目启动、需求变更 |
| 审批 | 将文档 status 从 review 改为 approved | 每个 Agent 完成输出后 |
| 裁决 | 回答 Agent 的开放问题，写回文档 | Agent 上报时 |
| 环境搭建 | 确认基础设施（lint/CI）就绪 | 阶段 3 |
| 纠偏 | 发现 Agent 行为偏差时，编码为 rules 或 lint | 持续 |

---

## 反馈循环

系统通过六个反馈循环实现自我纠正（完整图示见 `docs/design-docs/system-flow.md`）：

| 循环 | 触发 | 响应 | 闭合 |
|---|---|---|---|
| **L1 代码质量** | git push | Lint/CI 自动阻断 | 构建通过 |
| **L2 文档鲜度** | 每 5 PR / 阈值 / 阶段转换 | doc-gardening 扫描修复 | QUALITY_SCORE 更新 |
| **L3 质量阈值** | QUALITY_SCORE < 60 | 人类介入，< 40 阻断开发 | 评分恢复 |
| **L4 约束升级** | 同类违规 ≥ 3 次 | docs → rules → lint 逐级升级 | 违规不再出现 |
| **L5 环境进化** | Agent 失败/卡住 | 人类诊断：缺上下文/约束/工具 → 补建 | Agent 重试成功 |
| **L6 用户反馈** | 用户报告 | Bug/需求/UX 分类 → 重入阶段 1-4 | 修复上线 |

**核心原则**：Agent 失败不是"再试一次"，是"环境缺了什么"。

---

## 质量基线

见 `docs/QUALITY_SCORE.md`。
- 总分 ≥ 60：正常开发
- 总分 < 40：**阻断 feature / design agent**，人类必须介入
