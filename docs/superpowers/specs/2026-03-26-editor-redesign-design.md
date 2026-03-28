# EditorPage 重新设计 — 设计规范

> **状态**: review
> **作者**: brainstorming
> **日期**: 2026-03-26
> **Mockup**: `.superpowers/brainstorm/19423-1774513791/content/editor-redesign-v4.html`

## 目标

重新设计 EditorPage 的布局、工具栏、AI 交互系统，解决以下问题：

1. 模板按钮与 AI 按钮缺乏视觉层级
2. 导出按钮重复（工具栏 + 预览区）
3. 简历标题不可编辑
4. 左右面板比例失衡（55/45 太宽）
5. 滚动条样式粗糙
6. AI 入口单一，缺少对话式交互

## 架构概览

```
EditorPage
  TopToolbar          — 精简工具栏（返回 | 品牌 | 可编辑标题 || 模板选择 | 导出）
  Workspace
    EditorPanel (42%) — section 卡片列表 + 每卡片 hover 显示 "AI 润色"
    PreviewPanel (58%)
      PreviewHeader   — "预览" 标签 + 编译状态
      PreviewCanvas   — 简历纸张，AI 抽屉打开时 margin-right 偏移
    AiDrawer (340px)  — 右侧覆盖在预览区上方，藏青背景
    AiFab             — 右下角悬浮按钮，触发 AiDrawer
```

---

## 1. 工具栏 (TopToolbar)

**高度**: 48px，`--sem-bg-primary` 背景，底边 `--sem-border-default` 1px。

**左侧**:
- 返回按钮：30x30，`<` 图标，`navigate('/dashboard')`
- 品牌文字："墨简"，`--font-family-display`，15px，`--weight-bold`
- 分隔符：`|`，`--sem-text-disabled` 颜色
- 可编辑标题：`<input>` 元素，140px 宽
  - 默认态：透明背景，无边框
  - hover：底部 1px dashed `--sem-text-disabled`
  - focus：底部 1px solid `--sem-action-ai`，选中全部文字
  - 值变化时调用 `useResumeStore` 的 `updateResume({ title: newValue })`

**右侧**:
- 模板选择触发器：30px 高按钮，包含缩略图图标 + 当前模板名 + `▾`
- 导出 PDF 按钮：30px 高，`--sem-action-primary` 背景，白色文字

**删除**: 原工具栏的 5 个模板文字按钮、AI 优化按钮。预览区的 "导出 PDF" 按钮也删除（只保留工具栏一处）。

---

## 2. 模板选择弹出层 (TemplatePopover)

点击工具栏的模板触发器 → 弹出浮层。

**结构**:
- 半透明背景遮罩（点击关闭）
- 固定定位弹出卡片，圆角 8px，`--sem-bg-primary` 背景
- 标题行："选择模板"
- 5 列网格，每列一个模板卡片

**模板卡片**:
- 缩略图：72x100，白色背景，用 CSS 线条模拟不同模板的排版特征
  - 经典：单栏，标题 + 正文行
  - 双栏：左窄右宽两列
  - 现代：左侧深色侧栏 + 右侧正文
  - 极简：大留白，稀疏行
  - 学术：居中标题 + 分隔线
- 模板名称：11px，居中
- 选中态：`--sem-action-primary` 2px 边框
- 动画：弹出时 translateY(-8px) -> 0 + opacity 0 -> 1，`--ease-ink-spread`

---

## 3. 编辑面板 (EditorPanel)

**宽度**: `flex: 42`，`min-width: 380px`，`max-width: 520px`。

**滚动条**:
- WebKit 自定义：4px 宽，`--sem-text-disabled` 20% 透明度的 thumb
- Firefox: `scrollbar-width: thin`

