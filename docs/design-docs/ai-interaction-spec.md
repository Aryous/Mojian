---
status: review
author: design
date: 2026-03-27
blocks: [feature]
open_questions: 3
---

# 墨灵交互模型重设计

> AI 简历助手的 UX 规范。本文档定义交互模型、prompt 架构、UI 形态的一致性方案。
> 权威约束：设计实现须遵循 `design-spec.md`。

---

## 0. 诊断：当前系统的三重断裂

### 0.1 Critique: 交互模型审计

对现有 AI 抽屉进行全面 UX 审计，识别出三处"承诺-兑现"断裂——UI 向用户承诺了某种能力，但底层无法兑现。

**断裂 1: 聊天 UI 承诺对话能力，实际是无状态工具**

| 维度 | UI 承诺 | 系统实际 |
|---|---|---|
| 视觉形态 | 聊天气泡（`.msg` / `.msgUser` / `.msgAi`），上下文滚动容器 | `optimize.ts` 每次 API 调用仅发 system + user 两条消息 |
| 用户预期 | "把刚才的再简洁一点" 应该能工作 | AI 不知道"刚才"是什么 |
| 消息列表 | `messages` state 保留了聊天记录 | 纯装饰——不传给 API，不影响结果 |

这是最严重的断裂：用户看到聊天界面，自然建立"对话"心智模型，然后发现 AI 没有记忆。信任一旦破裂很难修复。

**断裂 2: 自由输入框承诺开放能力，实际被优化框架限死**

| 维度 | UI 承诺 | 系统实际 |
|---|---|---|
| Placeholder | "告诉墨灵你想怎么优化..." | 合理预期：写任何指令 |
| Suggestion chips | "改写简介"、"STAR 法则"、"翻译英文" | 暗示 AI 能做超出四个快捷操作的事 |
| 实际执行 | 自由输入 + chips 全部硬编码 `optionId: 'polish'` | 无论用户写什么，system prompt 都是"润色"专用 prompt |

用户写"帮我把工作经历翻译成英文"→ AI 收到的 system prompt 是"你是一位资深简历撰写顾问，精通动词层级体系和黄金句式"→ AI 试图润色而非翻译。

**断裂 3: 快捷操作只有"优化"，无"生成"能力**

| 场景 | 用户期望 | 系统行为 |
|---|---|---|
| 空简历点"润色全文" | 帮我写一份简历 | "保留原始信息，不添加虚假内容"——无事可做 |
| 空 section 点 section 墨灵按钮 | 帮我写这个模块 | AI 收到空 JSON 数组，优化空数据 |
| 自由输入"帮我写一份完整简历" | 生成内容 | 用"润色"prompt 处理，只能在现有内容上微调 |

这暴露了一个根本性问题：当前 prompt 架构假设简历已有内容，但产品的第一个用户场景就是"从空白开始"。

### 0.2 根因分析

三个断裂有同一个根因：**交互模型、prompt 架构、UI 形态三者独立演进，没有统一的概念框架**。

- UI 走了"聊天"方向（气泡、输入框、chips）
- Prompt 走了"工具"方向（固定 system prompt、无上下文）
- Config 走了"预设选项"方向（4 个 option，1 个 systemPrompt）

修复方案不是补丁——给聊天加历史、给输入加路由——而是重新定义"墨灵是什么"。

---

## 1. 重设计方案：命令式工具 + 智能路由

### 1.1 核心决策：墨灵不是聊天机器人

**定义**：墨灵是一个**命令式简历工具**——用户下达指令，墨灵执行一次，交付结果。

**不是什么**：
- 不是聊天机器人（无多轮对话，无记忆）
- 不是通用 AI 助手（只做简历相关的事）
- 不是实时协作伙伴（命令-执行-确认，三步完成）

**为什么选命令式而非对话式**：

| 维度 | 对话式 | 命令式（选择） |
|---|---|---|
| Token 成本 | 每轮携带完整历史，成本线性增长 | 每次独立调用，成本恒定 |
| 实现复杂度 | 需管理会话状态、上下文窗口、截断策略 | 无状态，当前系统架构已支持 |
| 用户 API Key | 用户自付费，多轮对话成本敏感 | 单次调用，成本可预测 |
| 简历编辑场景 | 多数操作是"做一件事"而非"多轮讨论" | 天然匹配 |
| v1 复杂度 | 过度设计 | YAGNI 友好 |

