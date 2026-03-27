---
status: archived
author: req-review
date: 2026-03-27
source: requirements.md (拆分归档)
---

# 产品走查报告（2026-03-27）

> 由 req-review agent 以用户视角走查四条核心旅程，对照 requirements.md 需求条目与 src/ 实际代码，识别体验断裂和需求缺口。
> 每条发现标注严重性（S0 = 核心链路断裂 / S1 = 功能缺失 / S2 = 体验粗糙），并关联 requirements.md 中的验收标准。

## 旅程 1: 冷启动旅程（首次用户 / 空白简历）

**链路**：Landing Page → "开始创作" → TemplateSelectPage → "确认选择" → EditorPage（空白简历）

### F01 [S0] 空白简历 + AI = 冷启动死胡同

**现象**：新建简历后所有字段为空（`repo/resume.ts` L11-40，personal 全空字符串，education/work/skills/projects 全空数组）。用户点击 AI 快捷操作（如"润色全文"），AI 收到的 JSON 全是空值。AI 无法凭空生成内容，只能返回无意义结果或报错。

**关联需求**：
- 1.1 验收标准"用户可以新建一份空白简历" -- 满足
- 3.1 验收标准"选择一个选项后，AI 在合理时间内返回优化建议" -- 空简历场景下事实上不可用
- 5.1 验收标准"新用户首次使用，从打开应用到产出第一份简历 PDF 的操作路径不超过 5 个主要步骤" -- 冷启动无引导，用户面对全空表单无从下手

**断裂点**：AI 功能只能"优化"不能"生成"。requirements.md 3.1 描述的是"AI 基于当前简历内容和选中选项执行优化"，但没有覆盖简历内容为空的场景。这是需求缺口，不是实现缺陷。

**需求缺口**：requirements.md 缺少以下内容：
- 冷启动引导机制的需求（如示例数据填充、新手引导、AI 从零生成能力）
- AI "生成"模式 vs "优化"模式的区分

### F02 [S1] 简历标题硬编码"未命名简历"，无命名入口

**现象**：`TemplateSelectPage.tsx` L230 硬编码 `title: '未命名简历'`。用户在创建流程中没有命名机会。虽然 EditorPage 的 TopToolbar 支持内联编辑标题，但首次进入时标题已是"未命名简历"，用户可能不会注意到它是可编辑的。

**关联需求**：1.1 验收标准未提及简历命名/重命名。这是需求遗漏。

### F03 [S2] 模板数量 5 个，超出裁决的 3 个

**现象**：`config/templates.ts` 定义了 5 个模板（classic、twocolumn、modern、minimal、academic），但 Q2 裁决为"初始版本 3 个模板（经典单栏、双栏、学术风）"。多了 modern 和 minimal 两个。

**关联需求**：2.2 已裁决"初始版本 3 个模板"。当前实现超出裁决范围，不是缺陷但需要确认是否更新裁决。

---

## 旅程 2: 内容编辑旅程

**链路**：EditorPage 左面板 → 各 section 表单 → 实时预览

### F04 [S0] 富文本编辑完全缺失

**现象**：requirements.md 1.1 边界中明确写"范围内：富文本编辑（加粗、斜体、列表等基础格式）"。实际实现中所有 description 字段使用 `<textarea>`（纯文本），InkInput 组件（`InkInput.tsx`）只支持 `<input>` 和 `<textarea>`，没有任何富文本能力。

**关联需求**：1.1 边界"富文本编辑" -- 完全未实现

**断裂点**：Typst 模板侧也只是直接渲染 description 字符串（无 markdown 解析）。即使用户在 textarea 中写了 markdown 格式文本，渲染结果也只是纯文本。

### F05 [S0] 撤销/重做完全缺失

**现象**：requirements.md 1.1 验收标准"编辑操作支持撤销/重做"。代码中没有任何 undo/redo 实现。搜索 `undo`、`redo`、`history` 无结果。`resumeStore` 是简单的 zustand store，无状态快照栈。

**关联需求**：1.1 验收标准"编辑操作支持撤销/重做" -- 完全未实现

### F06 [S1] 技能等级输入为自由文本，与数据模型不匹配

