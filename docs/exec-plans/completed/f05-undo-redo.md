---
status: approved
author: controller
date: 2026-03-28
req: F05
---

# F05 撤销/重做 执行计划

## 目标

为简历编辑器添加撤销/重做功能。用户通过 Ctrl+Z / Ctrl+Shift+Z（Mac: Cmd+Z / Cmd+Shift+Z）撤销和重做编辑操作。

## 方案

**状态快照栈**：在 `updateCurrentResume` 执行前，将当前 `Resume` 对象推入 past 栈。撤销时从 past 弹出恢复，同时将当前状态推入 future 栈。新编辑清空 future 栈。

不引入新依赖，纯 Zustand store 实现。

## 改动文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `src/runtime/store/historyStore.ts` | 新建 | 撤销/重做状态管理 |
| `src/runtime/store/resumeStore.ts` | 修改 | updateCurrentResume 调用前 push snapshot |
| `src/runtime/store/index.ts` | 修改 | 导出 useHistoryStore |
| `src/ui/pages/EditorPage/EditorPage.tsx` | 修改 | 键盘快捷键监听 |
| `tests/unit/historyStore.test.ts` | 新建 | 单元测试 |

## Task 1: historyStore

新建 `src/runtime/store/historyStore.ts`：

```typescript
// @req F05 — 撤销/重做：历史状态管理
import { create } from 'zustand'
import type { Resume } from '@/types'

const MAX_HISTORY = 50

interface HistoryState {
  past: Resume[]
  future: Resume[]
  /** 新编辑前调用，记录当前快照 */
  pushSnapshot: (resume: Resume) => void
  /** 撤销：返回上一个状态，当前状态进入 future */
  undo: (current: Resume) => Resume | null
  /** 重做：返回下一个状态，当前状态进入 past */
  redo: (current: Resume) => Resume | null
  /** 切换简历或关闭时清空 */
  clear: () => void
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],

  pushSnapshot: (resume) => {
    set((state) => ({
      past: [...state.past.slice(-(MAX_HISTORY - 1)), resume],
      future: [], // 新编辑清空 redo 栈
    }))
  },

  undo: (current) => {
    const { past } = get()
    if (past.length === 0) return null
    const previous = past[past.length - 1]!
    set((state) => ({
      past: state.past.slice(0, -1),
      future: [current, ...state.future],
    }))
    return previous
  },

  redo: (current) => {
    const { future } = get()
    if (future.length === 0) return null
    const next = future[0]!
    set((state) => ({
      past: [...state.past, current],
      future: state.future.slice(1),
    }))
    return next
  },

  clear: () => set({ past: [], future: [] }),
}))
```

## Task 2: resumeStore 集成

修改 `src/runtime/store/resumeStore.ts` 的 `updateCurrentResume`：

```typescript
import { useHistoryStore } from './historyStore'

// 在 updateCurrentResume 内，set 之前：
updateCurrentResume: async (changes) => {
  const { currentResume } = get()
  if (!currentResume) return

  // F05: 记录快照用于撤销
  useHistoryStore.getState().pushSnapshot(currentResume)

  const updatedResume = {
    ...currentResume,
    ...changes,
    updatedAt: Date.now(),
  }
  set({ currentResume: updatedResume })
  await resumeService.updateResume(currentResume.id, changes)
},
```

在 `closeResume` 中清空历史：

```typescript
closeResume: () => {
  useHistoryStore.getState().clear()
  set({ currentResume: null })
},
```

## Task 3: store/index.ts 导出

在 `src/runtime/store/index.ts` 添加：

```typescript
export { useHistoryStore } from './historyStore'
```

## Task 4: EditorPage 键盘快捷键

在 `EditorPage.tsx` 中添加键盘监听（所有 hooks 之后、early return 之前）：

```typescript
import { useHistoryStore } from '@/runtime/store'

// 在 EditorPage 组件内，其他 hooks 之后：
const { past, future, undo, redo } = useHistoryStore()

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey
    if (!mod) return

    if (e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      const current = useResumeStore.getState().currentResume
      if (!current) return
      const previous = undo(current)
      if (previous) {
        useResumeStore.setState({ currentResume: previous })
        // 异步持久化恢复的状态
        resumeService.updateResume(previous.id, previous)
      }
    }

    if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
      e.preventDefault()
      const current = useResumeStore.getState().currentResume
      if (!current) return
      const next = redo(current)
      if (next) {
        useResumeStore.setState({ currentResume: next })
        resumeService.updateResume(next.id, next)
      }
    }
  }

  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [undo, redo])
```

注意：undo/redo 直接用 `useResumeStore.setState` 而不是 `updateCurrentResume`，避免触发 pushSnapshot 形成循环。持久化通过直接调 resumeService 完成。

EditorPage 需要新增 import：
```typescript
import * as resumeService from '@/service/resume'
```

**注意**：此 import 违反 UI→Service 分层规则。解决方案：在 resumeStore 中新增一个 `restoreResume` action，供 undo/redo 调用（不触发 pushSnapshot）。EditorPage 只调 store action。

修正方案——在 resumeStore 中添加：

```typescript
/** 恢复到指定状态（undo/redo 专用，不触发 history push） */
restoreResume: async (resume: Resume) => {
  set({ currentResume: resume })
  await resumeService.updateResume(resume.id, resume)
},
```

EditorPage 中改为：

```typescript
const { currentResume, restoreResume } = useResumeStore()

// undo handler:
const previous = undo(current)
if (previous) restoreResume(previous)

// redo handler:
const next = redo(current)
if (next) restoreResume(next)
```

这样 UI 只调 Runtime（restoreResume），不直接触碰 Service。

## Task 5: 单元测试

新建 `tests/unit/historyStore.test.ts`：

测试用例：
1. 初始状态 past/future 为空
2. pushSnapshot 后 past 有 1 项，future 被清空
3. undo 返回上一个状态，current 进入 future
4. redo 返回下一个状态，current 进入 past
5. past 为空时 undo 返回 null
6. future 为空时 redo 返回 null
7. pushSnapshot 超过 MAX_HISTORY 时裁剪 past
8. clear 清空 past 和 future

## 验收标准

- Ctrl+Z 撤销最近一次编辑，内容恢复
- Ctrl+Shift+Z / Ctrl+Y 重做
- 新编辑后 redo 不可用
- 切换简历后历史清空
- 快速连续编辑（如打字）每次都可撤销
- 不引入新依赖
- 分层规则不违反（UI→Runtime→Service）

## 溯源表

| 计划任务 | 需求 ID | 实现文件 | 测试 | 状态 |
|---|---|---|---|---|
| Task 1: historyStore | F05 | src/runtime/store/historyStore.ts | tests/unit/historyStore.test.ts | ✅ |
| Task 2: resumeStore 集成 | F05 | src/runtime/store/resumeStore.ts | — | ✅ |
| Task 3: store/index.ts 导出 | F05 | src/runtime/store/index.ts | — | ✅ |
| Task 4: EditorPage 键盘快捷键 | F05 | src/ui/pages/EditorPage/EditorPage.tsx | — | ✅ |
| Task 5: 单元测试 | F05 | tests/unit/historyStore.test.ts | 10 cases | ✅ |
