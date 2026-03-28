---
status: approved
author: Lucas
date: 2026-03-26
blocks: [feature]
open_questions: 0
---

# 执行计划：AI 智能优化

## 需求来源

- `docs/product-specs/requirements.md` §3.1 AI 优化选项（P0）
- `docs/product-specs/requirements.md` §3.2 多 AI 供应商配置（P1）

## 技术依赖

- `docs/design-docs/tech-decisions.md` 决策 6：OpenAI SDK via OpenRouter
- `.claude/ARCHITECTURE.md`：AI 调用唯一入口 `src/service/ai/provider.ts`

## 实现范围

### 1. Config 层：AI 配置

- `src/config/ai.ts`
  - OpenRouter baseURL、默认 model
  - 优化选项定义（润色表述、量化成果、精简内容、匹配岗位）
  - 每个选项包含 id、name、description、system prompt 模板

### 2. Repo 层：API Key 持久化

- `src/repo/settings.ts`
  - 使用 localStorage 存储用户 API Key（简单键值，不需要 Dexie）
  - `getApiKey()` / `setApiKey()` / `clearApiKey()`

### 3. Service 层：AI Provider + Optimize

- `src/service/ai/provider.ts`
  - 创建 OpenAI SDK 实例，baseURL 指向 OpenRouter
  - API Key 从 Repo 层读取
  - 导出 `getAiClient()` 函数（懒初始化）

- `src/service/ai/optimize.ts`
  - `optimizeContent(content: string, optionId: string): Promise<string>`
  - 根据 optionId 加载对应 prompt 模板
  - 调用 OpenAI SDK chat completions
  - 返回优化后的文本

### 4. Runtime 层：AI Store

- `src/runtime/store/aiStore.ts`
  - 状态：apiKey, optimizing, result, error
  - Actions：setApiKey, optimize, clearResult
  - 调用 Service 层方法

### 5. UI 层

- `src/ui/pages/EditorPage/AiPanel.tsx`
  - API Key 配置入口（首次使用时提示输入）
  - 优化选项列表（卡片式）
  - 优化结果预览（对比 before/after）
  - 接受/拒绝按钮

- 集成到 `EditorPage.tsx`
  - 在编辑器下方或侧边添加 AI 面板入口

## 验收标准（来自 requirements.md）

- [ ] 用户可以看到 AI 优化选项列表，每个选项有名称和描述
- [ ] 选择选项后，AI 返回优化建议
- [ ] 用户可以接受或拒绝建议
- [ ] API Key 配置入口清晰，操作不超过 3 步
- [ ] API 调用失败时有清晰错误提示
- [ ] 所有 AI 调用经过 `src/service/ai/provider.ts`

## 分层映射

| 文件 | 层 | 依赖 |
|---|---|---|
| `src/config/ai.ts` | Config | Types |
| `src/repo/settings.ts` | Repo | Types, Config |
| `src/service/ai/provider.ts` | Service | Types, Config, Repo |
| `src/service/ai/optimize.ts` | Service | Types, Config, Repo |
| `src/runtime/store/aiStore.ts` | Runtime | Types, Config, Service |
| `src/ui/pages/EditorPage/AiPanel.tsx` | UI | Types, Config, Runtime |
