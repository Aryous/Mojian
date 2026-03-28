---
status: approved
author: controller
date: 2026-03-28
req: F19
---

# F19 API Key 存储安全 执行计划

## 目标

将 API Key 存储从 localStorage 迁移到 sessionStorage，缩小被动泄露面。

## 方案

tech-decisions.md 决策 16：sessionStorage 替代 localStorage。关闭标签页即清除，刷新保持。

## 改动文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `src/repo/settings.ts` | 修改 | 3 处 `localStorage` → `sessionStorage` |
| `src/config/ai.ts` | 修改 | 存储键名注释更新（说明已改为 sessionStorage） |
| `tests/unit/settings.test.ts` | 新建 | 验证 sessionStorage 读写行为 |

## Task 1: 迁移 repo/settings.ts

将 `src/repo/settings.ts` 中的 3 处调用从 `localStorage` 改为 `sessionStorage`：

- `getApiKey`: `localStorage.getItem` → `sessionStorage.getItem`
- `setApiKey`: `localStorage.setItem` → `sessionStorage.setItem`
- `clearApiKey`: `localStorage.removeItem` → `sessionStorage.removeItem`

添加 `@req F19` 标注。

## Task 2: 更新 config/ai.ts 注释

`AI_API_KEY_STORAGE_KEY` 的注释从 `localStorage` 改为 `sessionStorage`。

## Task 3: 单元测试

新建 `tests/unit/settings.test.ts`：

测试用例：
1. setApiKey 写入 sessionStorage
2. getApiKey 从 sessionStorage 读取
3. clearApiKey 从 sessionStorage 移除
4. localStorage 中无残留

## 验收标准

- API Key 存储在 sessionStorage 而非 localStorage
- 刷新页面后 key 仍在
- 关闭标签页后 key 清除
- `npx tsc -b --noEmit` 通过
- `npx vitest run` 通过
