# 设计令牌参考

> 令牌文件: `src/ui/tokens/index.css`
> 权威来源: `docs/design-docs/design-spec.md`

---

## L1 基础色（中国传统色）

| CSS 变量 | 色值 | 传统色名 | 用途 |
|---|---|---|---|
| `--color-ink-deep` | `#1C1208` | 玄色 | 最深墨色 |
| `--color-ink-medium` | `#3B2E1A` | 黧色 | 浓墨半干 |
| `--color-ink-light` | `#6B5B3E` | 淡墨 | 辅助文字 |
| `--color-ink-faint` | `#9B8E7E` | 极淡墨 | 禁用/装饰 |
| `--color-paper-base` | `#F5EDD6` | 缣色 | 宣纸本色 |
| `--color-paper-warm` | `#F0E6CE` | 牙色 | 宣纸暖调 |
| `--color-paper-aged` | `#D4C4A0` | 枯色 | 旧纸 |
| `--color-vermillion` | `#C23B22` | 朱砂 | 印章/主操作 |
| `--color-celadon` | `#7BA05B` | 青瓷 | 成功 |
| `--color-gold` | `#C9A84C` | 赤金 | 警告/强调 |
| `--color-glaze` | `#1B4965` | 靛青 | AI/信息 |

## L2 语义色

| CSS 变量 | 映射 | 用途 |
|---|---|---|
| `--sem-bg-primary` | paper-base | 页面主背景 |
| `--sem-bg-secondary` | paper-warm | 卡片背景 |
| `--sem-bg-tertiary` | paper-aged | 侧栏/次要 |
| `--sem-bg-ink` | ink-deep | AI 面板/深色 |
| `--sem-text-primary` | ink-deep | 标题/主文字 |
| `--sem-text-secondary` | ink-medium | 正文 |
| `--sem-text-tertiary` | ink-light | 辅助文字 |
| `--sem-text-disabled` | ink-faint | 禁用态 |
| `--sem-text-inverse` | paper-base | 深色上文字 |
| `--sem-action-primary` | vermillion | 主操作 |
| `--sem-action-primary-hover` | #A83220 | 主操作悬停 |
| `--sem-action-secondary` | ink-medium | 次要操作 |
| `--sem-action-ai` | glaze | AI 操作 |
| `--sem-border-default` | ink-faint | 默认边框 |
| `--sem-border-strong` | ink-light | 强调边框 |
| `--sem-status-success` | celadon | 成功 |
| `--sem-status-error` | vermillion | 错误 |
| `--sem-status-info` | glaze | 信息 |
| `--sem-status-warning` | gold | 警告 |
| `--sem-focus-ring` | glaze | 焦点环 |

## 字体

| CSS 变量 | 值 | 用途 |
|---|---|---|
| `--font-family-display` | LXGW WenKai, ... serif | 标题/装饰 |
| `--font-family-body` | PingFang SC, ... sans-serif | 正文 |
| `--font-family-mono` | SF Mono, ... monospace | 代码/数据 |
| `--font-display` | 2rem (32px) | 页面大标题 |
| `--font-h1` | 1.5rem (24px) | 章节标题 |
| `--font-h2` | 1.25rem (20px) | 子标题 |
| `--font-h3` | 1.125rem (18px) | 模块标题 |
| `--font-body` | 1rem (16px) | 正文 |
| `--font-small` | 0.875rem (14px) | 辅助文字 |
| `--font-caption` | 0.75rem (12px) | 标注 |

## 字间距

| CSS 变量 | 值 | 用途 |
|---|---|---|
| `--tracking-tight` | -0.02em | 大标题收紧（≥24px） |
| `--tracking-normal` | 0 | 正文默认 |
| `--tracking-wide` | 0.05em | 大写标签/极小文字 |

## 间距

基线网格 4px，变量名即倍数。

