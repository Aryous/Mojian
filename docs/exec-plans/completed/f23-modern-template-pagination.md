---
status: approved
author: controller
date: 2026-03-28
req: F23
---

# F23 Modern 模板分页修复 执行计划

## 目标

修复 modern 模板内容超过一页时溢出截断的问题，使其支持 Typst 原生多页分页。

## 根因

`modern.typ` 使用 `#grid` + `rect(height: 100%)` 布局，将所有内容锁在固定高度的单元格内。Typst 无法对 `rect(height: 100%)` 内的内容自动分页。

## 方案

**每页重绘边栏**：用 `page` 的 `background` 属性放置左侧深色矩形，主内容区域通过正常的 margin 和流式布局实现自然分页。

核心改动：
1. 将左侧边栏从 grid 单元格改为 `page(background: ...)` 中的绝对定位矩形
2. 边栏内容（个人信息、技能、教育）放在首页的 `place()` 中
3. 主内容区域使用正常的 margin（左侧留出边栏宽度），让 Typst 自然分页
4. 后续页面自动获得深色背景条（来自 page background），但边栏文字只在首页

## 改动文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `src/service/typst/templates/modern.typ` | 修改 | 重构布局：grid+rect → page background + 流式内容 |

## Task 1: 重构 modern.typ 布局

将当前的 `#grid(columns: ...)` + `rect(height: 100%)` 布局改为：

```typst
#set page(
  paper: "a4",
  margin: (top: 2cm, bottom: 2cm, left: 7.8cm, right: 1.8cm),
  background: place(left, rect(width: 6.4cm, height: 100%, fill: dark-bg)),
)
```

- 左侧 margin 设为 `6.4cm(边栏宽) + 1.4cm(间距) = 7.8cm`
- `background` 每页自动绘制深色矩形
- 边栏内容用 `place(left + top, ...)` 绝对定位在首页
- 主内容区域正常流式排版，Typst 自动分页

边栏内容（姓名、联系方式、技能、教育）用 `place()` 放在首页左侧区域内。

主内容（个人简介、工作经历、项目经验）直接作为页面正文流式排列。

添加 `@req F23` 标注（在模板文件头部注释中）。

注意事项：
- 保持现有视觉效果不变（颜色、字号、间距）
- 辅助函数（`section-heading`、`sidebar-heading`、`date-range`、`render-md`）不需要改动
- 确认单页简历的渲染结果与修改前一致
- 多页时第二页只有深色背景条，无边栏文字（这是预期行为）

## 验收标准

- 单页简历：视觉效果与修改前一致
- 多页简历：内容自然分页，不截断不溢出
- 每页左侧保留深色背景条
- PDF 导出正确
- `npx tsc -b --noEmit` 通过
- `npx vitest run` 通过
