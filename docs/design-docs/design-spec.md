---
status: approved
author: design
date: 2026-03-26
blocks: [design-phase-b, feature]
open_questions: 0
approved_by: Lucas
approved_date: 2026-03-26
---

# 墨简设计规范

> 此文档是所有 UI 工作的权威约束。
> 任何视觉决策必须在此文档中有据可循，否则不得实施。
> 质量风险标注：当前 QUALITY_SCORE 45/100（橙色区间，框架阶段）。

---

## 1. 设计哲学

### 1.1 核心叙事

墨简的视觉语言来自中国古典文人书房：**宣纸上落墨的克制感，印章的仪式感，窗棂的秩序感**。

这不是一个"古风皮肤"——每一个视觉元素都有功能对应：

| 古风元素 | 功能映射 | 设计表达 |
|---|---|---|
| **宣纸** | 内容承载面（编辑区、卡片背景） | 暖白底色 + 细腻纤维纹理 |
| **墨** | 文字与线条（内容、分割线） | 浓淡墨色梯度，从标题到辅助文字 |
| **印章** | 确认性操作（保存、导出、AI 确认） | 朱砂色方形按钮，微旋转 |
| **窗棂** | 结构与导航（面板分割、导航栏） | SVG 几何线条图案（回纹/万字纹） |
| **祥云** | 装饰与空态（空白页、加载中） | 简化云纹线条作为背景点缀 |
| **墨砚** | AI 功能区域（AI 操作面板） | 深色面板 + 墨色渐变 |

### 1.2 设计原则

**克制**：宁少勿多。古风元素是调味料，不是主菜。一个页面上的装饰性古风元素不超过 2-3 处。

**功能即审美**：不做纯装饰。如果一个古风元素没有对应功能，就不应该出现。

**现代可用性**：古风是视觉语言，不是交互模式。按钮还是按钮，输入框还是输入框。不为古风牺牲标准交互模式。

**计白当黑**：借鉴国画的留白哲学。内容区域保持充足留白，用空间而非线条区分信息层次。

---

## 2. 色彩体系

### 2.1 L1 基础色（中国传统色）

