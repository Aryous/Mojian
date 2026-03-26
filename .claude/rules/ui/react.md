---
paths:
  - "src/ui/**/*.tsx"
  - "src/ui/**/*.ts"
  - "src/runtime/**/*.ts"
---

# React 编码规则

所有 `src/ui/` 和 `src/runtime/` 中的 React 代码必须遵守以下规则。

## Hooks 规则（零容忍）

**所有 hooks 必须在组件函数体顶部调用，禁止在条件分支或 early return 之后调用。**

### 正确做法

```tsx
function MyPage() {
  const data = useStore()
  const memo = useMemo(() => compute(data), [data])  // ← hooks 先全部声明
  const handler = useCallback(() => { ... }, [data])

  if (loading) return <Loading />     // ← early return 在所有 hooks 之后
  if (!data) return <Empty />

  return <div>{memo}</div>
}
```

### 禁止做法

```tsx
function MyPage() {
  const data = useStore()

  if (loading) return <Loading />     // ❌ early return 在 useMemo 之前

  const memo = useMemo(() => ..., [data])  // ❌ 渲染间 hooks 数量不一致 → 白屏
  return <div>{memo}</div>
}
```

**为什么**：React 通过调用顺序追踪 hooks。如果某次渲染走了 early return 跳过了部分 hooks，下次渲染到达它们时 hooks 数量不匹配，React 会抛出 "Rendered more hooks than during the previous render" 并白屏崩溃。

## 组件规范

- 每个组件一个文件，文件名与组件名一致（PascalCase）
- 样式使用同名 `.module.css`，通过 `styles.xxx` 引用
- 事件处理函数用 `useCallback` 包裹（当传递给子组件时）
- 组件 props 接口定义在组件文件内，不单独导出（除非被多处引用）
