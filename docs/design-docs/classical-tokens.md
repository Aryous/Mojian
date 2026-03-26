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