这不排斥未来升级为对话式——但 v1 的正确选择是诚实的命令式工具。

### 1.2 交互模型：三通道输入

用户通过三个通道向墨灵下达指令，每个通道有不同的 specificity level：

```
通道 1: 快捷操作        → 高确定性，零思考成本
通道 2: Suggestion Chips → 中确定性，启发式
通道 3: 自由文本输入     → 零确定性，完全开放
```

**通道 1: 快捷操作（保留，微调）**

现有 4 个快捷操作保留不变（润色/量化/精简/匹配），它们的语义明确，各有专用 system prompt，这是正确的设计。

变更：
- 快捷操作按钮上标注"需要简历有内容"的前置条件提示——当目标 section 为空时，按钮 disabled 并显示原因

**通道 2: Suggestion Chips（重设计）**

当前 chips 全部硬编码 `optionId: 'polish'`，这是断裂的核心。

新方案：Chips 成为**上下文感知的动态建议**，根据当前简历状态生成：

| 简历状态 | 生成的 Chips |
|---|---|
| 完全空白 | "从零生成简历" / "导入现有内容" |
| 有 personal 但 work 为空 | "生成工作经历" / "补充项目经验" |
| 所有 section 有内容 | "STAR 法则重写" / "翻译英文" / "适配岗位" |
| 从 section 墨灵按钮进入 + section 为空 | "生成{section名}内容" |
| 从 section 墨灵按钮进入 + section 有内容 | "润色{section名}" / "精简{section名}" |

实现方式：纯前端逻辑，不调用 AI。根据 `resume` 数据和 `targetSection` 计算当前应显示哪些 chips。

**通道 3: 自由文本输入（重设计 prompt 路由）**

这是最关键的变更。当前所有自由输入都走 `polish` prompt，新方案引入 **prompt 路由器**：

```
用户输入 → prompt 路由器 → 选择最匹配的 system prompt → API 调用
```

路由规则（纯前端，关键词 + 默认回退）：

| 关键词模式 | 路由到 | System prompt |
|---|---|---|
| 润色/改写/优化表述/更专业 | `polish` | 现有润色 prompt |
| 量化/数据/指标/数字 | `quantify` | 现有量化 prompt |
| 精简/删减/缩短/太长 | `concise` | 现有精简 prompt |
| 匹配/岗位/JD/应聘/投递 | `match-job` | 现有匹配 prompt |
| 翻译/英文/英语/translate | `translate`（新增） | 翻译专用 prompt |
| 生成/写/创建/帮我写/从零 | `generate`（新增） | 生成专用 prompt |
| 无匹配 | `general`（新增） | 通用助手 prompt |

**为什么前端路由而非让 AI 自己判断意图？**
- 用户自付 token。意图识别需要额外 API 调用或更长的 system prompt，增加成本。
- 专用 prompt 的质量远高于"万能 prompt"。润色/量化/精简三个现有 prompt 的提示词工程质量很高——它们有动词层级体系、量化四维度、密度法则等专业框架。一个通用 prompt 无法承载这些。
- 前端路由延迟为零。不需要等 AI 判断意图后再执行。

### 1.3 新增 Prompt 定义

**`generate` prompt**（填补冷启动缺口）：

```
你是一位资深简历撰写顾问。你的任务是根据用户提供的信息，生成专业的简历内容。

## 核心原则

生成内容必须基于用户提供的背景信息。如果用户没有提供足够信息，
主动使用占位符标记（如 [请补充公司名]、[X年]），绝不编造具体事实。

## 生成策略

- 使用强动词开头，遵循"[动词] + [做了什么] + [方法/工具] + [结果]"的黄金句式
- 每条经历 2-4 个要点，控制信息密度
- 用 [X%]、[N个] 等占位符标记缺失的量化数据
- 输出结构与目标 section 的 JSON schema 一致

## 输出要求

- 必须输出合法 JSON
- 占位符用中括号标记，便于用户识别和替换
```

**`translate` prompt**（覆盖翻译场景）：