| CSS 变量 | 值 |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-12` | 48px |
| `--space-16` | 64px |
| `--space-24` | 96px |

## 圆角 / 阴影

| CSS 变量 | 值 |
|---|---|
| `--radius-none` | 0px |
| `--radius-sm` | 2px |
| `--radius-md` | 4px |
| `--radius-full` | 9999px |
| `--shadow-subtle` | 0 1px 2px rgba(28,18,8,0.06) |
| `--shadow-medium` | 0 2px 8px rgba(28,18,8,0.10) |
| `--shadow-strong` | 0 4px 16px rgba(28,18,8,0.14) |

## L3 组件令牌

### 墨砚面（ink-surface）

用于深色背景（AI 面板等）上的浅色元素。

| CSS 变量 | 值 | 用途 |
|---|---|---|
| `--ink-surface-text-body` | rgba(245,237,214,0.7) | 正文 |
| `--ink-surface-text-secondary` | rgba(245,237,214,0.55) | 次要文字 |
| `--ink-surface-text-label` | rgba(245,237,214,0.5) | 标签 |
| `--ink-surface-text-muted` | rgba(245,237,214,0.4) | 极淡提示 |
| `--ink-surface-text-hint` | rgba(245,237,214,0.6) | 引导说明 |
| `--ink-surface-text-placeholder` | rgba(245,237,214,0.35) | 占位符 |
| `--ink-surface-border` | rgba(245,237,214,0.15) | 卡片边框 |
| `--ink-surface-border-subtle` | rgba(245,237,214,0.1) | 分隔线 |
| `--ink-surface-border-input` | rgba(245,237,214,0.2) | 输入框边框 |
| `--ink-surface-border-diff` | rgba(245,237,214,0.12) | 对比区块 |
| `--ink-surface-bg-card` | rgba(245,237,214,0.06) | 卡片背景 |
| `--ink-surface-bg-faint` | rgba(245,237,214,0.04) | 最淡背景 |
| `--ink-surface-bg-input` | rgba(245,237,214,0.08) | 输入框背景 |
| `--ink-surface-accent-bg` | rgba(27,73,101,0.2) | AI 靛青高亮 |
| `--ink-surface-error-bg` | rgba(194,59,34,0.15) | 错误背景 |

### Hero 区域

用于 HeroSection 的大标题、装饰层等页面级组件。

| CSS 变量 | 值 | 用途 |
|---|---|---|
| `--hero-title-size` | clamp(5rem, 10vw, 8rem) | Hero 大标题流体尺寸（更大胆） |
| `--hero-title-tracking` | 0.14em | 标题字间距（更舒展） |
| `--hero-subtitle-size` | clamp(1.125rem, 1.5vw, 1.375rem) | 副标题流体尺寸 |
| `--hero-brush-color` | var(--sem-action-primary) | 毛笔装饰线颜色 |
| `--hero-brush-opacity` | 0.9 | 毛笔装饰线透明度（更鲜明） |
| `--hero-brush-width` | 220px | 毛笔装饰线宽度 |
| `--hero-ink-blob-opacity` | 0.10 | 墨色墨晕透明度（加强） |
| `--hero-vermillion-blob-opacity` | 0.08 | 朱砂墨晕透明度（加强） |
| `--hero-gold-blob-opacity` | 0.06 | 赤金墨晕透明度（加强） |
| `--hero-paper-edge-shadow` | linear-gradient(...) | 纸张底边阴影（加深） |
| `--hero-lattice-opacity` | 0.12 | 窗棂角落装饰透明度（加强） |
| `--hero-cloud-opacity` | 0.40 | 祥云装饰透明度（加强） |
| `--hero-seal-stamp-size` | 56px | 印章标记尺寸 |

### Feature 区域

用于 FeatureShowcase 的编排式布局。

| CSS 变量 | 值 | 用途 |
|---|---|---|
| `--feature-icon-size` | 64px | 功能图标尺寸 |
| `--feature-accent-width` | 4px | 左侧彩色强调条宽度（加粗） |
| `--feature-number-opacity` | 0.08 | 背景序号水印透明度（更可见） |
| `--feature-number-size` | 6rem | 背景序号字号（更戏剧化） |

### Delight 令牌

用于惊喜时刻和微交互增强。

| CSS 变量 | 值 | 用途 |
|---|---|---|
| `--delight-stamp-scale` | 1.06 | 印章按钮 hover 弹跳缩放 |
| `--delight-stamp-rotate` | -2deg | 印章按钮 hover 微旋转 |
| `--delight-stamp-glow` | 0 2px 12px rgba(194,59,34,0.25) | 印章按钮 hover 朱砂光晕 |
| `--delight-card-perspective` | 800px | 卡片 3D 翻翘透视距离 |
| `--delight-card-lift-rotate` | -2deg | 卡片 hover 翘起旋转角度 |
| `--delight-card-lift-translate` | -4px | 卡片 hover 上浮距离 |
| `--delight-card-lift-shadow` | 0 8px 24px rgba(28,18,8,0.06) | 卡片翘起时的纸张投影 |
| `--delight-cloud-drift-range` | 12px | 祥云飘动范围 |
| `--delight-cloud-drift-duration` | 8s | 祥云飘动周期 |
| `--delight-footer-hover-color` | var(--sem-action-primary) | 页脚品牌名 hover 色 |

### 模板选择页

用于 TemplateSelectPage 的布局、纸张容器和模板卡片。

| CSS 变量 | 值 | 用途 |
|---|---|---|
| `--tpl-sidebar-width` | 320px | 左栏模板列表宽度 |
| `--tpl-preview-bg` | #2A2118 | 预览区深檀色背景（模拟书案） |
| `--tpl-paper-shadow` | 多层 box-shadow | 纸张三层阴影（悬浮感） |
| `--tpl-paper-edge-glow` | 0 0 40px rgba(245,237,214,0.06) | 纸张边缘柔光 |
| `--tpl-card-active-bg` | rgba(28,18,8,0.05) | 选中模板卡片背景 |
| `--tpl-card-active-border` | var(--sem-action-primary) | 选中模板左边框色（朱砂） |
| `--tpl-card-hover-bg` | rgba(28,18,8,0.03) | 悬停模板卡片背景 |

## 缓动曲线 / 时长

| CSS 变量 | 值 | 用途 |
|---|---|---|
| `--ease-ink-spread` | cubic-bezier(0.22, 0.61, 0.36, 1) | 进入 |
| `--ease-ink-fade` | cubic-bezier(0.55, 0, 0.68, 0.19) | 退出 |
| `--ease-brush-touch` | cubic-bezier(0.25, 0.1, 0.25, 1) | 交互 |
| `--duration-instant` | 100ms | 微交互 |
| `--duration-fast` | 150ms | 悬停/焦点 |
| `--duration-normal` | 350ms | 进入动画 |
| `--duration-slow` | 450ms | 布局变化 |
