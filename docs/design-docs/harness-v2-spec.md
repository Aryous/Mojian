---
status: draft
author: claude-controller
date: 2026-03-27
---

# Harness v2 设计规格

## 问题陈述

Harness v1 在墨简项目中暴露了以下系统性缺陷：

1. **溯源是花架子** — trace.sh 只追踪 13 条顶层需求，裁决和走查发现的细粒度条目全在盲区，pre-commit hook 永远绿灯
2. **ID 体系隐性** — R/F/Q/S 四种代号散落在文档中，没有正式定义，agent 和人类对其含义理解不一致
3. **主控角色越界** — CLAUDE.md 说"我是控制器"但没定义边界，实际上主控直接写代码，feature agent 形同虚设
4. **框架与项目耦合** — CLAUDE.md 硬编码了"中古风简历编辑器"，整个 Harness 不可复用
5. **注意力错配** — CLAUDE.md 开头放项目简介（最不需要严格遵守），角色边界（最需要严格遵守）没有明确写
6. **会话协议假设已有项目** — "读 PIPELINE.md → 跑 trace.sh"对空项目不适用，框架不能自举

## 设计原则

- **约束优先于能力** — 告诉 agent 不能做什么比告诉它能做什么更重要
- **机械化优于注意力** — 能用脚本检查的不靠 agent 记住
- **自推导优于手动维护** — trace.sh 从文档结构推导追踪项，不维护单独的清单
- **框架与项目解耦** — CLAUDE.md 是操作系统，project.md 是应用配置
- **注意力感知排序** — LLM 注意力首尾高中间低，最关键的内容放最前面

---

## 1. ID 分类法

| 代号 | 全称 | 定义 | 生命周期 | 可追踪 |
|---|---|---|---|---|
| **R** | Requirement | 顶层需求，定义"要建什么" | 稳定，随产品演进 | ✅ trace.sh 追踪 |
| **F** | Finding | 走查/使用中发现的缺口，定义"缺什么/坏什么" | 发现 → 裁决 → 实现 → 关闭 | ✅ trace.sh 追踪（S0/S1） |
| **Q** | Question | 对 R 或 F 的设计裁决，记录"怎么做的决策" | 提出 → 裁决 → 回注 | ❌ 决策记录，不追踪 |
| **S** | Severity | F 的严重性属性 | F 的属性，不是独立 ID | ❌ 不是 ID |

**关系：**

```
R（要建什么）
  └→ F（缺什么）← 每个 F 有一个 S 等级（S0/S1/S2）
       └→ Q（怎么做）← 裁决记录，关联到 F
```

**规则：**

- 代码中 `@req` 标注只用 R 和 F：`@req R1.1`、`@req F05`
- Q 不出现在代码标注中，仅存在于 requirements.md 的裁决记录
- S 是 F 的属性，trace.sh 根据 S 等级决定是否追踪（S0 + S1 追踪，S2 不追踪）

**F 的状态流转：**

```
发现 → [S 定级] → 待裁决 → [Q 裁决] → 待实现 → [代码 @req] → 已关闭
```

---

## 2. CLAUDE.md 重构

### 2.1 职责定义

CLAUDE.md = **Harness 操作系统**。它定义框架的运行规则，不包含任何项目特定内容。

### 2.2 结构（按注意力优先级排序）

```
CLAUDE.md
│
├─ § 1. 身份与硬边界           ← 注意力最高区
│     角色定义、禁止行为表
│
├─ § 2. 会话协议（自举）        ← 当下该做什么
│     项目状态检测 → 对应起点
│
├─ § 3. 管线协议               ← 核心操作流程
│     阶段定义、门禁机制、dispatch 规则
│
├─ § 4. ID 分类法              ← 简短定义（~10 行）
│     R/F/Q/S 定义和追踪规则
│
├─ § 5. 知识地图               ← 参考性质
│     文件路径索引
│
└─ § 6. 外部引用
      @project.md
      @ARCHITECTURE.md
      protocols.md → .claude/rules/protocols.md
      Agent 定义 → .claude/agents/
```

### 2.3 § 1 身份与硬边界（详细设计）