**现象**：`SectionEditor.tsx` L232-233 技能水平字段使用普通 InkInput（自由文本），placeholder 为"如：精通 / 熟练"。但数据模型 `SkillItem.level` 是枚举类型 `'beginner' | 'intermediate' | 'advanced' | 'expert'`。用户输入"精通"会被存为字符串"精通"，与枚举值不匹配。AI merge 层（`merge.ts` L104-108）会将不合规值回退为 `'intermediate'`。

**体验断裂**：用户输入中文，存储的是英文枚举意义上的兜底值。UI 无法告知用户合法输入是什么。应使用下拉选择器。

### F07 [S1] 自定义模块（custom section）未实现

**现象**：`SectionEditor.tsx` L291 对 `custom` 类型返回 `<div>自定义模块（待实现）</div>`。但 `Resume` 数据模型中有 `custom: Record<string, CustomItem[]>`，创建简历时初始化为空对象，且没有 UI 入口添加 custom section。

**关联需求**：1.1 边界"简历各模块...的创建" -- custom 模块虽存在于数据模型但完全不可用

### F08 [S1] Section 可见性无 UI 控制

**现象**：`ResumeSection` 数据模型有 `visible: boolean` 字段，EditorPage 过滤了 `visible === false` 的 section。但没有任何 UI 允许用户切换 section 的可见性。隐藏的 section 永远不可见，也无法恢复。

**关联需求**：1.1 验收标准"用户可以添加、编辑、删除简历中的每个模块" -- "添加/删除"模块的 UI 缺失。当前只能在已可见的 section 内添加/删除 item。

### F09 [S2] 删除操作无确认

**现象**：
- Dashboard 删除简历：点击 "x" 直接删除，无确认对话框（`DashboardPage.tsx` L174-178）
- Section 内删除 item：点击 "x" 直接删除，无确认（`SectionEditor.tsx` L99-103）

**关联需求**：5.1 验收标准"无需阅读帮助文档即可完成基本操作" -- 虽然没有明确要求删除确认，但无确认的破坏性操作违反降低认知负担的原则。结合 F05（无撤销），误删不可恢复。

---

## 旅程 3: AI 辅助旅程

**链路**：EditorPage → 点击墨灵 FAB / section "墨灵"按钮 → AiDrawer → 快捷操作 / 自由输入 → diff 对比 → 采纳/放弃

### F10 [S0] 聊天 UI 形态 vs 单轮交互的视觉承诺断裂

**现象**：AiDrawer 渲染了完整的聊天界面——消息气泡列表（`messages` state）、滚动区域、用户/AI 消息样式区分、历史消息保留（`ChatMessage[]` 只追加不清除）。但实际上：
- 每次操作都是独立的 API 调用，不携带任何历史上下文
- AI 收到的只有当前简历 JSON + 当前指令，看不到之前的对话
- 消息列表只是 UI 装饰，给用户"多轮对话"的错误暗示

**关联需求**：requirements.md 没有定义 AI 交互形态（聊天式 vs 操作面板式）。这是需求遗漏。

**体验断裂**：用户看到聊天界面，自然预期能追问"刚才那段再简短些"。但 AI 根本不知道"刚才"是什么。

### F11 [S1] Suggestion chips 硬编码 optionId: 'polish'

**现象**：`AiDrawer.tsx` L129 所有 suggestion chips（"改写简介"、"STAR 法则"、"翻译英文"）点击后 `sendOptimize(chip.prompt, 'polish')`，强制使用 `polish` 选项的 system prompt。

**体验断裂**：
- "翻译英文" 使用的 system prompt 是"润色表述"而非翻译指令，AI 收到的系统指令与用户意图矛盾
- "STAR 法则" 更适合配合 `quantify`（量化成果）的 system prompt

**关联需求**：3.1 验收标准"每个选项有直观的名称和简短描述" -- chips 与预设选项的绑定关系未在需求中定义

### F12 [S1] 自由文本输入也硬编码 optionId: 'polish'

