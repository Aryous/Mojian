# 编辑器配色与结构重设计

> 日期: 2026-03-27
> 状态: approved
> 范围: 编辑器主界面（TopToolbar + 左侧编辑面板 + 预览区 + 全局令牌）

## 问题诊断

编辑器主界面缺乏视觉层次和惊艳感，具体表现为：

1. **纸色背景无层次** — 三档纸色（`#F5EDD6` / `#F0E6CE` / `#D4C4A0`）亮度差仅 5-12 单位，编辑面板与预览区视觉上无法区分。
2. **工具栏用暖棕而非墨色** — `#3B2E1A` 是暖棕色，装饰元素（墨晕动画、墨痕底线）因与背景色接近而肉眼不可见。
3. **全局黄度过高** — 宣纸色 `#F5EDD6` 偏暖黄，导致整体像被茶水浸泡，与真实宣纸的冷白色温不符。
4. **卡片容器廉价感** — 左侧 section 用圆角卡片 + 浅阴影，像通用 SaaS 表单而非古风编辑器。

## 设计方案

### 1. 全局配色迁移

| 区域 | 当前值 | 新值 | 说明 |
|---|---|---|---|
| 工具栏背景 | `#3B2E1A` | `#363636` | 中性深灰，不纯黑（避免过硬对比） |
| 编辑面板背景 | `#F5EDD6` | `#F7F5F0` | 微暖白，真实宣纸色温 |
| 预览区背景 | `#D4C4A0` | `#ebe8e1` | 暖灰白 |
| 简历纸色 | `#FEFBF2` | `#FFFFFF` | 纯白 |
| 主文字色 | `#1C1208` | `#1A1A1A` | 中性深灰，去棕调 |

亮度节奏：工具栏 (L≈25) → 编辑面板 (L≈97) → 预览区 (L≈92) → 简历 (L≈100)，四级明确可辨。

### 2. 工具栏简化

**删除：**
- `::before` 墨晕漂浮动画（不可见，浪费渲染）
- `::after` 墨痕底线重复图案（不可见）

**新增：**
- 底部 `1px solid #C23B22` 朱砂线 — 一笔定乾坤，唯一装饰
- 品牌"墨简"透明度从 0.7 → 1.0，确保清晰

### 3. 左侧面板：卡片 → 账簿

**删除：**
- `.sectionCard` 的 `border-radius: 6px`、`box-shadow`、`background: --editor-card-bg`、`border`
- 每个 section 独立容器的视觉边界

**替换为：**
- Section 之间用渐隐墨线分隔：`linear-gradient(90deg, transparent, #C8C0B4 15%, #C8C0B4 85%, transparent)`
- Section 标题：`border-left: 3px solid #C23B22`，display 字体，`letter-spacing: 0.03em`
- 内容区域与标题竖线对齐（`padding-left: 13px`）
- 条目之间用 `border-bottom: 1px solid #E0DCD4` 细线分隔

### 4. AI 面板命名

- "AI 智能优化" → "墨灵"（所有 aria-label、tooltip、header 同步）
- FAB 图标：太阳/光芒 → 毛笔 SVG（已实现）

## 影响范围

### 令牌层 (`src/ui/tokens/index.css`)
- L1 基础色：新增/修改工具栏、面板、预览区色值
- L2 语义色：`--sem-bg-primary` 指向新纸色
- L3 编辑器令牌：删除 `--editor-card-bg`、`--editor-card-border`，新增墨线分隔色

### 组件层
| 文件 | 改动 |
|---|---|
| `TopToolbar.module.css` | 背景色、删除 ::before/::after、底部朱砂线、品牌透明度 |
| `EditorPage.module.css` | `.sectionCard` 去容器化、新增墨线分隔样式、`.sectionTitle` 字体升级 |
| `ResumePreview.module.css` | 预览区背景色 |
| `SectionEditor.module.css` | `.listItem` 背景适配新面板色 |

### 不变
- AI 面板（墨灵）的 obi indigo 配色不在此次范围
- 模板选择页独立配色不在此次范围
- Dashboard / Landing 页不在此次范围
