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