**现象**：`AiDrawer.tsx` L137 用户在输入框中输入任意文本后，`handleSend` 调用 `sendOptimize(inputValue, 'polish', targetSection)`，始终使用 `polish` 的 system prompt。

**体验断裂**：用户输入"把工作经历翻译成英文"，但 AI 收到的 system prompt 是"你是一位资深简历撰写顾问，精通动词层级体系和黄金句式"。system prompt 与用户意图冲突，AI 行为不可预测。

**关联需求**：3.1 边界"不在范围内：用户自定义提示词" 与 3.3.2"用户的自由文本指令...必须作为 user message 的一部分传给 AI，不得仅用于关键词匹配" -- 当前实现传递了 userPrompt，但 system prompt 选择逻辑有问题。用户自由输入场景下应该使用通用 system prompt 还是 polish？需求未定义。

### F13 [S1] Quick actions 忽略 targetSection

**现象**：`AiDrawer.tsx` L121 `handleQuickAction` 调用 `sendOptimize(action.prompt, action.key)` 不传 `section` 参数。即使用户通过 section "墨灵"按钮打开 AI 面板（此时 `targetSection` prop 有值），点击快捷操作仍然执行全文优化而非定向优化。

**体验断裂**：用户在"工作经历"section 点击"墨灵"，意图是优化该 section。但点击"润色全文"后，AI 可能修改个人简介而非工作经历。只有自由文本输入才会传递 `targetSection`。

**关联需求**：3.3.2"当用户点击某个 section 的'墨灵'按钮时，需携带目标 section 标识" -- 部分实现，仅自由输入路径携带。

### F14 [S1] Skills section 排除在"墨灵"按钮之外

**现象**：`EditorPage.tsx` L59 `{section.type !== 'skills' && (` 条件判断将 skills section 排除在"墨灵"按钮之外。AI 无法直接优化技能模块。

**关联需求**：requirements.md 未定义哪些 section 支持 AI 优化。AI 的 `buildSystemMessage` 中有 `不要包含 skills（除非用户明确要求）` 的指令，说明 skills 优化是有意限制但原因未在需求中说明。

### F15 [S2] AI 面板无"对话历史"的记忆问题

**现象**：`AiDrawer.tsx` L78 `messages` state 仅存在于组件内存。关闭 AI drawer 再打开，或切换页面后返回，所有聊天记录丢失。结合 F10（本身就是单轮交互），这意味着用户无法追溯之前的 AI 操作历史。

**关联需求**：requirements.md 未定义 AI 操作历史是否需要持久化。

---

## 旅程 4: 模板与导出旅程

**链路**：EditorPage → 切换模板 → 预览更新 → 导出 PDF

### F16 [S2] 模板切换无加载状态提示

**现象**：TemplateDrawer 选择模板后立即关闭。预览区域显示旧模板的 SVG，直到新模板编译完成（600ms 防抖 + 编译时间）才更新。编译期间有"编译中..."badge 但不够醒目。

**关联需求**：2.2 验收标准"用户切换模板时，内容自动适配新模板布局" -- 功能满足但过渡体验不够顺滑

### F17 [S1] PDF 导出无进度反馈

**现象**：`TopToolbar.tsx` 导出按钮在 `exporting` 状态只显示"导出中..."文字。Typst PDF 编译可能需要数秒（首次加载 WASM + 字体），期间没有进度条或预估时间。如果编译失败，错误展示在预览区域（与导出操作的视觉区域不一致）。

**关联需求**：2.3 验收标准"用户可以一键导出当前简历为 PDF 文件" -- 功能满足但失败路径处理不佳

### F18 [S2] 导出的 PDF 文件名固定使用简历标题

**现象**：`previewStore.ts` L82 `a.download = \`${resume.title || '简历'}.pdf\`` -- 如果用户从未修改默认标题，导出的文件名是"未命名简历.pdf"。对于多份简历场景，文件名无法区分。

**关联需求**：2.3 验收标准未定义导出文件命名规则。

---

## 跨旅程系统性问题

### F19 [S1] API Key 明文存储在 localStorage

**现象**：`repo/settings.ts` 使用 `localStorage.setItem` 直接存储 API Key 明文。任何同域脚本或浏览器扩展可以读取。