所有色值源自 [中国传统色谱](https://zhongguose.com)，保留传统色名。

| 令牌名 | CSS 变量 | 色值 | 传统色名 | 文化来源 |
|---|---|---|---|---|
| `color.ink.deep` | `--color-ink-deep` | `#1C1208` | 玄色 | 天地未分之色，最深的墨 |
| `color.ink.medium` | `--color-ink-medium` | `#3B2E1A` | 黧色 | 浓墨半干时的色泽 |
| `color.ink.light` | `--color-ink-light` | `#6B5B3E` | 棕色（淡墨） | 淡墨一层的浅褐 |
| `color.ink.faint` | `--color-ink-faint` | `#9B8E7E` | 灰色（极淡墨） | 干笔淡扫的痕迹 |
| `color.paper.base` | `--color-paper-base` | `#F5EDD6` | 缣色 | 宣纸本色，未经加工的绢帛色 |
| `color.paper.warm` | `--color-paper-warm` | `#F0E6CE` | 牙色 | 象牙的暖白，宣纸暖调 |
| `color.paper.aged` | `--color-paper-aged` | `#D4C4A0` | 枯色 | 年久氧化的旧纸 |
| `color.vermillion` | `--color-vermillion` | `#C23B22` | 朱砂 | 矿物颜料，印泥之色 |
| `color.celadon` | `--color-celadon` | `#7BA05B` | 青瓷 | 宋代龙泉窑瓷色 |
| `color.gold` | `--color-gold` | `#C9A84C` | 赤金 | 金箔色，用于强调 |
| `color.glaze` | `--color-glaze` | `#1B4965` | 靛青 | 蓝染的深色，信息色 |

### 2.2 L2 语义色

语义色从 L1 基础色派生，定义功能角色。

| 语义令牌 | CSS 变量 | 映射源 | 用途 |
|---|---|---|---|
| `sem.bg.primary` | `--sem-bg-primary` | `color.paper.base` | 页面主背景 |
| `sem.bg.secondary` | `--sem-bg-secondary` | `color.paper.warm` | 卡片/面板背景 |
| `sem.bg.tertiary` | `--sem-bg-tertiary` | `color.paper.aged` | 侧栏/次要区域 |
| `sem.bg.ink` | `--sem-bg-ink` | `color.ink.deep` | AI 面板/深色区域 |
| `sem.text.primary` | `--sem-text-primary` | `color.ink.deep` | 标题、主要文字 |
| `sem.text.secondary` | `--sem-text-secondary` | `color.ink.medium` | 正文 |
| `sem.text.tertiary` | `--sem-text-tertiary` | `color.ink.light` | 辅助文字、占位符 |
| `sem.text.disabled` | `--sem-text-disabled` | `color.ink.faint` | 禁用文字 |
| `sem.text.inverse` | `--sem-text-inverse` | `color.paper.base` | 深色背景上的文字 |
| `sem.action.primary` | `--sem-action-primary` | `color.vermillion` | 主操作（印章按钮） |
| `sem.action.primary.hover` | `--sem-action-primary-hover` | `#A83220` | 主操作悬停（朱砂暗调） |
| `sem.action.secondary` | `--sem-action-secondary` | `color.ink.medium` | 次要操作 |
| `sem.action.ai` | `--sem-action-ai` | `color.glaze` | AI 相关操作 |
| `sem.border.default` | `--sem-border-default` | `color.ink.faint` | 默认边框（淡墨线） |
| `sem.border.strong` | `--sem-border-strong` | `color.ink.light` | 强调边框 |
| `sem.status.success` | `--sem-status-success` | `color.celadon` | 成功状态 |
| `sem.status.error` | `--sem-status-error` | `color.vermillion` | 错误状态 |
| `sem.status.info` | `--sem-status-info` | `color.glaze` | 信息提示 |
| `sem.status.warning` | `--sem-status-warning` | `color.gold` | 警告状态 |
| `sem.focus.ring` | `--sem-focus-ring` | `color.glaze` | 焦点环（键盘导航） |

### 2.3 L3 组件色

组件色在 L2 语义色基础上，为特定组件绑定。由阶段 B 实现时在各组件 `.module.css` 中定义。

规则：组件内禁止直接引用 L1 基础色，必须通过 L2 语义色或 L3 组件色。

### 2.4 对比度要求

所有文字与背景的组合必须满足 WCAG 2.1 AA 标准：

| 组合 | 对比度 | 达标 |
|---|---|---|
| `ink.deep` (#1C1208) on `paper.base` (#F5EDD6) | 14.8:1 | AAA |
| `ink.medium` (#3B2E1A) on `paper.base` (#F5EDD6) | 8.9:1 | AAA |
| `ink.light` (#6B5B3E) on `paper.base` (#F5EDD6) | 4.7:1 | AA |
| `ink.faint` (#9B8E7E) on `paper.base` (#F5EDD6) | 2.8:1 | 仅大字 |
| `paper.base` (#F5EDD6) on `ink.deep` (#1C1208) | 14.8:1 | AAA |
| `paper.base` (#F5EDD6) on `vermillion` (#C23B22) | 4.5:1 | AA |

> `ink.faint` 仅用于装饰性文字和禁用态，不用于需要阅读的正文内容。

---

## 3. 字体体系

### 3.1 字体栈

| 角色 | 字体 | 回退栈 | 加载策略 |
|---|---|---|---|
| **标题/装饰** | 霞鹜文楷 (LXGW WenKai) | "Songti SC", "STSong", serif | CDN 懒加载（已裁决） |
| **正文** | 系统字体栈 | "PingFang SC", "Microsoft YaHei", "Noto Sans SC", system-ui, sans-serif | 系统预装，零延迟 |
| **代码/数据** | 等宽字体栈 | "SF Mono", "JetBrains Mono", "Fira Code", monospace | 系统预装 |
| **印章文字** | 霞鹜文楷 Bold | 同标题回退 | 同标题 |

**霞鹜文楷加载方案**：
- 使用 `@callmebill/lxgw-wenkai-web` npm 包，通过 JSDelivr CDN 分发
- 字体子集化：仅加载页面使用的字符子集，首屏字体文件 < 100KB
- `font-display: swap`：先显示回退字体，文楷加载后替换
- 许可证：SIL Open Font License 1.1，免费商用

### 3.2 字号梯度

基于 `16px` 基线，使用乘法缩放。

| 令牌 | CSS 变量 | 尺寸 | 用途 |
|---|---|---|---|
| `font.display` | `--font-display` | `2rem` (32px) | 页面大标题 |
| `font.h1` | `--font-h1` | `1.5rem` (24px) | 章节标题 |
| `font.h2` | `--font-h2` | `1.25rem` (20px) | 子标题 |
| `font.h3` | `--font-h3` | `1.125rem` (18px) | 模块标题 |
| `font.body` | `--font-body` | `1rem` (16px) | 正文 |
| `font.small` | `--font-small` | `0.875rem` (14px) | 辅助文字 |
| `font.caption` | `--font-caption` | `0.75rem` (12px) | 标注、时间戳 |

### 3.3 行高

| 令牌 | CSS 变量 | 值 | 用途 |
|---|---|---|---|
| `leading.tight` | `--leading-tight` | `1.25` | 标题 |
| `leading.normal` | `--leading-normal` | `1.625` | 中文正文（中文字符宽高比需要更大行高） |
| `leading.relaxed` | `--leading-relaxed` | `1.875` | 长文阅读 |

### 3.4 字重

| 令牌 | CSS 变量 | 值 | 用途 |
|---|---|---|---|
| `weight.regular` | `--weight-regular` | `400` | 正文 |
| `weight.medium` | `--weight-medium` | `500` | 强调 |
| `weight.bold` | `--weight-bold` | `700` | 标题、印章文字 |

---

## 4. 间距体系

### 4.1 基线网格

基于 **4px** 基线网格，间距令牌取 4 的倍数。

| 令牌 | CSS 变量 | 值 | 用途 |
|---|---|---|---|
| `space.1` | `--space-1` | `4px` | 图标与文字间隙 |
| `space.2` | `--space-2` | `8px` | 紧凑元素间距 |
| `space.3` | `--space-3` | `12px` | 按钮内边距（垂直） |
| `space.4` | `--space-4` | `16px` | 默认元素间距 |
| `space.6` | `--space-6` | `24px` | 卡片内边距 |
| `space.8` | `--space-8` | `32px` | 区块间距 |
| `space.12` | `--space-12` | `48px` | 大区域间距 |
| `space.16` | `--space-16` | `64px` | 页面级留白 |
| `space.24` | `--space-24` | `96px` | 最大留白 |

### 4.2 圆角

古风设计倾向**极小圆角**或直角，避免现代圆润感。

| 令牌 | CSS 变量 | 值 | 用途 |
|---|---|---|---|
| `radius.none` | `--radius-none` | `0px` | 印章按钮（方正） |
| `radius.sm` | `--radius-sm` | `2px` | 卡片、输入框 |
| `radius.md` | `--radius-md` | `4px` | 对话框 |
| `radius.full` | `--radius-full` | `9999px` | 标签、徽章（极少使用） |

### 4.3 阴影

不使用现代 Material Design 风格的大面积投影。用极淡的阴影模拟"纸张叠放"感。

| 令牌 | CSS 变量 | 值 | 用途 |
|---|---|---|---|
| `shadow.subtle` | `--shadow-subtle` | `0 1px 2px rgba(28, 18, 8, 0.06)` | 卡片默认 |
| `shadow.medium` | `--shadow-medium` | `0 2px 8px rgba(28, 18, 8, 0.10)` | 浮层、下拉 |
| `shadow.strong` | `--shadow-strong` | `0 4px 16px rgba(28, 18, 8, 0.14)` | 对话框 |

---

## 5. 组件规范

### 5.1 设计语言总则

- 所有组件使用 CSS Modules + CSS Variables（tech-decisions 决策 7）
- 视觉属性全部通过 design token 表达，禁止裸色值/裸字号/裸间距
- 每个组件由 `.tsx` + `.module.css` 组成
- 组件分三级：Atoms（原子）→ Molecules（分子）→ Organisms（有机体）

### 5.2 原子组件

#### SealButton（印章按钮）

主操作按钮，模拟方形篆刻印章。

**视觉规范**：
- 形状：方形，圆角 `radius.none`（0px）
- 背景：`sem.action.primary`（朱砂 #C23B22）
- 文字：`sem.text.inverse`（宣纸色），字体 `weight.bold`，霞鹜文楷
- 内边距：`space.3` (12px) 上下，`space.6` (24px) 左右
- 微旋转：静态 `rotate(-1deg)`，悬停归正 `rotate(0deg)`
- 磨损质感：通过 CSS `mask-image` 叠加 SVG 噪点纹理

**状态**：
- Default：朱砂底色 + 微旋转
- Hover：归正旋转 + 背景色加深至 `sem.action.primary.hover` + `scale(0.98)`
- Active：`scale(0.96)` + 阴影消失
- Disabled：`opacity: 0.4`，无旋转
- Focus：`sem.focus.ring` 外发光环（2px offset, 2px width）

**变体**：
- `variant="primary"`：朱砂底色（默认）
- `variant="secondary"`：透明底 + 墨色边框
- `variant="ghost"`：透明底 + 墨色文字，无边框

#### PaperCard（宣纸卡片）

内容承载容器，模拟宣纸叠层。

**视觉规范**：
- 背景：`sem.bg.secondary`（牙色）
- 边框：`1px solid sem.border.default`
- 圆角：`radius.sm`（2px）
- 内边距：`space.6`（24px）
- 阴影：`shadow.subtle`
- 纹理：伪元素叠加宣纸纤维纹理，`opacity: 0.05`，`mix-blend-mode: multiply`
- 已裁决：纹理使用纯 CSS 方案（SVG 内联噪点 + 多层渐变），零网络请求

**变体**：
- `variant="flat"`：无阴影，用于嵌套卡片
- `variant="aged"`：背景用 `color.paper.aged`，用于历史记录/归档内容

#### InkInput（墨线输入框）

文本输入控件，以墨线为底边框。

**视觉规范**：
- 背景：透明
- 边框：仅底边框，`2px solid sem.border.default`
- 聚焦时底边框：`2px solid sem.text.primary`，墨线加深动画（200ms）
- 标签文字：`font.small`，`sem.text.tertiary`
- 输入文字：`font.body`，`sem.text.primary`
- 占位符：`sem.text.disabled`
- 内边距：`space.2`（8px）上下，`space.1`（4px）左右

**状态**：
- Default：淡墨底线
- Focus：浓墨底线 + 标签上浮动画
- Error：底线变 `sem.status.error` + 错误提示文字
- Disabled：底线变虚线 + `opacity: 0.5`

#### InkDivider（墨线分割线）

区域分割，模拟毛笔划线的自然不均匀感。

**视觉规范**：
- 实现：SVG `<path>` 元素，路径带轻微波动
- 颜色：`sem.border.default`
- 粗细：1-1.5px，通过 `stroke-width` 控制
- 长度：默认 100%，可指定固定宽度
- SVG 路径使用三次贝塞尔曲线模拟手绘线条

**变体**：
- `variant="thin"`：0.5px 极淡线（列表项之间）
- `variant="ornamental"`：中间嵌入小装饰（如小祥云图案）

#### LatticePattern（窗棂纹样）

装饰性边框或背景图案，用于面板/导航区域。

**视觉规范**：
- 实现：SVG `<pattern>` 元素，重复平铺
- 颜色：`sem.border.default`，可通过 `currentColor` 继承
- 线条粗细：1px
- 已裁决：图案选用万字纹（卍），传统辨识度最高
- 用途：侧边栏边框装饰、对话框装饰边

#### CloudEmpty（祥云空态）

空白状态占位，用简化祥云纹传达"虚空"。

**视觉规范**：
- 祥云图形：SVG 线条画，`sem.text.disabled` 色
- 提示文字：`font.body`，`sem.text.tertiary`
- 操作按钮：`SealButton variant="secondary"`
- 布局：垂直居中，祥云图形 → 文字 → 按钮，间距 `space.4`

#### InkTag（墨韵标签）

信息标注，如模板名称、状态标签。

**视觉规范**：
- 形状：极小圆角 `radius.sm`（2px）
- 背景：`sem.bg.tertiary`
- 文字：`font.caption`，`sem.text.secondary`
- 内边距：`space.1`（4px）上下，`space.2`（8px）左右
- 边框：`1px solid sem.border.default`

#### InkTooltip（墨韵提示）

悬停或聚焦时的信息提示。

**视觉规范**：
- 背景：`sem.bg.ink`（深墨色）
- 文字：`sem.text.inverse`，`font.small`
- 圆角：`radius.sm`（2px）
- 内边距：`space.2`（8px）
- 阴影：`shadow.medium`
- 箭头：CSS 三角形，同背景色

### 5.3 分子组件

#### TemplateSelector（模板选择器）

由 `PaperCard` + 缩略图 + `InkTag` 组合。

**行为规范**：
- 显示 3 个模板缩略图（经典单栏、双栏、学术风）
- 当前选中模板卡片有 `sem.border.strong` 边框
- 切换模板触发布局动画（Motion `layout` prop）

#### AIOptionPanel（AI 选项面板）

墨砚风格的 AI 操作区域，由深色面板 + 选项卡片 + `SealButton` 组合。

**交互位置**：已裁决为右侧抽屉——从预览区右侧滑出，保持编辑区不受影响。抽屉宽度 360px，通过 Motion `AnimatePresence` 管理滑入/滑出动画。

**行为规范**：
- 背景：`sem.bg.ink` 渐变（从上到下，`ink.deep` → `ink.medium`）
- AI 选项以卡片排列：润色表述、量化成果、精简内容、匹配岗位
- 每张选项卡片：浅色边框 + 图标 + 名称 + 简短描述
- 选中选项后显示确认 `SealButton`

#### ResumeSection（简历模块）

编辑器中的可拖拽简历区块，由标题 + 内容区 + 拖拽手柄组合。

**行为规范**：
- 拖拽手柄：左侧墨点图标
- 模块标题：`font.h3`，霞鹜文楷
- 内容区：TipTap 编辑器嵌入
- 模块间距：`space.6`

### 5.4 有机体/页面级

#### EditorLayout（编辑器布局）

主页面的整体布局，双栏结构。

**布局规范**：
- 左侧：编辑区（~55% 宽度），宣纸底色
- 右侧：预览区（~45% 宽度），渲染结果
- 顶部：窗棂风格工具栏
- 中间分割：可拖拽分割线（InkDivider 纵向变体）
- 最小内容区宽度：480px

#### TopToolbar（顶部工具栏）

窗棂风格的全局导航。

**布局规范**：
- 高度：56px
- 左侧：品牌标识"墨简"（霞鹜文楷，`font.h2`）
- 中间：模板切换、AI 选项入口
- 右侧：导出按钮（`SealButton`）、设置入口
- 底部边框：`LatticePattern` 装饰线

---

## 6. 动画规范

### 6.1 缓动曲线

所有动画的运动感来自"墨水在宣纸上的物理行为"。

| 令牌 | CSS 变量 | 贝塞尔值 | 用途 |
|---|---|---|---|
| `ease.ink-spread` | `--ease-ink-spread` | `cubic-bezier(0.22, 0.61, 0.36, 1)` | 进入动画——墨水扩散，快起慢停 |
| `ease.ink-fade` | `--ease-ink-fade` | `cubic-bezier(0.55, 0, 0.68, 0.19)` | 退出动画——墨迹褪去，慢起快停 |
| `ease.brush-touch` | `--ease-brush-touch` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | 悬停/交互——毛笔触纸，自然流畅 |

### 6.2 时长标准

| 类型 | 时长 | 说明 |
|---|---|---|
| 微交互（悬停、焦点） | `100-150ms` | 即时反馈，不拖沓 |
| 进入动画 | `300-400ms` | 墨水扩散感，稍慢以营造仪式感 |
| 退出动画 | `150-250ms` | 墨迹褪去，较快以不阻碍操作 |
| 布局变化（模板切换） | `400-500ms` | FLIP 布局动画，需要足够时长让用户追踪变化 |
| 加载动画 | `800-1200ms` 循环 | 墨水晕染，持续循环 |

### 6.3 Motion 使用规范

**进入/退出动画**（`AnimatePresence` 管理）：
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.96 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.98 }}
  transition={{
    duration: 0.35,
    ease: [0.22, 0.61, 0.36, 1], // ink-spread
  }}
/>
```

**悬停效果**（印章按钮示例）：
```tsx
<motion.button
  whileHover={{ scale: 0.98, rotate: 0 }}
  whileTap={{ scale: 0.96 }}
  transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.15 }}
/>
```

**布局动画**（模板切换）：
```tsx
<motion.div layout transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }} />
```

### 6.4 墨水晕染加载动画

加载状态使用径向扩散 + 透明度渐变，模拟墨水滴入水中的晕开效果：

- 圆形从中心向外扩散
- 同时 `opacity` 从 0.8 → 0.2 → 0.8 循环
- `scale` 从 0.2 → 1.2 循环
- 颜色：`sem.text.tertiary`

### 6.5 性能预算

- 所有动画必须在 60fps 下运行
- 仅动画 `transform` 和 `opacity`（GPU 加速属性），避免动画 `width`/`height`/`top`/`left`
- `will-change` 仅在动画开始前瞬间添加，动画结束后移除
- 单页面同时运行的动画实例 ≤ 5 个

### 6.6 无障碍

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

所有 Motion 组件必须检测 `prefers-reduced-motion`，在减少动画模式下跳过非必要动画。

---

## 7. 响应式策略

### 7.1 断点

已裁决仅桌面端（≥1024px），不做移动端专门适配。

| 断点 | 宽度 | 布局 |
|---|---|---|
| `desktop` | `≥ 1280px` | 双栏（编辑 55% / 预览 45%），工具栏水平 |
| `desktop-compact` | `1024px - 1279px` | 双栏（编辑 50% / 预览 50%），工具栏紧凑 |
| `< 1024px` | 不支持 | 显示提示："墨简目前仅支持桌面端浏览器（≥1024px）" |

### 7.2 编辑器/预览分割

- 分割比例可拖拽调整（最小编辑区 40%，最小预览区 30%）
- 支持预览区全屏模式（编辑区隐藏）
- 支持编辑区全屏模式（预览区折叠为侧边缩略图）

### 7.3 字号适配

字号令牌在两个断点下保持一致（已经是 rem 单位，跟随用户浏览器设置）。
仅在 `desktop-compact` 下缩减页面级留白（`space.16` → `space.12`）。

---

## 8. 无障碍适配

### 8.1 色彩

- 所有文字/背景组合满足 WCAG 2.1 AA 对比度（≥ 4.5:1 正文，≥ 3:1 大字）
- 不单独依赖颜色传递信息（错误状态同时用颜色 + 图标 + 文字说明）
- 对比度验证表见 [2.4 对比度要求](#24-对比度要求)

### 8.2 焦点管理

- 所有可交互元素有可见的焦点样式：`sem.focus.ring`（靛青色外环）
- 焦点样式仅在键盘导航时显示（`:focus-visible`），鼠标点击不显示
- Tab 顺序遵循视觉逻辑：工具栏 → 编辑区模块列表 → 编辑区内容 → 预览区操作

```css
:focus-visible {
  outline: 2px solid var(--sem-focus-ring);
  outline-offset: 2px;
}
```

### 8.3 屏幕阅读器

- 所有装饰性 SVG（窗棂、祥云、分割线）标记 `aria-hidden="true"`
- 功能性图标提供 `aria-label`
- 编辑器区域标注 `role="region"` + `aria-label="简历编辑区"`
- 预览区域标注 `role="region"` + `aria-label="简历预览区"`
- AI 操作结果通过 `aria-live="polite"` 通知

### 8.4 键盘操作

- 所有功能可通过键盘完成
- 对话框和浮层支持 `Escape` 关闭
- 模板切换支持方向键导航
- 拖拽排序同时提供键盘替代方案（上下键移动 + Enter 确认）

---

## 已裁决问题

> 以下问题已由人类裁决，结果已回注到对应规范章节中。

| # | 问题 | 裁决 | 裁决人 | 日期 |
|---|---|---|---|---|
| Q1 | 宣纸纹理实现方案 | A: 纯 CSS 方案（SVG 内联噪点 + 多层渐变），零网络请求 | Lucas | 2026-03-26 |
| Q2 | 窗棂图案选择 | B: 万字纹——传统辨识度最高 | Lucas | 2026-03-26 |
| Q3 | AI 面板位置 | A: 右侧抽屉——从预览区右侧滑出，保持编辑区不受影响 | Lucas | 2026-03-26 |