```
你是一位精通中英双语的简历翻译专家。你的任务是将简历内容翻译为目标语言。

## 核心原则

- 翻译不是逐字对照，是重新表达。英文简历的表述习惯与中文不同。
- 英文简历用 past tense 描述已结束的工作，present tense 描述当前工作。
- 保留专有名词（公司名、学校名）的官方英文名，无官方译名时保留中文并附注。

## 翻译策略

- 中文的"负责"→ 用具体动词（Led, Managed, Developed, Designed）
- 中文的"参与"→ Collaborated on, Contributed to
- 量化数据保留，单位适配（万→K, 亿→B）
- 技术名词用行业标准英文术语

## 输出要求

- 输出合法 JSON，字段结构与输入一致
- 仅翻译文本内容，不修改日期格式或结构
```

**`general` prompt**（兜底，不限制操作类型）：

```
你是墨灵，一个专业的 AI 简历助手。你的任务是根据用户的指令修改简历内容。

## 核心原则

- 严格按照用户指令执行，不做超出指令范围的修改
- 保留未被指令涉及的内容
- 如果指令不清晰，按最合理的理解执行，并在有歧义的地方保持保守

## 输出要求

- 输出合法 JSON
- 仅返回被修改的 section
```

### 1.4 UI 形态：命令面板替代聊天界面

**核心变更：去掉聊天气泡，改为命令面板（Command Panel）形态。**

命令面板的心智模型是"发指令 → 看结果"，而非"持续对话"。这与底层的无状态 API 调用完全一致。

**布局结构（从上到下）**：

```
┌─────────────────────────────────┐
│ 墨灵                        [X] │  ← Header
├─────────────────────────────────┤
│ [API Key 状态栏]                │  ← 仅在已配置时显示小条
├─────────────────────────────────┤
│                                 │
│  ┌───────┐ ┌───────┐           │
│  │ 润 色 │ │ 量 化 │           │
│  │       │ │       │           │  ← 快捷操作 (2x2 grid)
│  ├───────┤ ├───────┤           │
│  │ 精 简 │ │ 匹 配 │           │
│  │       │ │       │           │
│  └───────┘ └───────┘           │
│                                 │
│  [改写简介] [STAR法则] [翻译]   │  ← 动态 Chips
│                                 │
├─────────────────────────────────┤  ← 分隔线
│                                 │
│  【结果区域 / 空态】             │  ← Diff view 或 引导文案
│                                 │
├─────────────────────────────────┤
│  [自由输入...            ] [发] │  ← 输入栏（底部固定）
└─────────────────────────────────┘
```

**关键 UI 决策**：

1. **去掉聊天气泡**。用户消息不再以气泡形式显示。发送指令后，指令文本显示在结果区域顶部作为上下文标签（"你的指令：帮我用 STAR 法则重写工作经历"），而不是聊天气泡。

2. **结果区域**取代聊天滚动容器。有三种状态：
   - 空态：引导文案 + 当前简历状态提示
   - 加载态：墨水晕染动画 + 当前执行的操作描述
   - 结果态：Diff 对比视图（保留现有 diff 组件）

3. **操作历史**（可选，不是聊天历史）。在结果区域上方显示最近 N 次操作的折叠列表（"润色全文 → 已采纳" / "量化成果 → 已放弃"），纯本地状态，不传给 API。这给用户"有记忆"的感觉，但不增加 token 成本。

4. **Placeholder 动态化**。输入框的 placeholder 根据上下文变化：
   - 全文模式："告诉墨灵你想做什么..."（承诺开放，不限"优化"）
   - Section 模式："对{section名}的修改指令..."
   - 空简历："描述你的背景，墨灵帮你生成简历..."

### 1.5 空态设计：冷启动引导

空态是用户的第一印象，不能是"点击快捷操作或输入你的需求"这样的被动文案。

**空简历 + AI 面板空态**：

```
┌─────────────────────────────────┐
│                                 │
│         ╱   ╲                   │
│        │ 墨 │                   │  ← 小墨砚图标
│         ╲   ╱                   │
│                                 │
│   简历还是空白的                  │
│   告诉墨灵你的背景，              │
│   或从快捷操作开始。              │
│                                 │
│  [从零生成简历]  [我要优化现有的]  │  ← 两个主要路径
│                                 │
└─────────────────────────────────┘
```

**有内容 + AI 面板空态**：

