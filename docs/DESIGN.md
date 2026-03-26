# 墨简设计系统

> 此文件是设计系统的入口索引。完整规范见 `design-spec.md`。

## 完整规范

→ **[docs/design-docs/design-spec.md](design-docs/design-spec.md)** — 权威设计规范（8 章，含色彩/字体/间距/组件/动画/响应式/无障碍）

## 设计哲学（摘要）

墨简的视觉语言来自中国古典文人书房：**宣纸上落墨的克制感，印章的仪式感，窗棂的秩序感**。

每个古风元素都有功能对应：
- **宣纸** → 内容承载面
- **墨** → 文字与线条
- **印章** → 确认性操作
- **窗棂** → 结构与导航
- **祥云** → 装饰与空态
- **墨砚** → AI 功能区域

## 色彩体系（摘要）

三层令牌：L1 基础色（中国传统色）→ L2 语义色 → L3 组件色

核心基础色：
| 色名 | 色值 | 用途 |
|---|---|---|
| 玄色（浓墨） | `#1C1208` | 标题、主文字 |
| 宣纸本色 | `#F5EDD6` | 页面背景 |
| 朱砂 | `#C23B22` | 主操作 |
| 青瓷 | `#7BA05B` | 成功状态 |
| 靛青 | `#1B4965` | AI/信息 |

## 字体体系（摘要）

- **标题**：霞鹜文楷 (LXGW WenKai) — CDN 懒加载
- **正文**：系统字体栈（PingFang SC / Microsoft YaHei / system-ui）
- **印章**：霞鹜文楷 Bold

## 动画哲学（摘要）

**水墨物理学**：
- 进入：墨水扩散，`ease-out`，300-400ms
- 退出：墨迹褪去，`ease-in`，150-250ms
- 悬停：毛笔触纸，`scale(0.98)`
- 加载：墨水晕染循环

## 参考资料

→ [docs/references/design-inspiration.md](references/design-inspiration.md) — 调研来源与洞察
→ [docs/design-docs/classical-tokens.md](design-docs/classical-tokens.md) — 令牌定义（阶段 B 产出）
