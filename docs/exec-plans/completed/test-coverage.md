---
status: approved
author: Lucas
date: 2026-03-26
blocks: [feature]
open_questions: 0
---

# 执行计划：补充测试覆盖

## 背景

Feature 切片 3-5 实现时未编写测试（P1 技术债）。需要为 Config、Repo、Service、Runtime 层的核心逻辑补充单元测试。

## 测试范围

### 1. Config 层测试 — `tests/unit/config.test.ts`

- `templates.ts`：TEMPLATES 数组完整性（3 个模板，每个有 id/name/description）
- `ai.ts`：AI_OPTIMIZE_OPTIONS 完整性（4 个选项，每个有 id/name/description/systemPrompt）
- 常量值校验（AI_BASE_URL 指向 openrouter）

### 2. Repo 层测试 — `tests/unit/repo.test.ts`

- `resume.ts`：createResume 返回完整 Resume 结构、getResume 能取回、listResumes 按时间排序、updateResume 更新字段、deleteResume 删除后取不到
- `settings.ts`：getApiKey/setApiKey/clearApiKey 的读写清三步

### 3. Service 层测试 — `tests/unit/service.test.ts`

- `ai/optimize.ts`：未知 optionId 抛错、API Key 未配置时 getAiClient 抛错
- `typst/compiler.ts`：getTemplateIds 返回 3 个模板 ID

### 4. Runtime 层测试 — `tests/unit/store.test.ts`

- `resumeStore`：loadResumes/createResume/openResume/updateCurrentResume/deleteResume 状态流转
- `aiStore`：loadApiKey/setApiKey/removeApiKey 状态流转
- `previewStore`：compile 后 artifact 非空（需要 mock compileToVector）

## 技术约束

- 使用 vitest，与现有 `tests/structure/` 平行放置在 `tests/unit/`
- Repo 层测试需要 fake-indexeddb 模拟 IndexedDB（Dexie 在 Node 环境需要 polyfill）
- Service/AI 测试不实际调用 API，只测边界条件和错误路径
- Typst 编译器测试只测 getTemplateIds（实际编译需要 WASM，不适合单元测试）

## 验收标准

- [ ] `npx vitest run` 所有测试通过
- [ ] 测试覆盖 Config/Repo/Service/Runtime 四层
- [ ] 无需安装新依赖（fake-indexeddb 除外，如需要）