```
┌─────────────────────────────────┐
│                                 │
│   选择快捷操作，                  │
│   或在下方输入你的指令。          │
│                                 │
│   当前简历包含：                  │  ← 状态感知
│   3 段工作经历 / 2 段教育        │
│   上次操作：润色全文（已采纳）    │
│                                 │
└─────────────────────────────────┘
```

### 1.6 Section 墨灵按钮的增强

当前 section 墨灵按钮打开 AI 面板并传入 `targetSection`，但面板 UI 没有明确反映"当前聚焦哪个 section"。

**增强**：
- 面板 header 标题变为"墨灵 - {section名}"（如"墨灵 - 工作经历"）
- 快捷操作只展示与当前 section 相关的操作（如 skills section 不需要"量化成果"）
- 添加一个"返回全文模式"的切换，清除 targetSection

---

## 2. 技术变更清单

### 2.1 Config 层变更（`src/config/ai.ts`）

新增 3 个 `AiOptimizeOption`：`generate`、`translate`、`general`。

| 新增 ID | System prompt 要点 |
|---|---|
| `generate` | 基于用户背景生成内容，用占位符标记缺失数据 |
| `translate` | 双语翻译专家，保留专有名词 |
| `general` | 通用助手，严格按指令执行 |

### 2.2 Service 层变更

**新增：`src/service/ai/router.ts`**

```typescript
export function routePrompt(userInput: string): string {
  // 关键词匹配 → 返回 optionId
  // 匹配顺序有优先级，避免歧义
}
```

纯函数，不调用 API，无副作用。可 100% 单元测试覆盖。

**`optimize.ts` 无需变更**——它已经正确地接受 `optionId` 并查找对应的 `systemPrompt`。路由逻辑在调用方（UI/Runtime），不在 service 层。

### 2.3 Runtime 层变更（`aiStore.ts`）

- `optimize()` 的 `optionId` 参数改为可选——如果省略，由 store 调用 `routePrompt(userPrompt)` 自动路由
- 新增 `operationHistory: OperationRecord[]`（本地状态，最多保留 10 条）
- 每次 optimize / acceptResult / rejectResult 后追加记录

### 2.4 UI 层变更（`AiDrawer.tsx`）

**删除**：
- `ChatMessage` interface 和 `messages` state
- 聊天气泡渲染逻辑（`.msg` / `.msgUser` / `.msgAi`）
- 聊天区域滚动容器

**新增**：
- 动态 chips 计算逻辑（`computeSuggestionChips(resume, targetSection)`）
- 空态组件（根据简历状态和 targetSection 渲染不同引导）
- 操作历史折叠列表（可选）
- 指令上下文标签（结果区域顶部显示"你的指令：xxx"）

**修改**：
- `handleSend` 不再硬编码 `optionId: 'polish'`，改为省略 optionId 或调用 router
- `handleChipClick` 根据 chip 类型传递正确的 optionId
- Placeholder 动态化
- Header 标题在 section 模式下显示 section 名

### 2.5 CSS 变更（`AiDrawer.module.css`）

**删除**：`.chat`、`.msg`、`.msgUser`、`.msgAi`、`.chatHint` 聊天相关样式

**新增**：
- `.resultArea`：结果区域容器
- `.emptyState`：空态样式
- `.instructionLabel`：指令上下文标签
- `.historyList`：操作历史折叠列表
- `.sectionBadge`：section 模式下的 header 标记

**保留**：diff 相关样式、API Key 相关样式、快捷操作和 chip 样式（微调）

### 2.6 Token 成本影响

| 变更 | Token 影响 |
|---|---|
| 去掉聊天历史 | 无变化（当前已经不传历史） |
| prompt 路由 | 无变化（仍然一次调用） |
| 新增 generate/translate/general prompt | 单次调用 token 相近，system prompt 长度相似 |
| 动态 chips | 零成本（纯前端计算） |

**结论：Token 成本不变。** 没有引入多轮对话或额外 API 调用。

---

## 3. 不做什么（YAGNI 清单）

以下能力明确排除在 v1 范围外：

