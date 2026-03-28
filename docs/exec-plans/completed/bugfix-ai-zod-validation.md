---
status: approved
author: controller
date: 2026-03-28
blocks: [feature]
open_questions: 0
approved_by: Lucas
approved_date: 2026-03-28
req: R3.3
---

# Bug 修复：AI 润色返回数据 Zod 校验失败

## 问题

用户点击"润色"按钮后，AI 返回的 work 条目触发 Zod 验证错误：
- `company`、`position`、`startDate`、`endDate` 字段为 `undefined`
- `workItemSchema` 要求 `z.string()`，不接受 `undefined`

## 根因

1. **prompt 矛盾**：config/ai.ts 中 polish/concise 的 systemPrompt 末尾写"纯文本"，但 optimize.ts 追加"必须 JSON"——矛盾指令导致 AI 返回不完整 JSON
2. **schema 零容错**：Zod schema 所有字段 `z.string()`，AI 少返一个字段就崩

## 审批方案（tech-decisions.md 决策 15）

`response_format: { type: "json_object" }` + 修复 prompt 矛盾指令。

## Task 1: 修复 config/ai.ts prompt 矛盾

从 `polish`、`quantify`、`concise`、`match-job` 四个策略的 `systemPrompt` 末尾删除与 JSON 输出矛盾的指令：

- polish（约第 82 行）：删除 `- 输出格式与输入一致（纯文本）` 和 `- 只输出优化后的文本，不要加解释或前缀`
- quantify（约第 127-129 行）：删除 `- 保留原始信息的核心含义，不编造数据` 后面的 `- 只输出优化后的文本，不要加解释或前缀`
- concise（约第 165-167 行）：删除 `- 输出格式与输入一致（纯文本）` 和 `- 只输出优化后的文本，不要加解释或前缀`
- match-job（约第 205-208 行）：删除 `- 只输出优化后的文本，不要加解释或前缀`

这些格式指令由 `buildSystemMessage` 统一追加（JSON 格式要求），basePrompt 中不应有矛盾的格式指令。

注意：只删除**输出格式**相关的指令，保留实质性的内容指令（如"保留原始信息"、"不编造数据"等）。

## Task 2: optimize.ts 添加 response_format

在 `src/service/ai/optimize.ts` 的 `optimizeResume` 函数中，`client.chat.completions.create()` 调用添加：

```typescript
response_format: { type: 'json_object' as const },
```

注意：**只在 `optimizeResume` 添加**，`classifyUserIntent` 不需要（它返回策略 ID 文本，不是 JSON）。

## Task 3: Zod schema 防御性容错

在 `src/service/ai/parse.ts` 中，将 array-type section 的 schema 字段从 `z.string()` 改为 `z.string().optional().default('')`，防止 AI 偶尔遗漏字段时直接崩溃：

涉及 schema：`workItemSchema`、`educationItemSchema`、`projectItemSchema`、`customItemSchema`。

`personalSchema` 同理。`skillItemSchema` 的 `level` 字段保持 `z.enum()` 不变，`name` 改为 optional default。

## Task 4: 测试

确保现有测试通过。如果有 AI parse 相关测试，验证 partial 返回场景。

## 验收标准

- 点击润色/量化/精简/匹配岗位，不再触发 Zod 校验错误
- AI 返回部分字段时，缺失字段用空字符串填充
- `npx tsc -b --noEmit` 通过
- `npx vitest run` 全部通过

## 溯源表

| 输入条目 | 处理 | 输出位置 | 备注 |
|---|---|---|---|
| Task 1 | 已覆盖 | `src/config/ai.ts` | 关联 `R3.1`, `R3.3`；删除矛盾的纯文本输出指令 |
| Task 2 | 已覆盖 | `src/service/ai/optimize.ts` | 关联 `R3.2`, `R3.3`；添加 `response_format: json_object` |
| Task 3 | 已覆盖 | `src/service/ai/parse.ts` | 关联 `R3.3`；补 schema 防御性容错 |
| Task 4 | 已覆盖 | `tests/unit/parse.test.ts` | 关联 `R3.3`；补 partial 返回测试 |