**Section 卡片**:
- 白色背景，6px 圆角，1px 边框 `--color-paper-aged` 50% 透明
- hover 时 shadow 加深（`--shadow-medium`）
- 标题行：左侧 `--font-family-display` 15px + 3px `--sem-action-primary` 左边框
- "AI 润色" 按钮：标题行右侧，默认 `opacity: 0`，卡片 hover 时 `opacity: 1`
  - 24px 高，`--sem-action-ai` 颜色，带 SVG 太阳纹图标
  - 点击后触发对该 section 的 AI 优化（具体 AI 调用逻辑在后续 AI 功能 spec 中定义，本 spec 只定义 UI 入口）

**字段样式**:
- 标签：10px `--sem-text-tertiary`
- 输入框：底线式，无边框，底部 1px `--color-paper-aged`，focus 时变 `--sem-action-ai`
- 添加按钮：虚线边框，居中 "+ 添加xxx"

---

## 4. 预览面板 (PreviewPanel)

**宽度**: `flex: 58`，`--sem-bg-secondary` 偏暖背景（`#ede5d0`）。

**PreviewHeader**:
- 6px 上下 padding，16px 左右
- 左侧 "预览" 标签 11px
- 右侧编译状态文字 11px

**PreviewCanvas**:
- flex: 1，居中展示简历纸张
- `margin-right: 0`，AI 抽屉打开时过渡到 `margin-right: 340px`
- 过渡动画：`--duration-normal` + `--ease-ink-spread`

**简历纸张**:
- 320px 宽，A4 比例 (210:297)
- 三层阴影（与模板选择页一致，使用 `--tpl-paper-shadow`）
- 内部是 Typst 编译的 SVG（现有逻辑不变）

---

## 5. AI 悬浮按钮 (AiFab)

**位置**: 预览区右下角，`bottom: 24px; right: 24px`，`position: absolute`。

**样式**:
- 48x48 圆形
- 背景：`linear-gradient(135deg, var(--obi-bg-start), var(--obi-bg-end))`
- 颜色：`--obi-text`
- 图标：太阳纹 SVG（与 section AI 按钮同系列，放大版）
- 阴影：`0 4px 12px rgba(44,53,72,0.4)`
- hover：scale(1.08) + translateY(-2px) + 阴影加强
- hover 时左侧显示 tooltip "AI 智能优化"

**行为**:
- 点击 → 打开 AiDrawer，FAB 自身 `opacity: 0; pointer-events: none; scale(0.8)` 隐藏
- AiDrawer 关闭 → FAB 恢复

---

## 6. AI 抽屉 (AiDrawer)

**位置**: 预览区内部右侧，`position: absolute; top: 0; right: 0; bottom: 0`。
**宽度**: 340px。

**入场动画**: `translateX(100%) -> translateX(0)`，`--duration-normal` + `--ease-ink-spread`。

**配色**: 藏青色系，复用 obi 设计令牌：
- 背景：`linear-gradient(180deg, var(--obi-bg-start), var(--obi-bg-end))`
- 边框/分割线：`--obi-border`
- 文字：`--obi-text`
- 左侧装饰线：3px `--obi-accent-line`（朱红），top 12px 到 bottom 12px

**结构（自上而下）**:

### 6.1 头部
- 标题："AI 智能优化"，`--font-family-display` 15px bold
- 关闭按钮：28x28，`x` 图标

### 6.2 快捷操作区
- 2x2 网格，8px 间距
- 每个卡片：
  - 单字汉字图标（宋体/serif，18px，`--obi-seal` 金色）
  - 操作名 11px bold
  - 描述 9px muted
- 四个操作：
  - 「润」润色全文 — 优化表述，更专业有力
  - 「量」量化成果 — 模糊描述变可量化指标
  - 「简」精简内容 — 去除冗余，控制篇幅
  - 「适」岗位匹配 — 根据目标岗位调整
- 底部 1px `--obi-border` 分隔线