| 能力 | 为什么不做 |
|---|---|
| 多轮对话 | Token 成本高，实现复杂，简历编辑场景多数是单次指令 |
| AI 意图识别（服务端） | 需额外 API 调用，增加延迟和成本 |
| 流式输出 | 当前返回结构化 JSON，流式解析 JSON 风险高且价值低 |
| 语音输入 | 桌面端简历编辑，文本输入已足够 |
| AI 记忆跨 session | 用户自付 token，长期记忆存储和检索不在 v1 范围 |
| 自定义 prompt | requirements.md 明确排除（5.1 降低认知负担） |
| prompt 模板市场 | 过度设计 |

---

## 4. 迁移策略

变更范围可控，核心 service 层（optimize.ts / parse.ts / merge.ts / diff.ts / serialize.ts）不需要改动。

**Phase 1**（最小可用）：
1. 新增 3 个 prompt（generate / translate / general）到 `ai.ts`
2. 新增 `router.ts`（prompt 路由器）
3. `AiDrawer.tsx` 去掉聊天气泡，改为结果区域
4. 自由输入走路由而非硬编码 polish

**Phase 2**（体验优化）：
5. 动态 chips（根据简历状态计算）
6. 空态设计（冷启动引导）
7. Section 模式增强（header 标题、操作过滤）

**Phase 3**（可选锦上添花）：
8. 操作历史折叠列表
9. Placeholder 动态化

---

## 5. 视觉规范补充

### 5.1 结果区域

结果区域取代聊天容器，使用相同的 flex-1 + overflow-y: auto 布局。

三种状态的视觉处理：
- **空态**：居中排列，使用 `--obi-text-muted` 色，墨砚图标用 `--obi-seal` 色
- **加载态**：现有 spinner 保留，添加当前操作描述文字
- **结果态**：现有 diff 视图保留不变

### 5.2 指令上下文标签

在结果区域顶部、diff 之前，显示用户的指令文本：

```css
.instructionLabel {
  font-size: var(--font-caption);
  color: var(--obi-text-muted);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--obi-border);
  margin-bottom: var(--space-3);
}
```

格式："你的指令：{userPrompt}" 或 快捷操作名（"润色全文"）。

### 5.3 Section 模式徽章

当从 section 墨灵按钮进入时，header 标题旁显示 section 名称徽章：

```
墨灵  [工作经历]    [X]
```

徽章使用 `--obi-seal` 背景色的 10% 透明度 + `--obi-seal` 文字色，与快捷操作的汉字图标风格一致。

### 5.4 快捷操作的 disabled 态增强

当目标 section 为空时，"优化类"快捷操作（润色/量化/精简/匹配）应被 disabled。

disabled 态不是简单变灰——添加一个 tooltip 说明原因："该模块暂无内容，请先编辑或使用[生成]功能"。

---

## 待人类裁决

### Q1: Prompt 路由的匹配策略
**背景**：前端关键词路由存在歧义场景。用户写"帮我优化成英文简历"——"优化"匹配 polish，"英文"匹配 translate。
**选项**：
- A: 优先级固定排序（translate > generate > polish > quantify > concise > match-job > general），越 specific 越优先
- B: 多关键词加权打分，取最高分
- C: 直接用 general prompt 作为默认，只有 exact match 才路由到专用 prompt
**影响**：A 最简单但可能误判；B 更准但实现复杂度高；C 最保守但浪费了专用 prompt 的质量优势
**阻塞**：feature agent 实现 router.ts

### Q2: 操作历史是否纳入 v1
**背景**：操作历史列表（最近 N 次操作的折叠记录）能给用户"有记忆"的感觉，但它纯粹是装饰性的（不传给 API，不影响结果）。
**选项**：
- A: 纳入 v1，作为 Phase 2 的一部分
- B: 不纳入 v1，v2 再考虑
**影响**：A 增加约 30% 的 UI 开发量；B 面板结果区域会更空，但实现更快
**阻塞**：design agent 阶段 B + feature agent

### Q3: 动态 Chips 的计算逻辑放在哪里
**背景**：动态 chips 需要读取 resume 数据计算当前状态，这个逻辑可以放在 UI 层（组件内 useMemo）或 Runtime 层（aiStore 的 derived state）。
**选项**：
- A: UI 层，`AiDrawer.tsx` 内用 `useMemo` 计算
- B: Runtime 层，aiStore 新增 `getSuggestionChips(resume, targetSection)` selector
**影响**：A 更简单但逻辑和视图耦合；B 更干净但对 aiStore 有侵入
**阻塞**：feature agent 实现 AiDrawer.tsx
