# 分层依赖规则

所有代码必须遵守以下分层约束，这是墨简的核心架构不变量。

## 依赖方向

Types → Config → Repo → Service → Runtime → UI

允许向下依赖，**禁止向上依赖，禁止跨层依赖**。

## 具体规则

- `src/ui/` 只能引用 `src/types/`、`src/config/`、`src/runtime/`
- `src/ui/` **禁止**引用 `src/repo/` 或 `src/service/`
- `src/service/` **禁止**引用 `src/ui/` 或 `src/runtime/`
- `src/repo/` **禁止**引用 `src/service/`、`src/runtime/`、`src/ui/`

## 横切关注点

以下模块是唯一入口，不遵循常规分层：
- AI Provider：`src/service/ai/provider.ts`
- Design Tokens：`src/ui/tokens/`

## 违反时怎么做

如果你发现自己需要跨层引用，说明设计有问题。不要绕过规则，而是：
1. 检查是否应该通过 Runtime 层中转
2. 检查是否应该将共享逻辑下沉到 Types 或 Config 层
3. 如果以上都不适用，在 PR 中说明原因，请求人类审批
