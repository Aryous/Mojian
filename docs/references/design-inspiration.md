# 古风设计参考资料

> 由 design agent 通过 WebSearch 补充（2026-03-26）。
> 格式：来源 + 关键洞察 + 墨简适用建议。

---

## 1. 中国传统色体系

**来源**：[zhongguose.com](https://zhongguose.com/en) — 收录 560 种传统色，含 CMYK/RGB/HEX
**来源**：[满庭芳·国色 47 色卡](https://www.dazuoshe.com/mantingfangguosezuiquan47zho/) — 高清色卡 + RGB/CMYK/HEX
**来源**：[Pixso 传统中国风配色](https://pixso.cn/designskills/traditional-chinese-color-matching/)

**关键洞察**：
- 中国传统色源自《色谱》（中国社科院信息委员会编），每色有文化命名（如"朱砂"源于矿物，"青瓷"源于宋代瓷器）
- 传统色以低饱和、高灰度为主调，与西方色彩体系的高饱和倾向形成对比
- 色名本身携带文化信息（"墨"暗示书写、"砂"暗示矿物质感、"纸"暗示承载面）

**墨简适用建议**：
- L1 基础色直接从传统色谱中提取，保留原始色名
- 语义色映射时利用色名的文化含义（如"朱砂"天然关联"印章/确认"）
- 避免高饱和度色彩，保持文人画的克制感

---

## 2. 古风 UI 设计模式

**来源**：[知乎·中国风网页设计](https://zhuanlan.zhihu.com/p/434616969) — 中国风网页设计方法论
**来源**：[GitHub·Chinese-style-UI-design](https://github.com/Kqp1227/Chinese-style-UI-design) — 开源古风 UI 实现
**来源**：[Dribbble·Chinese UI](https://dribbble.com/tags/chinese_ui) — 设计社区案例

**关键洞察**：
- 古风 UI 的核心不是堆砌元素，而是**留白与节奏**——类似国画的"计白当黑"
- 常见失败模式：过度拟物化（把界面做成实物仿真），导致可用性下降
- 成功案例的共性：用**纹理暗示材质**（而非照片级模拟），用**线条暗示结构**（而非厚重边框）

**墨简适用建议**：
- 宣纸质感用细腻噪点纹理实现，透明度 3-8%，避免照片级纹理
- 窗棂用 SVG 线条表达，保持对称性但不过度复杂
- 印章用径向渐变 + 微旋转，而非写实图片

---

## 3. 窗棂 CSS 实现

**来源**：[yuanchuan.dev·Chinese Window Lattice and CSS](https://yuanchuan.dev/2019/05/15/window-lattice-and-css/) — CSS 窗棂图案

**关键洞察**：
- CSS `background-image` 的 `repeating-linear-gradient` 可组合出对称窗棂图案
- `-webkit-box-reflect` 可创建镜像对称效果
- SVG `pattern` 元素最适合可缩放的窗棂边框

**墨简适用建议**：
- 导航分割线和面板边框使用简化版窗棂图案（万字纹或回纹）
- 用 SVG `<pattern>` 定义，通过 CSS 变量控制颜色
- 保持线条细度（1-1.5px），避免视觉沉重

---

## 4. 宣纸纹理 CSS

**来源**：[Subframe·10 CSS Paper Effects](https://www.subframe.com/tips/css-paper-effect-examples)
**来源**：[Medium·CSS Texture Overlay](https://medium.com/@erikritter/css-snippets-add-a-texture-overlay-to-an-entire-webpage-b0bfdfd02c45)
**来源**：[Transparent Textures](https://www.transparenttextures.com/textured-paper.html)
**来源**：[Paper Texture Shader](https://shaders.paper.design/paper-texture)

**关键洞察**：
- 纹理叠加层使用 `mix-blend-mode: multiply` + `pointer-events: none`
- CSS 纯色噪点可用 `background-image: url("data:image/svg+xml,...")` 内联 SVG 实现，无额外请求
- 多层渐变叠加可模拟纸张纤维方向感

**墨简适用建议**：
- 全局宣纸纹理用 CSS 伪元素叠加，`opacity: 0.03-0.08`
- 内容卡片用稍重的纹理（`opacity: 0.05-0.10`）区分层次
- 纹理图片尺寸 ≤ 5KB（base64 内联）或使用纯 CSS 噪点

---

## 5. 水墨动画

**来源**：[Motion (Framer Motion) 官方文档](https://motion.dev/)
**来源**：[Motion Easing Functions](https://motion.dev/docs/easing-functions)
**来源**：[Motion Transition API](https://www.framer.com/motion/transition/)

**关键洞察**：
- Motion 的 `AnimatePresence` 是 React 中实现退出动画的标准方案
- 自定义贝塞尔曲线 `cubic-bezier(0.22, 0.61, 0.36, 1)` 接近墨水在宣纸上扩散的减速感
- `layout` prop 可自动处理模板切换时的 FLIP 布局动画
- 物理属性（x, scale）默认用 spring，透明度/颜色默认用 tween

**墨简适用建议**：
- 定义"墨韵"缓动曲线：`[0.22, 0.61, 0.36, 1]`（进入）、`[0.55, 0.0, 0.68, 0.19]`（退出）
- 加载动画：径向渐变从中心扩散 + opacity 渐变，模拟墨水晕染
- 所有动画必须响应 `prefers-reduced-motion`

---

## 6. 字体方案

**来源**：[霞鹜文楷 (LXGW WenKai) GitHub](https://github.com/lxgw/LxgwWenkaiGB) — 开源中文字体
**来源**：[LXGW WenKai Web CDN](https://github.com/CMBill/lxgw-wenkai-web) — Web 字体分包方案

**关键洞察**：
- 霞鹜文楷：开源免费商用（SIL OFL 1.1），融合仿宋与楷体特点，兼具可读性与古风韵味
- 有 Screen 版本（屏幕优化）和 GB 版本（国标字形）
- CDN 分包方案已成熟：`@callmebill/lxgw-wenkai-web` 通过 JSDelivr/cdnjs 分发
- 字体子集化技术可将全量 10MB+ 的字体文件按需加载

**墨简适用建议**：
- 标题/装饰文字用霞鹜文楷（CDN 懒加载，已裁决方案 B）
- 正文用系统字体栈：`"PingFang SC", "Microsoft YaHei", "Noto Sans SC", system-ui, sans-serif`
- 印章文字用霞鹜文楷粗体变体，配合朱砂色

---

## 7. 印章效果 CSS

**来源**：[CodePen·Rubber Stamp Effect](https://codepen.io/555/pen/pdwvBP)
**来源**：[CSS-Shape·Stamp](https://css-shape.com/stamp/)

**关键洞察**：
- 印章效果核心：方形/圆形边框 + 朱砂色 + 微旋转（1-3deg）
- 磨损感通过 `mask-image` 叠加噪点纹理实现
- `box-shadow` 模拟印泥渗透效果

**墨简适用建议**：
- 主操作按钮采用方形印章风格（极小圆角 2px）
- 通过 CSS `mask-image` + SVG 噪点实现印章磨损质感
- 悬停时微旋转（rotate: -1deg → 0deg）模拟盖章动作
