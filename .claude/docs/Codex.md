但是 CLAUDE.md 写的太隐晦了，需要模型深度推理才能知道，这样不好。还有一个问题，我们的架构目前很脆弱，并且不够简洁优雅，我总觉得我应该把溯源表单独拆分出去，并且溯源表最好也应该是脚本自动维护的

对，你这个判断是对的。

**当前架构脆弱的根因就是：把“给人看的文档”和“给机器读的控制数据”混在一起了。**

现在的问题有三个：

- `CLAUDE.md` 太隐晦，很多关键路由靠推理，不靠显式规则。
- 溯源表嵌在 Markdown 里，脚本只能 scrape，天然脆。
- 文档既承担叙事，又承担控制面，结果两边都不干净。

我的结论很明确：

**溯源表应该拆。**
**而且不该再手写 Markdown 表格。**
**应该改成脚本维护的结构化 sidecar。**

不是拆成一个全局大表。
最优雅的结构是：**每个正式文档旁边放一个 `.trace.yaml` sidecar**。

例如：

- [docs/product-specs/requirements.md](/Users/aryous/Documents/Code/Mojian/docs/product-specs/requirements.md)
- `docs/product-specs/requirements.trace.yaml`

- [`.claude/ARCHITECTURE.md`](/Users/aryous/Documents/Code/Mojian/.claude/ARCHITECTURE.md)
- `.claude/ARCHITECTURE.trace.yaml`

- [docs/tech/tech-decisions.md](/Users/aryous/Documents/Code/Mojian/docs/tech/tech-decisions.md)
- `docs/tech/tech-decisions.trace.yaml`

- [docs/design-docs/design-spec.md](/Users/aryous/Documents/Code/Mojian/docs/design-docs/design-spec.md)
- `docs/design-docs/design-spec.trace.yaml`

- `docs/exec-plans/active/*.md`
- `docs/exec-plans/active/*.trace.yaml`

这样好处很直接：

- 文档继续给人看
- sidecar 专门给脚本读
- 所有权清楚，一个文档配一个 trace 文件
- 不需要再从 Markdown 表格里硬抓

然后再加一个**汇总生成物**：

- `.claude/TRACE_INDEX.yaml`

它不是手写的，是脚本从所有 `*.trace.yaml` 汇总出来的。
主控、doctor、closeout、trace 都优先读这个。

所以新的职责会变成：

**人类/Agent 写正文**
- `requirements.md`
- `tech-decisions.md`
- `design-spec.md`
- `exec-plan.md`

**脚本维护结构化溯源**
- `*.trace.yaml`
- `.claude/TRACE_INDEX.yaml`

**脚本做校验和汇总**
- 检查输入 ID 是否全覆盖
- 检查输出位置是否存在
- 生成 coverage / blockers / unresolved

这才是简洁的。

但有一个真话要先说清：

**“脚本自动维护”不能理解成“脚本自动理解自由文本语义”。**
这个做不到。

能做到的是：

- 自动维护 trace 文件格式
- 自动校验 trace 条目
- 自动生成总索引
- 自动算 coverage
- 自动发现 stale reference

如果你想进一步自动化，应该要求正文里出现**最小标注**，比如 section id 或 `@covers` 标签，然后脚本从这些标注生成 `*.trace.yaml`。

所以最合理的设计不是“完全自动推理”，而是：

**正文提供最小声明，脚本负责结构化、校验、汇总。**

CLAUDE.md 也应该一起瘦身成显式路由，不要再靠深推理。最少要直接写成这种表：

- 问“当前阶段” -> 读 `.claude/STATE.yaml`
- 问“还有哪些需求未完成” -> 读 `requirements.md` + `.claude/TRACE_INDEX.yaml`
- 问“某个文档覆盖了什么” -> 读对应的 `*.trace.yaml`
- 问“为什么不能提交” -> 跑 `closeout.sh`
- 问“为什么被豁免放行” -> 读 `docs/exemptions/*.md`

一句话总结：

**下一版 Harness 应该把叙事文档、状态文件、溯源数据、执行脚本四层彻底分开。**
**你现在最该拆的，就是溯源表。**

trace.yaml 应该如何用脚本维护？脚本的输入源是什么数据？是对应的文档吗？如果是对应的文档。那么我们是否应该规定文档的结构？


对。

**如果 `trace.yaml` 要靠脚本维护，那么输入不能是“自由 prose”，而必须是“文档里的最小结构化声明”。**
否则你只是把脆弱从 Markdown 表格，换成脆弱的自然语言解析。

所以答案分三句：

1. **脚本的主输入源应该是对应文档。**
2. **但不是整篇文档的自由文本，而是文档里一小块可解析的声明。**
3. **因此，文档结构必须规定，但只规定“机器需要的那一层”，不要把整篇正文都模板化。**

---

## 1. `trace.yaml` 应该怎么维护

最合理的是：

- 人写正文
- 文档里放最小声明
- 脚本从声明生成 `*.trace.yaml`
- 再由脚本汇总成全局索引

也就是：

```text
source.md
  -> trace declarations
  -> generate source.trace.yaml
  -> aggregate .claude/TRACE_INDEX.yaml
```

不是手写：
- `## 溯源表`

而是脚本生成：
- `source.trace.yaml`

