---
status: approved
author: Lucas
date: 2026-03-26
blocks: [feature]
open_questions: 0
---

# 执行计划：PDF 导出

## 需求来源

- `docs/product-specs/requirements.md` §2.3 简历导出（P1）

## 技术依赖

- `docs/design-docs/tech-decisions.md` 决策 4：Typst WASM 渲染
- 切片 2（Typst 渲染）已完成，`compileToPdf` 函数可用

## 实现范围

### 1. Service 层：PDF 编译

- `src/service/typst/compiler.ts`
  - `compileToPdf(resume: Resume): Promise<Uint8Array>` 已在切片 2 实现
  - 复用现有 Typst WASM 编译器实例

### 2. Runtime 层：导出状态管理

- `src/runtime/store/previewStore.ts`
  - 新增 `exporting` 状态
  - `exportPdf(resume)` action：调用 `compileToPdf` → 创建 Blob → 触发下载
  - 文件名使用 `resume.title || '简历'`

### 3. UI 层：导出按钮

- `src/ui/pages/EditorPage/ResumePreview.tsx`
  - 预览区头部添加"导出 PDF"按钮
  - 导出中显示 loading 状态

## 验收标准（来自 requirements.md §2.3）

- [x] 用户可一键导出当前简历为 PDF
- [x] 导出按钮位于预览区，位置直观
- [x] 导出中有 loading 反馈
- [x] PDF 通过 Typst 原生渲染，文字可选中可搜索

## 分层映射

| 文件 | 层 | 依赖 |
|---|---|---|
| `src/service/typst/compiler.ts` | Service | Types, Config |
| `src/runtime/store/previewStore.ts` | Runtime | Types, Service |
| `src/ui/pages/EditorPage/ResumePreview.tsx` | UI | Runtime |

## 完成记录

实现于 2026-03-26，commit `1c569b2`。