```markdown
# Harness 主控操作手册

## 身份

你是 Harness 管线的主控（Controller）。你调度 agent、校验产出、维护管线状态。

## 硬边界

| 角色 | 做什么 | 不做什么 |
|---|---|---|
| **主控** | 读 PIPELINE.md、跑 trace.sh、报告状态；与用户对齐方向；为 agent 准备输入；执行阻塞门；裁决回注；协议/环境维护 | **不写 src/ 代码**；不做技术选型；不做设计决策 |
| **Agent** | 按定义执行专项任务；产出带溯源表的文档或代码 | 不自行启动下游；不修改不在职责范围内的文件 |
| **人类** | 编写 intent；审批文档；裁决开放问题；纠偏行为 | — |

**主控写代码的唯一例外**：
- 修改 Harness 框架本身的文件（CLAUDE.md、protocols.md、trace.sh、agent 定义）
- 这些不是项目代码，是框架配置

**违反边界时的处理**：
- 如果用户直接要求主控写代码 → 告知用户应 dispatch feature agent，征得确认后才可直接执行
- 如果主控发现自己在写 src/ 代码 → 停止，评估是否应该 dispatch agent
```

### 2.4 § 2 会话协议（自举）

```markdown
## 会话协议

每次新会话，执行以下自举流程：

### Step 1: 检测项目状态

检查以下文件是否存在：
- project.md
- docs/PIPELINE.md
- docs/product-specs/requirements.md
- src/（任意代码文件）

### Step 2: 根据状态进入起点

| project.md | PIPELINE.md | 起点 |
|---|---|---|
| ❌ | — | 引导用户创建 project.md（项目名称、目标、技术方向） |
| ✅ | ❌ | 初始化 PIPELINE.md，从阶段 0 开始（收集 intent） |
| ✅ | ✅ | 读 PIPELINE.md → 跑 trace.sh → 向用户报告状态和建议 |

### Step 3: 等待用户确认方向

不做任何工作直到用户确认。
```

### 2.5 § 3 管线协议

管线阶段定义从 CLAUDE.md v1 继承，但增加以下变更：

- 门禁 G5 使用升级后的 trace.sh（追踪 R + F）
- dispatch 规则明确：主控准备输入 → 启动 agent → agent 产出 → 主控校验 → 通过则启动下游
- **主控不得跳过 agent 直接实现**

### 2.6 § 4 ID 分类法

直接引用本 spec § 1 的定义，精简为 ~10 行放入 CLAUDE.md。

---

## 3. project.md（新增）

项目特定配置文件，与 CLAUDE.md 解耦。只包含项目身份——知识地图、Agent 角色、管线协议等全是 Harness 框架的一部分，留在 CLAUDE.md 中。

```markdown
# 项目配置

名称：墨简 (Mojian)
目标：AI 驱动的中古风简历编辑器
```

---

## 4. trace.sh 升级

### 4.1 自推导逻辑

trace.sh 不再依赖手动维护的溯源清单。从 requirements.md 自动提取：

1. **R 条目**：匹配 `### X.Y ` 格式的标题（顶层需求）
2. **F 条目**：匹配走查表中 S0/S1 行的 F-ID（格式：`| FXX | S0/S1 |`）

### 4.2 代码标注约定

```typescript
// @req R1.1 — 简历内容编辑
// @req F05 — 撤销/重做
```

Q 不出现在标注中。

### 4.3 走查表格式约定（trace.sh 的输入源）

requirements.md 中的走查发现表必须遵循以下格式，trace.sh 依赖此格式提取 F-ID：

```markdown
| F-ID | 严重性 | 旅程 | 关联需求 | 状态 | 描述 |
|---|---|---|---|---|---|
| F05 | S0 | 编辑 | R1.1 | 待实现 | 撤销/重做 |
```

trace.sh 提取逻辑：
- 匹配 `| F\d+ | S[01] |` 的行
- 提取 F-ID 和描述
- 忽略 S2 行（低优先级，不阻断 commit）

### 4.4 pre-commit hook 行为

- 有 `src/` 文件 staged 时运行 `trace.sh --strict`
- `--strict` 模式：R 或 S0/S1 F 未覆盖 → exit 1 → 阻断 commit
- 仅 `docs/` 文件 staged 时不运行（文档变更不需要代码追踪）

---

## 5. 协议更新

### 5.1 裁决回注协议（协议三）补充

在现有回注步骤后增加：

```
裁决产生代码需求时：
1. 确认对应的 F 条目存在于走查表中
2. 如果 F 不存在（裁决发现了新问题）→ 在走查表中新增 F 条目
3. 确保 F 条目的严重性 ≥ S1（否则 trace.sh 不追踪）
```