### 6.3 对话区
- `flex: 1; overflow-y: auto`
- 空态提示："点击快捷操作或输入你的需求"，居中，muted 颜色
- AI 消息：左对齐，`rgba(58,69,96,0.35)` 背景
- 用户消息：右对齐，`rgba(232,226,214,0.12)` 背景
- 滚动条：3px 宽，极淡 thumb

### 6.4 建议标签区
- 横向 flex-wrap，6px 间距
- 药丸形标签（12px 圆角），1px `--obi-border` 边框
- 默认三个："改写简介"、"STAR 法则"、"翻译英文"
- hover：背景加深 + 边框变亮

### 6.5 输入栏
- 顶部 1px `--obi-border` 分隔线
- 横向布局：输入框 + 发送按钮
- 输入框：8px 圆角，`--obi-border` 边框，`--obi-bg-start` 背景偏透明
- 发送按钮：36x36，`--obi-accent-line`（朱红）背景，箭头 SVG 图标

---

## 7. 交互状态

### 7.1 AI 抽屉开关
1. 点击 FAB → AiDrawer slide in + FAB 隐藏 + PreviewCanvas `margin-right: 340px`
2. 点击关闭/按 Escape → AiDrawer slide out + FAB 恢复 + PreviewCanvas `margin-right: 0`
3. 三者动画同步，使用相同 duration 和 easing

### 7.2 快捷操作点击
1. 点击快捷卡片 → 在对话区添加用户消息（对应的预设 prompt）
2. 触发 AI 调用 → 对话区显示 AI 回复
3. （AI 后端调用的具体实现不在本 spec 范围，本 spec 只定义 UI 结构和状态管理）

### 7.3 对话输入
1. 输入文字 + 点击发送或按 Enter → 在对话区添加用户消息
2. 触发 AI 调用 → 对话区显示 AI 回复
3. 每次新消息后自动滚到底部

### 7.4 Section AI 润色
1. hover section 卡片 → "AI 润色" 按钮淡入
2. 点击 → 打开 AiDrawer（如未打开），自动发送针对该 section 的优化 prompt

---

## 8. 文件变更范围

| 操作 | 文件 | 说明 |
|---|---|---|
| 重写 | `EditorPage.tsx` | 新布局结构 |
| 重写 | `EditorPage.module.css` | 新样式，42/58 分割 |
| 重写 | `TopToolbar.tsx` | 精简为：返回+品牌+标题 / 模板+导出 |
| 重写 | `TopToolbar.module.css` | 新样式 |
| 新建 | `TemplatePopover.tsx` | 模板卡片弹出层 |
| 新建 | `TemplatePopover.module.css` | 弹出层样式 |
| 新建 | `AiDrawer.tsx` | AI 抽屉（快捷操作 + 对话 + 输入） |
| 新建 | `AiDrawer.module.css` | 抽屉样式 |
| 新建 | `AiFab.tsx` | AI 悬浮按钮 |
| 新建 | `AiFab.module.css` | FAB 样式 |
| 修改 | `ResumePreview.tsx` | 删除 "导出 PDF" 按钮，接受 shifted prop |
| 修改 | `ResumePreview.module.css` | 添加 shifted 偏移样式，删除导出按钮样式 |
| 修改 | `SectionEditor.tsx` | 添加 hover "AI 润色" 按钮 |
| 修改 | `SectionEditor.module.css` | hover 显隐 + 按钮样式 |
| 删除 | `AiPanel.tsx` | 被 AiDrawer 替代 |
| 删除 | `AiPanel.module.css` | 被 AiDrawer.module.css 替代 |
| 可能修改 | `tokens/index.css` | 如需补充 L3 编辑器级令牌 |

---

## 9. 不在本 spec 范围

- AI 后端调用逻辑（provider 选择、prompt 模板、流式响应）
- AI 对话的持久化存储
- Section AI 润色的 diff/apply 机制
- 模板的实际 Typst 渲染差异（缩略图用 CSS 模拟）
- 移动端响应式适配
