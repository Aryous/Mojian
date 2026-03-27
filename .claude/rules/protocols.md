# 系统链接协议

本文件定义系统中所有元素之间的交互规则。所有 Agent 必须遵守。

---

## 协议一：交接协议（Agent → 主控 → Agent）

### 文档状态

每个 Agent 的输出文档必须包含 YAML frontmatter：

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
- `draft` → Agent 正在写，下游禁止消费
- `review` → Agent 写完，等待人类审批
- `approved` → 人类审批通过，主控可执行阻塞门并启动下游

### 溯源表（必须）

每个 Agent 的输出文档必须包含溯源表，列出对上游每个输入条目的处理结果：

```markdown
## 溯源表

| 输入条目 | 处理 | 输出位置 | 备注 |
|---|---|---|---|
| R1.1 富文本编辑 | 已覆盖 | §3.2 组件规范 | — |
| R1.2 撤销/重做 | 显式排除 | — | v1 不含，已上报 Q3 |
| R2.1 Typst 渲染 | 已覆盖 | §4.1 渲染管线 | — |
```

**处理类型**：
- `已覆盖` — 必须标注输出位置，主控会验证该位置确实存在
- `显式排除` — 必须说明原因（如"不在范围内"、"已上报待裁决"）
- `部分覆盖` — 标注已覆盖和未覆盖的部分

**没有溯源表的 Agent 输出视为不合格，主控将退回。**

### 阻塞门

主控（不是 Agent 自己）在每次交接时执行阻塞门检查：

1. 提取上游文档的全部条目 ID
2. 读取 Agent 输出的溯源表
3. 逐条校验：
   - 每个输入 ID 是否出现在溯源表中
   - 「已覆盖」标注的位置是否真实存在对应内容
   - 「显式排除」的理由是否合理
4. **缺失条目 > 0 → FAIL**，退回 Agent 补全
5. **全部通过 → PASS**，更新 `docs/PIPELINE.md`，可启动下游

### 管线门禁定义

| 门 | 上游 → 下游 | 校验内容 |
|---|---|---|
| G1 | intent.md → requirements.md | intent 每个需求点有对应结构化需求条目 |
| G2 | requirements.md → tech-decisions.md | 每个有技术含义的需求有决策记录 |
| G3 | requirements.md → design-spec.md | 每个用户可见需求有设计覆盖 |
| G4 | requirements.md → exec-plan | 每个需求 ID 映射到至少一个计划任务 |
| G5 | exec-plan → code | 每个计划任务已实现，需求验收标准通过 |

### 交接链路

```
intent.md (approved)
  → [G1] req-review → requirements.md (approved)
  → [G2] tech-selection → tech-decisions.md (approved)
  → 环境搭建
  → [G3] design agent 阶段A → design-spec.md (approved)
  → [G4] plan → exec-plan
  → [G5] feature agent → code
```

---

## 协议二：上报协议（Agent → 人类）

Agent 遇到无法自行判断的问题时，在输出文档末尾添加"待人类裁决"章节。

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
- 必须标明阻塞关系
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
- 产品决策 → `docs/product-specs/requirements.md`
- 技术决策 → `docs/design-docs/tech-decisions.md`
- 行为修正 → `.claude/rules/`
- 设计决策 → `docs/design-docs/`

**原则**：Agent 看不到的知识不存在。

---

## 协议四：提交协议（工作完成 → git commit）

每个阶段性工作完成后，**必须立即 commit**。

**commit 前检查**：
1. 相关测试通过
2. Lint 通过（`npm run lint`）
3. 类型检查通过（`npx tsc -b --noEmit`）
4. 需要人类确认才能 commit

**原则**：一个阶段一个 commit。积压变更是技术债。

---

## 协议五：环境进化协议（Agent 失败响应）

Agent 失败时，**禁止简单重试**。诊断：

| 症状 | 诊断 | 修复 |
|---|---|---|
| 输出与预期不符 | 缺上下文 | 补 docs/ |
| 反复同类错误 | 缺约束 | 补 rules/ 或 lint |
| 无法完成任务 | 缺工具 | 补脚本或拆分任务 |
| 产出质量低 | 指令不清晰 | 优化 agent 定义 |

**核心原则**：Agent 失败是环境的信号，不是 Agent 的问题。

---

## 协议六：约束升级协议

同类违规出现 ≥ 3 次，按路径升级：

```
docs/（软约束）→ .claude/rules/（中约束）→ lint 规则（硬约束）
```

约束只升级，不降级。
