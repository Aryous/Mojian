---
status: approved
author: controller
date: 2026-03-28
req: F14
---

# F14 Skills Section 墨灵润色入口 执行计划

## 目标

移除 skills section 对墨灵润色按钮的排除条件，使 skills 与其他 section 一样拥有 AI 润色入口。

## 根因

`EditorPage.tsx` 第 60 行 `section.type !== 'skills'` 条件硬编码排除了 skills section 的墨灵按钮。裁决确认这是实现遗漏，非有意设计。

## 改动文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `src/ui/pages/EditorPage/EditorPage.tsx` | 修改 | 移除 `section.type !== 'skills'` 条件 |
| `tests/unit/editorSkillsAi.test.ts` | 新建 | 验证 skills section 渲染墨灵按钮 |

## Task 1: 移除排除条件

在 `EditorPage.tsx` 中，将：

```tsx
{section.type !== 'skills' && (
  <button
    type="button"
    className={styles.sectionAiBtn}
    onClick={() => onAi(section.type)}
    aria-label={`墨灵润色${section.title}`}
  >
```

改为：

```tsx
{(
  <button
    type="button"
    className={styles.sectionAiBtn}
    onClick={() => onAi(section.type)}
    aria-label={`墨灵润色${section.title}`}
  >
```

即删除 `section.type !== 'skills' &&` 条件，保留按钮渲染。

在修改处添加 `@req F14` 标注。

## Task 2: 单元测试

新建 `tests/unit/editorSkillsAi.test.ts`，验证 skills section 渲染了墨灵按钮（aria-label 包含"墨灵润色"）。

## 验收标准

- skills section 旁显示墨灵润色按钮
- 点击按钮正常触发 AI 面板
- `npx tsc -b --noEmit` 通过
- `npx vitest run` 通过
