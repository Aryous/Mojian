# 架构文档

> 此文件是分层规则的权威来源。变更需人类审批。

## 域分层模型

```
┌─────────────────────────────────────────┐
│                   UI                    │  页面、组件、动画
├─────────────────────────────────────────┤
│                 Runtime                 │  状态管理、事件、路由
├─────────────────────────────────────────┤
│                 Service                 │  AI服务、Typst渲染、导出
├─────────────────────────────────────────┤
│                  Repo                   │  简历持久化、模板存储、用户数据
├─────────────────────────────────────────┤
│                  Config                 │  AI供应商配置、模板配置、主题
├─────────────────────────────────────────┤
│                  Types                  │  所有 TypeScript 类型定义
└─────────────────────────────────────────┘
```

## 依赖规则

**允许向下依赖，禁止向上依赖，禁止跨层依赖。**

| 层 | 可引用 | 禁止引用 |
|---|---|---|
| UI | Types, Config, Runtime | Repo, Service |
| Runtime | Types, Config, Service | UI, Repo |
| Service | Types, Config, Repo | UI, Runtime |
| Repo | Types, Config | UI, Runtime, Service |
| Config | Types | 其余所有层 |
| Types | — | 其余所有层 |

## 横切关注点 (Cross-cutting)

以下模块通过单一显式接口进入，不遵循常规分层：

- **AI Provider**：`src/service/ai/provider.ts` 是唯一入口
- **Design Tokens**：`src/ui/tokens/` 是唯一来源
- **Telemetry**：`src/service/telemetry.ts`（待建）

## 目录结构映射

```
src/
├── types/          ← Types 层
├── config/         ← Config 层
├── repo/           ← Repo 层
│   ├── resume/
│   ├── template/
│   └── user/
├── service/        ← Service 层
│   ├── ai/         ← 所有 AI 调用的唯一入口
│   │   ├── provider.ts
│   │   ├── scoring.ts
│   │   └── optimize.ts
│   ├── typst/      ← Typst 渲染服务
│   └── export/     ← 导出服务 (PDF, DOCX)
├── runtime/        ← Runtime 层
│   └── store/
└── ui/             ← UI 层
    ├── tokens/     ← 设计令牌（唯一真实来源）
    ├── components/ ← 原子组件
    ├── patterns/   ← 组合模式
    └── pages/      ← 页面级视图
```

## 执行方式（三层约束）

### 硬约束（阶段 3 搭建，自动运行）

以下在每次提交时机械执行，Agent 和人类均无法绕过：

- **自定义 ESLint 规则**：检测跨层 import 违规，报错信息包含修复指令
- **结构测试**：验证 src/ 目录结构与本文档一致
- **CI 流水线**：以上检查 + 类型检查 + 单元测试，任一失败阻断合并

Lint 报错信息示例（供 Agent 直接消费）：
```
❌ 错误: UI 层 (src/ui/ResumeCard.tsx) 禁止引用 Service 层 (src/service/ai/scoring)。
   修复: 通过 Runtime 层获取数据。在 src/runtime/store/ 中创建对应 hook，
   由 Runtime 调用 Service，UI 调用 Runtime。
   参考: ARCHITECTURE.md 依赖规则表。
```

### 中约束（.claude/rules/，自动注入）

Agent 工作时自动加载到上下文，无需主动读取：
- `.claude/rules/architecture.md` — 分层规则
- `.claude/rules/ai-service.md` — AI 调用规范
- `.claude/rules/ui/design-tokens.md` — 设计令牌约束（仅 src/ui/ 生效）

### 软约束（docs/，按需读取）

Agent 需主动读取，提供上下文和决策依据：
- `docs/DESIGN.md`、`docs/product-specs/`、`docs/references/`

### 升级原则

当中约束被反复违反时，将其编码为 lint 规则升级为硬约束。
