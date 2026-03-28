---
status: approved
author: Lucas
date: 2026-03-26
blocks: [feature]
open_questions: 0
---

# 执行计划：模板系统

## 需求来源

- `docs/product-specs/requirements.md` §2.2 多模板系统（P0）

## 技术依赖

- `docs/design-docs/tech-decisions.md` 决策 4：Typst WASM 渲染
- `.claude/ARCHITECTURE.md`：Config 层存放模板元数据，Service 层存放 Typst 模板源码

## 实现范围

### 1. Config 层：模板元数据

- `src/config/templates.ts`
  - `TemplateMeta` 接口（id、name、description）
  - `TEMPLATES` 常量数组：经典（classic）、双栏（twocolumn）、学术（academic）

### 2. Service 层：Typst 模板源码

- `src/service/typst/templates/twocolumn.typ`
  - 双栏布局，左栏（联系方式 + 技能）右栏（工作/教育/项目）
  - `grid(columns: (0.32fr, 0.68fr))` 分栏

- `src/service/typst/templates/academic.typ`
  - 学术风格，衬线字体，宽边距，`smallcaps` 章节标题
  - 教育经历置于工作经历之前

- `src/service/typst/compiler.ts`
  - 注册新模板到 `TEMPLATES` Record
  - 使用 `?raw` 导入 `.typ` 文件

### 3. UI 层：模板选择器

- `src/ui/pages/EditorPage/EditorPage.tsx`
  - 头部添加模板切换按钮组
  - 切换模板时调用 `handleUpdate({ templateId: t.id })`

## 验收标准（来自 requirements.md §2.2）

- [x] 提供 3 个预置模板（经典、双栏、学术）
- [x] 用户可在编辑器中切换模板
- [x] 切换模板时内容自动适配，不丢失数据
- [x] 模板元数据与 Typst 源码分层存放

## 分层映射

| 文件 | 层 | 依赖 |
|---|---|---|
| `src/config/templates.ts` | Config | Types |
| `src/service/typst/templates/*.typ` | Service | — |
| `src/service/typst/compiler.ts` | Service | Config |
| `src/ui/pages/EditorPage/EditorPage.tsx` | UI | Config, Runtime |

## 完成记录

实现于 2026-03-26，commit `56dc0b9`。