**关联需求**：3.2 验收标准"API Key 配置入口清晰可达" -- 满足，但安全性未在 requirements.md 中定义。这是约束遗漏。

### F20 [S1] API Key 配置入口隐藏过深

**现象**：用户必须先点击 AI FAB 按钮打开 AI drawer，才能看到 API Key 配置入口。对于新用户来说，他们可能在编辑内容很久之后才发现需要配置 API Key。没有全局设置入口。

**关联需求**：3.2 验收标准"API Key 配置入口清晰可达，操作步骤不超过 3 步" -- 步骤数满足（点击 FAB → 输入 Key → 保存），但"清晰可达"这一点存疑，因为入口隐藏在 AI 面板内。

### F21 [S2] 简历持久化无导入/导出机制

**现象**：简历数据存储在 IndexedDB（Dexie），但没有任何"导出简历数据"或"导入简历数据"的功能。用户更换浏览器或清除数据后，所有简历永久丢失。

**关联需求**：1.2 验收标准"用户关闭浏览器后重新打开，简历数据完整保留" -- 在同一浏览器内满足，但数据迁移场景未覆盖。requirements.md 也未定义此需求。

### F22 [S2] 进度计算过于粗糙

**现象**：`progress.ts` 只检查 5 个条件（personal.name 非空、4 个列表 section 非空），不反映实际填写完成度。用户只填了姓名和一个空工作经历（所有字段为空）也算 2/5。

**关联需求**：requirements.md 未定义进度计算规则。Dashboard 腰封展示进度条，但进度指标不够有意义。

---

## 走查发现汇总

| ID | 严重性 | 旅程 | 关联需求 | 状态 |
|---|---|---|---|---|
| F01 | S0 | 冷启动 | 3.1 / 5.1 | **需求缺口** -- 冷启动/生成场景未定义 |
| F04 | S0 | 编辑 | 1.1 | **未实现** -- 富文本编辑 |
| F05 | S0 | 编辑 | 1.1 | **未实现** -- 撤销/重做 |
| F10 | S0 | AI | 未定义 | **需求缺口** -- AI 交互形态（聊天 vs 面板）未定义 |
| F02 | S1 | 冷启动 | 1.1 | **需求遗漏** -- 简历命名 |
| F06 | S1 | 编辑 | 1.1 | **实现缺陷** -- 技能等级控件 |
| F07 | S1 | 编辑 | 1.1 | **未实现** -- 自定义模块 |
| F08 | S1 | 编辑 | 1.1 | **未实现** -- Section 可见性控制 |
| F09 | S2→S1 | 编辑 | 5.1 | **需求遗漏** -- 删除确认（因 F05 无撤销，升级为 S1） |
| F11 | S1 | AI | 3.1 | **实现缺陷** -- chips 硬编码 optionId |
| F12 | S1 | AI | 3.1 / 3.3.2 | **需求缺口** -- 自由输入场景的 system prompt |
| F13 | S1 | AI | 3.3.2 | **实现缺陷** -- quick actions 忽略 targetSection |
| F14 | S1 | AI | 未定义 | **需确认** -- skills 排除墨灵是否有意 |
| F17 | S1 | 导出 | 2.3 | **体验缺失** -- 导出进度反馈 |
| F19 | S1 | 跨旅程 | 3.2 | **约束遗漏** -- API Key 存储安全 |
| F20 | S1 | 跨旅程 | 3.2 | **体验缺失** -- API Key 入口可达性 |
| F03 | S2 | 冷启动 | 2.2 | **需确认** -- 模板 5 个 vs 裁决 3 个 |
| F15 | S2 | AI | 未定义 | **需确认** -- AI 操作历史是否持久化 |
| F16 | S2 | 模板 | 2.2 | **体验粗糙** -- 模板切换过渡 |
| F18 | S2 | 导出 | 2.3 | **需求遗漏** -- 导出文件命名规则 |
| F21 | S2 | 跨旅程 | 1.2 | **需求遗漏** -- 数据导入/导出 |
| F22 | S2 | 跨旅程 | 未定义 | **需求遗漏** -- 进度计算规则 |
