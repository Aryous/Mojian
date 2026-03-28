---
status: approved
author: architecture-bootstrap
date: 2026-03-28
blocks: [tech-selection, design, feature]
open_questions: 0
approved_by: Lucas
approved_date: 2026-03-28
---

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

## 机械化强制执行

分层规则通过以下手段机械化执行，Agent 和人类均无法绕过：

- **自定义 ESLint 规则**：检测跨层 import 违规，报错信息包含修复指令
- **结构测试**：验证 src/ 目录结构与本文档一致
- **CI 流水线**：以上检查 + 类型检查 + 单元测试，任一失败阻断合并

Lint 报错信息示例（供 Agent 直接消费）：
```
❌ 错误: UI 层 (src/ui/ResumeCard.tsx) 禁止引用 Service 层 (src/service/ai/scoring)。
   修复: 通过 Runtime 层获取数据。在 src/runtime/store/ 中创建对应 hook，
   由 Runtime 调用 Service，UI 调用 Runtime。
   参考: .claude/ARCHITECTURE.md 依赖规则表。
```

## 溯源表

| 输入条目 | 处理 | 输出位置 | 备注 |
|---|---|---|---|
| R1.1 简历内容编辑 | 已覆盖 | §域分层模型, §目录结构映射 | 编辑器走 UI → Runtime → Service / Repo |
| R1.2 简历持久化 | 已覆盖 | §域分层模型, §目录结构映射 | 持久化边界收敛到 Repo |
| R2.1 简历渲染 | 已覆盖 | §横切关注点, §目录结构映射 | Typst 渲染收敛到 Service |
| R2.2 多模板系统 | 已覆盖 | §目录结构映射 | 模板元数据与模板源码分层存放 |
| R3.2 多 AI 供应商配置 | 已覆盖 | §横切关注点 | AI Provider 通过唯一入口进入 |
| R3.3 AI 上下文工程 | 已覆盖 | §横切关注点, §目录结构映射 | AI 调用统一从 `src/service/ai/` 进入 |
| R4.1 古风视觉体系 | 已覆盖 | §横切关注点, §目录结构映射 | Design Tokens 是 UI 层唯一来源 |