如果还想给人看，可以再反向渲染出 Markdown 表，但**真相源应该是 yaml，不是表格**。

---

## 2. 脚本的输入源是什么

应该有三层输入。

### A. 对应文档本身
比如：
- `requirements.md`
- `tech-decisions.md`
- `design-spec.md`
- `exec-plan.md`

它提供：
- frontmatter
- 章节结构
- 机器声明块

### B. 上游真相源
比如：
- `requirements.md` 是很多文档的上游
- `tech-decisions.md` 可能以上游 `requirements.md` 为输入
- `exec-plan` 以上游 `requirements.md` / `tech-decisions.md` 为输入

脚本需要读取上游，是为了知道：
**哪些输入 ID 必须被覆盖。**

### C. 当前仓库事实
有些时候要辅助校验：
- heading 是否存在
- section id 是否存在
- code 里有没有 `@req`
- 文件路径是否存在

---

## 3. 文档要不要规定结构

**要。**
而且必须规定。

但不是规定整篇怎么写，
而是规定一小套**机器契约**。

最小够用的结构我建议是这个：

### 必须有 frontmatter
例如：

```yaml
---
status: approved
author: tech-selection
date: 2026-03-28
trace_from:
  - docs/product-specs/requirements.md
---
```

### 必须有稳定 section id
不要只靠“第 3.2 节”这种会漂的文本。
要么用显式 id，要么脚本自动从标题生成 slug。

例如正文里：

```md
## 编辑器布局 {#editor-layout}
```

或者让脚本把 `## 编辑器布局` 规范化成 `editor-layout`。

### 必须有单独的 trace 声明块
这是最关键的。

例如在文档末尾放：

```yaml
trace:
  - input: R1.1
    disposition: covered
    output: editor-layout
  - input: F05
    disposition: covered
    output: undo-redo
  - input: F07
    disposition: excluded
    reason: v1 不做，已上报
```

脚本只解析这一块，不解析整篇 prose。

---

## 4. 推荐的数据模型

### 文档里写的最小声明
放在正文末尾：

```md
## Trace Declarations

```yaml
trace:
  - input: R1.1
    disposition: covered
    output: editor-layout
  - input: F05
    disposition: covered
    output: undo-redo
  - input: F07
    disposition: excluded
    reason: v1 不做
```
```

### 脚本生成的 sidecar
例如 `design-spec.trace.yaml`：

```yaml
document: docs/design-docs/design-spec.md
status: approved
generated_at: 2026-03-28
inputs:
  - R1.1
  - F05
  - F07
entries:
  - input: R1.1
    disposition: covered
    output:
      id: editor-layout
      heading: 编辑器布局
  - input: F05
    disposition: covered
    output:
      id: undo-redo
      heading: 撤销与重做
  - input: F07
    disposition: excluded
    reason: v1 不做
```

### 全局汇总索引
例如 [`.claude/TRACE_INDEX.yaml`](/Users/aryous/Documents/Code/Mojian/.claude/TRACE_INDEX.yaml)：

```yaml
documents:
  - path: docs/design-docs/design-spec.md
    trace: docs/design-docs/design-spec.trace.yaml
  - path: docs/tech/tech-decisions.md
    trace: docs/tech/tech-decisions.trace.yaml

coverage:
  R1.1:
    covered_by:
      - docs/design-docs/design-spec.md#editor-layout
  F05:
    covered_by:
      - docs/design-docs/design-spec.md#undo-redo
  F07:
    excluded_by:
      - docs/design-docs/design-spec.md
```

---

## 5. 为什么不能直接从正文自动理解

因为那会再次变脆。

脚本没法稳定判断：
- “这段是在覆盖 R1.1，还是只是背景”
- “这句算显式排除，还是只是提了一嘴”
- “这个章节到底对应哪个 output 位置”

所以原则必须是：

**语义由人声明，结构由脚本生成。**
不是：
**语义由脚本猜。**

---

## 6. 文档结构应该收多紧

不要把整篇文档都规范死。
只收紧三层：

### 强约束
- frontmatter
- stable heading id
- trace declaration block

### 弱约束
- 章节顺序
- prose 写法
- 表达风格

也就是说：
**约束机器接口，不约束人类写作。**

---

## 7. 最终工作流

### 写文档时
1. 人/Agent 写正文
2. 在文档末尾写 `Trace Declarations`

### 运行脚本时
3. `trace-sync.sh <doc>`
4. 生成 `<doc>.trace.yaml`
5. 校验：
   - 输入 ID 是否合法
   - output id 是否存在
   - disposition 是否合法

### 汇总时
6. `trace-index.sh`
7. 生成 `.claude/TRACE_INDEX.yaml`

### 主控查询时
8. 问“哪些需求未完成”
- 先读 `requirements.md`
- 再读 `.claude/TRACE_INDEX.yaml`
- 不再直接 scrape Markdown 表格

---

## 8. 最后的结论

**是，对应文档应该是输入源。**
**但脚本不该读整篇 prose，而该读文档里的结构化 trace 声明。**
**所以文档结构必须规定，但只规定机器接口，不规定整篇写法。**

最简版本你可以记成：

- 正文：给人看
- `Trace Declarations`：给脚本读
- `*.trace.yaml`：脚本生成
- `TRACE_INDEX.yaml`：主控消费

这套才稳。