**原则**：Q 裁决不直接进入追踪体系。追踪体系只认 R 和 F。如果一个 Q 裁决意味着需要写代码，那一定是因为它在解决某个 F。

### 5.2 交接协议（协议一）补充

溯源表中的需求 ID 改用 R + F 体系：

```markdown
| 计划任务 | 需求 ID | 实现文件 | 状态 |
|---|---|---|---|
| Task 1: 撤销/重做 | F05 | src/runtime/store/undoStore.ts | ✅ |
| Task 2: AI 生成模式 | F01 | src/config/ai.ts | ✅ |
```

---

## 6. Agent 定义更新

所有 agent 需要更新以下内容：

### 6.1 通用变更（所有 agent）

- `@req` 标注约定更新：使用 R + F，不使用 Q
- 溯源表格式更新：需求 ID 列使用 R + F

### 6.2 req-review agent

- 产品走查输出的 F 条目是 trace.sh 的输入源
- 走查表格式必须严格遵循 § 4.3 的格式约定
- 新增职责：确保每个可行动的走查发现都有 F-ID 和 S 定级

### 6.3 feature agent

- `@req` 标注只用 R 和 F，不用 Q
- 示例更新：`// @req F01 — 冷启动 AI 生成`

### 6.4 plan agent（exec-plan 编写）

- 计划任务映射到 R + F，不映射到 Q
- 门禁 G4 校验：每个 R/F 需求至少映射到一个计划任务

### 6.5 design agent

- 设计规范溯源表使用 R + F

---

## 7. 迁移计划（v1 → v2）

### 7.1 文件变更

| 操作 | 文件 | 说明 |
|---|---|---|
| 重写 | `CLAUDE.md` | 按 § 2 结构重组 |
| 新建 | `project.md` | 从 CLAUDE.md 提取项目特定内容 |
| 升级 | `scripts/trace.sh` | 自推导 R + F，干掉手动溯源清单 |
| 更新 | `docs/product-specs/requirements.md` | 顶部加分类法简述；走查表加状态列；删除手动溯源清单 |
| 更新 | `.claude/rules/protocols.md` | 补充 § 5.1 和 § 5.2 |
| 更新 | `.claude/agents/feature.md` | @req 标注约定 R + F |
| 更新 | `.claude/agents/req-review.md` | 走查表格式约定 |
| 更新 | `.claude/agents/design.md` | 溯源表格式 |
| 更新 | `.claude/agents/tech-selection.md` | 溯源表格式 |
| 更新 | `.claude/agents/doc-gardening.md` | 分类法感知 |
| 更新 | `docs/PIPELINE.md` | 溯源矩阵适配 R + F |
| 迁移 | `src/` @req 标注 | Q13→F01, Q14→F04, Q15→F10, Q17→F12 |

### 7.2 @req 标注迁移映射

| 旧标注 | 新标注 | 文件 |
|---|---|---|
| `@req Q13` | `@req F01` | src/config/ai.ts |
| `@req Q14` | `@req F04` | src/service/typst/markdown.ts |
| `@req Q15` | `@req F10` | src/runtime/store/aiStore.ts |
| `@req Q17` | `@req F12` | src/service/ai/optimize.ts |
| `@req F11` | `@req F11` | src/ui/pages/EditorPage/AiDrawer.tsx（不变） |

### 7.3 执行顺序

1. 写 project.md（从 CLAUDE.md 提取）
2. 重写 CLAUDE.md（框架化）
3. 升级 trace.sh（自推导）
4. 更新 requirements.md（走查表格式 + 删除手动溯源清单）
5. 更新 protocols.md
6. 更新 agent 定义（5 个文件）
7. 迁移 src/ @req 标注
8. 更新 PIPELINE.md
9. 验证：trace.sh 输出正确、tsc 通过、vitest 通过
10. commit

---

## 验证标准

- [ ] trace.sh 自动提取 R + F 条目，不依赖手动清单
- [ ] trace.sh 对已实现的 R/F 显示 ✅，未实现的 S0/S1 F 显示 ❌
- [ ] pre-commit hook 在 S0/S1 F 未覆盖时阻断 commit
- [ ] CLAUDE.md 不包含任何项目特定内容
- [ ] project.md 包含所有项目特定配置
- [ ] 代码中无 `@req Q` 标注
- [ ] 所有 agent 定义引用 R + F 标注约定
- [ ] 空项目 + CLAUDE.md 能自举（检测无 project.md → 引导创建）
