---
status: approved
author: Lucas
date: 2026-03-26
priority: P0
requirements: [§4.1 古风视觉体系, §4.2 原子化设计组件, §5.1 降低认知负担]
---

# 执行计划：UI 全面优化（design agent 阶段 B）

## 目标

基于已审批的 design-spec.md，全面提升现有 UI 的视觉质量和交互体验。当前 UI 是功能骨架，需要按设计规范落地古风视觉。

## 背景

现有 UI 问题：
- 组件样式粗糙，未完全遵循 design-spec.md 中的组件规范
- 编辑器布局比例失调（编辑区过宽，预览区过小）
- 输入框无有意义的 placeholder
- 缺少古风装饰元素（窗棂、祥云纹理实际效果）
- 无水墨动画
- AI 面板应为右侧抽屉（design-spec §5.3），当前是内嵌

## 实施范围

### 1. 令牌系统完善
- 检查 `src/ui/tokens/index.css` 是否完整包含 design-spec 中所有令牌
- 确保所有组件通过令牌引用，无裸色值

### 2. 原子组件按规范打磨
- SealButton：微旋转、磨损质感、hover/focus 状态
- PaperCard：宣纸纤维纹理（CSS 噪点方案）
- InkInput：底边框聚焦动画、标签上浮
- InkDivider：SVG 贝塞尔手绘线条
- CloudEmpty：祥云 SVG
- LatticePattern：万字纹 SVG pattern
- InkTag、InkTooltip：按规范调整

### 3. 页面级布局重构
- EditorPage 双栏比例：编辑 55% / 预览 45%
- 顶部 TopToolbar：品牌标识 + 模板切换 + 导出
- AI 面板改为右侧抽屉（360px，滑入滑出）

### 4. 编辑器体验
- SectionEditor 输入框使用 InkInput 组件
- 添加有意义的 placeholder 文字
- 模块标题用霞鹜文楷

### 5. 动画
- 组件进出动画（Motion，ink-spread / ink-fade 缓动）
- 印章按钮悬停效果
- prefers-reduced-motion 支持

## 验收标准

- [ ] 所有组件样式符合 design-spec.md §5 组件规范
- [ ] 编辑器双栏比例 55/45，预览区可视
- [ ] AI 面板为右侧抽屉
- [ ] 输入框有 placeholder，使用 InkInput
- [ ] 动画缓动曲线使用令牌定义的贝塞尔值
- [ ] `npx tsc -b --noEmit` 通过
- [ ] `npx eslint src/` 通过
- [ ] `npx vitest run` 全部通过

## 涉及文件

```
src/ui/tokens/index.css
src/ui/components/**/*
src/ui/pages/EditorPage/*
src/ui/pages/HomePage/*
```
