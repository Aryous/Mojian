# 系统链接协议

本文件定义系统中所有元素之间的交互规则。所有 Agent 必须遵守。

---

## 协议一：交接协议（Agent → Agent）

每个 Agent 的输出文档必须包含 YAML frontmatter 状态标记：

```yaml
---
status: draft | review | approved
author: agent-name
date: YYYY-MM-DD
blocks: [downstream-agent-1, downstream-agent-2]
open_questions: 0
---
```

**状态流转**：
- `draft` → Agent 正在写，下游 Agent 禁止消费
- `review` → Agent 写完，等待人类审批
- `approved` → 人类审批通过，下游 Agent 可启动

**启动前检查**：每个 Agent 开始工作前，必须读取所有输入文档的 `status` 字段。
如果任一输入不是 `approved`，拒绝工作并说明原因。

**交接链路**：
```
intent.md (approved) → req-review → requirements.md
requirements.md (approved) → tech-selection → tech-decisions.md
tech-decisions.md (approved) → 环境搭建（基础设施）
环境就绪 → design / feature → src/
```

---

## 协议二：上报协议（Agent → 人类）

Agent 遇到无法自行判断的问题时，在输出文档末尾添加"待人类裁决"章节。

**格式**：

```markdown
## 待人类裁决

### Q1: [问题标题]
**背景**：[为什么无法自行判断]
**选项**：
- A: [方案描述]
- B: [方案描述]
**影响**：[不同选项对后续工作的影响]
**阻塞**：[哪个 Agent 或阶段被阻塞]
```

**规则**：
- 每个问题必须给出至少两个选项，不得只抛问题
- 必须标明阻塞关系，让人类知道优先级
- Agent 不得对未裁决的问题自行假设答案

---

## 协议三：裁决回注协议（人类 → 系统）

人类做出裁决后，裁决必须写回文档。口头回答对下一个 Agent 不可见。

**回注格式**：在原问题下方追加：

```markdown
**裁决**：[选择的方案]
**裁决人**：[姓名]
**日期**：[YYYY-MM-DD]
**已回注**：[裁决写入了哪个文件的哪个位置]
```

**回注目标**：
- 产品决策 → 写入 `docs/product-specs/requirements.md`
- 技术决策 → 写入 `docs/design-docs/tech-decisions.md`
- 行为修正 → 写入 `.claude/rules/` 对应文件
- 设计决策 → 写入 `docs/DESIGN.md` 或 `docs/design-docs/`

**原则**：对话中的任何决策，如果未来的 Agent 需要知道，就必须回注。
Agent 看不到的知识不存在。

---

## 协议四：质量阈值协议（QUALITY_SCORE → 行动）

doc-gardening agent 更新 `docs/QUALITY_SCORE.md` 后，所有 Agent 遵守以下规则：

- **总分 ≥ 60**：正常工作
- **总分 40-59**：feature / design agent 继续工作但须在输出中标注质量风险
- **总分 < 40**：feature / design agent 拒绝启动新任务，直到评分恢复

Agent 启动前应读取 QUALITY_SCORE.md 检查总分。

---

## 协议五：约束升级协议

当同类问题重复出现时，按以下路径升级约束层级：

**识别**：doc-gardening agent 或人类审查发现同类违规。
**记录**：写入 `docs/exec-plans/tech-debt-tracker.md`，标注违规次数。
**升级路径**：

```
首次出现 → 补充/更新 docs/（软约束）
第 2 次   → 观察，确认是否为模式
第 3 次   → 升级为 .claude/rules/（中约束）
仍被违反  → 升级为 lint 规则（硬约束）
```

**执行者**：
- docs/ → 中约束：doc-gardening agent 可自行执行
- 中约束 → 硬约束：需人类审批（涉及代码变更）

**约束只升级，不降级。**

---

## 协议六：环境进化协议（Agent 失败响应）

当 Agent 失败或卡住时，**禁止简单重试**。按以下流程诊断：

**第 1 步：分类失败原因**

| 症状 | 诊断 | 修复方向 |
|---|---|---|
| Agent 输出与预期不符 | 缺少上下文 | 补 docs/ |
| Agent 反复犯同一类错 | 缺少约束 | 补 .claude/rules/ 或 lint |
| Agent 无法完成任务 | 缺少工具或能力 | 补脚本、MCP、或拆分任务 |
| Agent 产出质量低 | 指令不够清晰 | 优化 agent 定义 |

**第 2 步：修复环境**

将诊断结果编码回系统（文档/规则/工具），由 Agent 或人类执行。

**第 3 步：重试**

环境修复后，Agent 重试原任务。若再次失败，回到第 1 步。

**核心原则**：Agent 失败是环境的信号，不是 Agent 的问题。
