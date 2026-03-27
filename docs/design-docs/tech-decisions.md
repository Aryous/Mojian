---
status: approved
author: tech-selection
date: 2026-03-27
blocks: [design, feature]
open_questions: 1
note: 决策 1-10 已于 2026-03-26 approved，决策 11-14 为 3.3 AI 上下文工程新增，待审批
prev_approved_by: Lucas
prev_approved_date: 2026-03-26
---

# 技术选型决策记录

> 由 tech-selection agent 基于 requirements.md (approved) 和 ARCHITECTURE.md 输出。
> 每项决策记录候选方案、最终选择、未选原因。禁止模糊表述。

---

## 决策 1：前端框架

**日期**：2026-03-26

**背景**：墨简是纯客户端 SPA（已裁决：无云端账户系统、纯浏览器本地存储），需要一个能承载古风设计系统、Typst WASM 集成、富文本编辑器和 AI 交互的前端框架。框架选择直接影响整个生态链（状态管理、动画库、编辑器组件的可选范围）。

**候选方案**：

| 维度 | React 19 | Vue 3 | Svelte 5 |
|---|---|---|---|
| Agent 可读性 | 极高。React 在 AI 模型训练集中覆盖度最大，文档生态最成熟 | 高。文档质量优秀，但生态体量次于 React | 中。文档优秀但训练集覆盖度明显低于 React/Vue |
| 生态完整度 | Typst WASM 有官方 React 绑定 (@myriaddreamin/typst.react)；TipTap/Slate 原生 React 支持；Motion(Framer Motion)原生 React 支持 | Typst 无官方 Vue 绑定；TipTap 有 Vue 支持；GSAP 框架无关 | Typst 无 Svelte 绑定；TipTap 无 Svelte 官方支持；动画生态薄弱 |
| 古风 UI 适配 | CSS 方案无限制，任意方案均可 | 同 | 同 |
| 维护成本 | Meta 维护，社区最大，npm 周下载量最高 | Evan You 团队维护，社区活跃 | 社区较小，企业采用率低 |

**决策**：React 19

**理由**：
1. **生态匹配度最高**：Typst.ts 提供官方 React 绑定 `@myriaddreamin/typst.react`，省去自行封装 WASM 的成本
2. **Agent 可读性最佳**：React 在 AI 训练集中的覆盖度最大，Agent 生成 React 代码的准确率和一致性最高
3. **下游选型空间最大**：状态管理（Zustand/Jotai）、编辑器（TipTap/Slate）、动画（Motion）均有 React 原生支持
4. **TypeScript 配合成熟**：React + TypeScript 组合已高度稳定，符合架构分层中 Types 层的需求

**未选原因**：
- **Vue 3**：虽然文档质量优秀且上手快，但 Typst.ts 无官方 Vue 绑定（需自行封装 WASM），Agent 训练集覆盖度次于 React，与关键下游依赖（Typst.react）的集成便利性差距明显
- **Svelte 5**：编译时优化性能好，但生态链缺口严重——无 Typst 绑定、TipTap 无官方 Svelte 支持、动画库生态薄弱。一个古风设计系统项目需要大量自定义 UI 组件，Svelte 生态的库匹配度不足以支撑

**约束条件**：本决策以 Typst.ts 提供稳定 React 绑定为前提。若 `@myriaddreamin/typst.react` 在集成阶段发现严重兼容问题，需重新评估。

---

## 决策 2：构建工具

**日期**：2026-03-26

**背景**：墨简是纯客户端 SPA，不需要 SSR/SSG，不需要 SEO（简历编辑器是工具型应用）。需要支持 WASM 加载（Typst），构建产物部署到任意静态托管。

**候选方案**：

| 维度 | Vite 6 | Next.js 15 | Remix |
|---|---|---|---|
| 架构合规 | 纯客户端 SPA，无服务端概念，自然符合分层 | 默认 SSR/RSC，需额外配置导出 SPA；服务端概念与纯客户端分层模型产生摩擦 | 以 loader/action 为核心，强服务端耦合 |
| WASM 支持 | 原生支持 WASM 导入，`?init` 后缀即可 | 支持但需配置 webpack/turbopack WASM 规则 | 需额外配置 |
| 构建速度 | Rollup 4 + esbuild，HMR < 100ms | Turbopack 改善中但仍慢于 Vite | 中等 |
| 产物体积 | ~42KB 客户端框架开销 | ~92KB 客户端框架开销 | 较大 |
| 部署 | 静态文件，任意 CDN/Web 服务器 | 需 Node.js 运行时（除非纯 `output: export`，功能受限） | 需服务端 |

**决策**：Vite 6 + React

**理由**：
1. **架构最简**：纯客户端 SPA 不需要 SSR/RSC，Vite 不引入任何服务端概念，与 ARCHITECTURE.md 的分层模型零摩擦
2. **WASM 原生支持**：Typst WASM 集成是 P0 需求，Vite 的 WASM 支持开箱即用
3. **开发体验最佳**：HMR < 100ms，产物体积最小（~42KB vs Next.js ~92KB）
4. **部署自由**：构建产物是纯静态文件，可部署到 Vercel/Netlify/Cloudflare Pages/任意 Web 服务器

**未选原因**：
- **Next.js 15**：为墨简而言过度工程化。它的核心价值（SSR、RSC、API Routes、中间件）全部是服务端能力，而墨简已裁决为纯浏览器应用。使用 `output: export` 做纯 SPA 会损失 Next.js 的大部分生态优势，同时引入了不必要的复杂度（App Router 约定、server/client 边界管理）。客户端框架开销（~92KB）也是 Vite（~42KB）的两倍多
- **Remix**：以 loader/action 数据流为核心设计，天然假设存在服务端。墨简完全不需要服务端数据加载模式，使用 Remix 会引入大量用不到的抽象

**约束条件**：路由使用 React Router v7（Vite 生态标配），不引入文件系统路由。

---

## 决策 3：状态管理

**日期**：2026-03-26

**背景**：墨简需要管理的状态包括：当前简历数据（核心）、编辑器状态、模板选择、AI 优化交互状态、UI 状态（面板展开/折叠等）。架构要求 Runtime 层管理状态，UI 层通过 Runtime 获取数据，Runtime 调用 Service 层。

**候选方案**：

| 维度 | Zustand | Jotai | Redux Toolkit |
|---|---|---|---|
| Agent 可读性 | 高。API 极简，`create(set => ...)` 模式清晰 | 高。原子模型直觉，但组合逻辑复杂时 Agent 容易混淆 | 高。训练集覆盖度最大，但样板代码过多 |
| 架构合规 | 单 store 模式天然映射 Runtime 层，store 作为 Service 和 UI 之间的桥梁 | 原子分散在各处，难以集中映射到 Runtime 层目录结构 | slice 模式可映射 Runtime 层，但过重 |
| 体积 | ~1KB gzipped | ~3KB gzipped | ~11KB gzipped |
| 学习曲线 | 极低 | 低 | 中（boilerplate 多） |
| TypeScript | 天然支持，类型推断完整 | 支持良好 | 支持良好但类型定义繁琐 |

**决策**：Zustand

**理由**：
1. **架构映射最直接**：Zustand 的 store 模式完美映射 ARCHITECTURE.md 的 Runtime 层——每个 store 文件对应 `src/runtime/store/` 下一个模块（resumeStore、editorStore、aiStore 等），store 内调用 Service 层方法，UI 通过 hooks 消费 store
2. **极简 API**：对于 Agent 来说，`create(set => ({ ... }))` 模式高度可预测，生成代码的一致性最高
3. **最小体积**：~1KB gzipped，对纯客户端应用而言每个 KB 都有意义
4. **中间件生态**：`persist` 中间件可与 IndexedDB 集成实现状态持久化，`devtools` 中间件支持调试

**未选原因**：
- **Jotai**：原子化模型在处理简历这样的嵌套结构化数据时，原子之间的派生和组合关系会变得复杂。更关键的是，原子天然分散，与 ARCHITECTURE.md 要求的 `src/runtime/store/` 集中管理模式冲突——Jotai 的原子倾向于分散到各个组件附近，这会模糊 Runtime 层的边界
- **Redux Toolkit**：功能完备但对墨简的规模过重。简历编辑器的状态复杂度不需要 Redux 的中间件管道、action/reducer 分离、规范化 state 等重型机制。11KB 的体积是 Zustand 的 11 倍，样板代码量也显著更高，增加 Agent 的维护负担

**约束条件**：每个 store 必须定义在 `src/runtime/store/` 下，UI 层只通过 Zustand hooks 消费状态，禁止在 UI 层直接调用 Service。

---

## 决策 4：本地存储方案

**日期**：2026-03-26

**背景**：已裁决纯浏览器本地存储（IndexedDB），无云端同步。需要存储的数据包括：简历内容（结构化 JSON，含富文本片段）、用户配置（API Key、模板偏好等）、可能的简历版本历史。简历数据可能较大（多份简历，每份含多个模块），需要可靠的 schema 迁移能力。

**候选方案**：

| 维度 | Dexie.js | idb | 原生 IndexedDB API |
|---|---|---|---|
| Agent 可读性 | 高。类 SQL 查询 API 直觉清晰，文档完善 | 中。薄封装，需理解 IndexedDB 事务模型 | 低。回调地狱，事务管理复杂 |
| Schema 迁移 | 内置版本化 schema 迁移（`db.version(N).stores(...)` ） | 无内置迁移机制 | 手动管理 `onupgradeneeded` |
| 查询能力 | 丰富：范围查询、复合索引、`.where().between()` 等 | 基础 CRUD | 基础 CRUD |
| 体积 | ~29KB minified+gzipped | ~1.2KB | 0（原生） |
| TypeScript | 泛型支持完善 | 泛型支持良好 | 需手动类型 |

**决策**：Dexie.js

**理由**：
1. **Schema 迁移是硬性需求**：简历编辑器的数据结构会随版本迭代演化（添加新字段、重组模块结构），Dexie 的 `db.version(N).stores(...)` + `upgrade()` 方法提供声明式迁移，远优于手动管理 IndexedDB 的 `onupgradeneeded`
2. **查询能力匹配**：需要按日期排序简历列表、按模板类型筛选等操作，Dexie 的类 SQL 查询 API 直接支持
3. **Agent 友好**：Dexie 的 API 设计接近 ORM 风格（`db.resumes.where('updatedAt').above(date).toArray()`），Agent 生成此类代码的准确率高于原生 IndexedDB 的事务操作
4. **与 Zustand 配合**：Dexie 的 `liveQuery` 可驱动响应式更新，也可通过 Zustand persist 中间件自定义 storage 适配

**未选原因**：
- **idb**：太薄。它只是将 IndexedDB 的回调 API 包装为 Promise，不提供 schema 迁移、查询便利性或响应式更新。对于简历编辑器这种结构化数据场景，开发团队（Agent）需要自行实现大量 idb 之上的抽象，最终可能重新发明 Dexie 的子集
- **原生 IndexedDB API**：开发体验极差，事务管理和错误处理需要大量样板代码。Agent 生成原生 IndexedDB 代码的出错率显著高于使用 Dexie。没有合理理由在有成熟封装库的情况下直接使用原生 API

**约束条件**：Dexie 实例定义在 `src/repo/` 层，Schema 定义在 `src/repo/db.ts`，每个数据实体对应 `src/repo/` 下一个模块。UI 和 Service 层禁止直接操作 Dexie，必须通过 Repo 层接口。

---

## 决策 5：Typst 集成方案

**日期**：2026-03-26

**背景**：Typst 是简历渲染的核心引擎（P0）。需求包括：实时预览（编辑后 ≤2 秒更新）、PDF 导出（文字可选中可搜索）、中文内容正常渲染。墨简是纯客户端应用，不能依赖后端服务。

**候选方案**：

| 维度 | typst.ts (WASM 全客户端) | Typst CLI (后端调用) | 云服务 (typst.app API) |
|---|---|---|---|
| 架构合规 | 完全客户端，符合"纯浏览器本地存储"裁决 | 需要后端服务器运行 CLI，违反纯客户端裁决 | 依赖外部服务，违反纯客户端裁决 |
| 渲染延迟 | 本地执行，延迟低（取决于 WASM 性能） | 网络往返 + 服务端编译 | 网络往返 + 第三方服务 |
| PDF 导出 | 客户端编译直出 PDF（Typst 原生 PDF 输出），文字可选中 | 服务端生成后下载 | 第三方服务生成 |
| React 集成 | 官方 `@myriaddreamin/typst.react` 绑定 | 无前端集成，需自建通信层 | 需自建 API 调用层 |
| 中文字体 | 需手动加载字体文件到 WASM 虚拟文件系统 | CLI 可访问系统字体 | 云端有字体库 |
| 离线可用 | 完全离线 | 需网络 | 需网络 |

**决策**：typst.ts (WASM 全客户端)

**理由**：
1. **唯一符合架构裁决的方案**：requirements.md 已裁决"纯浏览器本地存储"，CLI 和云服务方案均需后端/外部服务，直接违反此裁决
2. **官方 React 绑定**：`@myriaddreamin/typst.react` 提供 React 组件，减少封装成本
3. **完整管线**：typst.ts 同时提供 web-compiler（编译 .typ 源码）和 renderer（渲染到 DOM/Canvas），以及 PDF 导出能力。一套方案覆盖预览 + 导出两个需求
4. **离线可用**：纯客户端执行，无网络依赖

**未选原因**：
- **Typst CLI (后端调用)**：需要搭建后端服务来运行 `typst compile` 命令，直接违反"纯浏览器本地存储"的裁决。即使架构允许，也引入了部署复杂度（需要服务器运行时）和延迟（网络往返）
- **云服务 (typst.app API)**：typst.app 目前无公开的编译 API。即使未来提供，依赖第三方服务意味着离线不可用、数据需上传到外部（简历含敏感个人信息）、成本不可控

**约束条件**：
1. typst.ts 的 WASM 模块体积较大（编译器 + 渲染器），需要异步加载 + Loading 状态处理
2. 中文字体文件需要嵌入或懒加载到 WASM 虚拟文件系统，字体文件体积可能较大（单个中文字体 5-15MB），需要考虑缓存策略
3. 模板 `.typ` 文件定义在 `src/service/typst/` 层，模板配置在 `src/config/` 层

**核心包**：
- `@myriaddreamin/typst.ts` — 核心 TypeScript 封装
- `@myriaddreamin/typst.react` — React 绑定
- `@myriaddreamin/typst-ts-web-compiler` — WASM 编译器
- `@myriaddreamin/typst-ts-renderer` — WASM 渲染器

---

## 决策 6：AI API 调用层

**日期**：2026-03-26

**背景**：AI 优化是 P0 功能，初始供应商为 OpenRouter，架构预留多供应商切换。ARCHITECTURE.md 要求所有 AI 调用统一经过 `src/service/ai/provider.ts`。OpenRouter API 兼容 OpenAI Chat Completions 格式。需要支持：流式响应（优化结果逐步呈现）、结构化输出（`response_format`）、错误处理（API Key 无效/余额不足/超时）。

**候选方案**：

| 维度 | 原生 fetch 封装 | OpenAI SDK (`openai` npm 包) | Vercel AI SDK (`ai` npm 包) |
|---|---|---|---|
| Agent 可读性 | 高。fetch 是基础 API，所有 Agent 都能准确生成 | 极高。OpenAI SDK 在训练集中覆盖度最大 | 高。但抽象层较厚，Agent 需理解其约定 |
| 多供应商适配 | 需自行实现供应商切换逻辑 | OpenRouter 兼容 OpenAI 格式，配置 `baseURL` 即可切换 | 内置多供应商支持（OpenAI、Anthropic 等） |
| 流式支持 | 需手动解析 SSE | 内置 stream 支持 | 内置 `useChat` / `useCompletion` hooks |
| 架构合规 | 完全可控，封装在 Service 层 | 可封装在 Service 层 | hooks 默认在 UI 层使用，需刻意隔离到 Runtime 层 |
| 体积 | 0（原生） | ~40KB | ~60KB + 框架绑定 |

**决策**：OpenAI SDK (`openai` npm 包)

**理由**：
1. **OpenRouter 原生兼容**：OpenRouter API 完全兼容 OpenAI Chat Completions 格式，只需设置 `baseURL: 'https://openrouter.ai/api/v1'`，零额外适配成本
2. **多供应商切换最简**：未来接入直连 OpenAI/Anthropic 等供应商时，只需更换 `baseURL` 和 `apiKey`，请求/响应格式不变
3. **流式 + 结构化输出开箱即用**：SDK 内置 SSE 解析和 `response_format` 支持，不需手动处理
4. **Agent 可读性最高**：OpenAI SDK 的用法（`openai.chat.completions.create({ ... })`）是 AI 编程 Agent 训练集中覆盖率最高的 API 调用模式
5. **架构合规**：SDK 实例化封装在 `src/service/ai/provider.ts`，对外暴露领域方法（`scoreResume`、`optimizeContent` 等），符合分层规则

**未选原因**：
- **原生 fetch 封装**：虽然体积为零且完全可控，但需要手动实现 SSE 解析（流式响应）、错误码映射、重试逻辑、TypeScript 类型定义等。这些是 OpenAI SDK 已经解决的问题，重新实现是不必要的工程量，且 Agent 生成手写 SSE 解析代码的出错率高于使用 SDK
- **Vercel AI SDK**：功能强大但为墨简过度设计。它的核心价值在于 `useChat`/`useCompletion` 等 React hooks 和 Next.js API Route 集成，这些都假设存在服务端。墨简是纯客户端应用，SDK 的服务端适配层完全用不上。且 hooks 默认运行在 UI 层，与 ARCHITECTURE.md 的分层规则冲突——需要额外工作将 AI 调用隔离到 Service 层

**约束条件**：
1. OpenAI SDK 实例在 `src/service/ai/provider.ts` 中创建，配置从 `src/config/` 层读取
2. API Key 由用户运行时配置（已裁决不提供官方 Key），存储在 Repo 层（IndexedDB/localStorage），通过 Config 层传递给 Service 层
3. 所有 AI 调用封装为领域方法，UI/Runtime 层禁止直接操作 SDK 实例

---

## 决策 7：CSS/样式方案

**日期**：2026-03-26

**背景**：墨简的古风设计系统需要高度自定义的视觉表达——宣纸纹理、墨线分割、印章按钮、窗棂导航等元素远超常规 UI 组件库的覆盖范围。DESIGN.md 定义了完整的设计令牌体系（L1 基础色、L2 语义色）。需要支持：设计令牌的集中管理、组件级样式隔离、伪类/伪元素（墨线不均匀感等 SVG 效果）、动画 keyframes。

**候选方案**：

| 维度 | CSS Modules + CSS 变量 | Tailwind CSS 4 | vanilla-extract |
|---|---|---|---|
| 古风 UI 适配 | 完全自由，无约束。可写任意复杂的 CSS（SVG 背景、多层渐变、自定义滤镜等） | 原子类对常规布局高效，但古风元素（宣纸纹理、墨线 SVG）仍需大量自定义 CSS，`@apply` 和任意值（`bg-[url(...)]`）使用频繁，反而增加复杂度 | 类型安全，但 sprinkles API 对高度自定义场景限制较多 |
| 设计令牌集成 | CSS 变量天然映射设计令牌（`--color-ink-deep: #1C1208`），所有组件通过变量引用 | 可通过 `theme.extend` 映射，但令牌定义分散在 tailwind.config 和 CSS 变量之间 | TypeScript 令牌，类型安全最佳 |
| 样式隔离 | 构建时生成唯一类名，零冲突 | 全局原子类，无冲突 | 构建时生成唯一类名，零冲突 |
| Agent 可读性 | 高。标准 CSS 语法，Agent 训练集覆盖度最大 | 极高。Tailwind 类名 Agent 非常熟悉 | 中。TypeScript API 独特，训练集覆盖度低 |
| 构建时开销 | Vite 原生支持，零配置 | 需配置 PostCSS 插件 | 需额外编译步骤 |

**决策**：CSS Modules + CSS 自定义属性（CSS Variables）

**理由**：
1. **古风设计系统的需求本质是"写大量自定义 CSS"**：宣纸纹理背景、墨线 SVG 分割线、印章径向渐变、窗棂边框图案——这些效果需要直接操作 CSS 的全部能力（`background-image`、`filter`、`mask`、`clip-path` 等）。CSS Modules 不限制 CSS 表达力，是最直接的方案
2. **设计令牌 = CSS 变量**：DESIGN.md 的令牌体系（`color.ink.deep` → `--color-ink-deep`）天然映射为 CSS 自定义属性，定义在 `src/ui/tokens/` 下的 `.css` 文件中，所有组件通过 `var(--color-ink-deep)` 引用。改令牌值即全局生效
3. **零配置**：Vite 原生支持 CSS Modules（`.module.css` 后缀即可），无需额外插件或编译步骤
4. **样式隔离**：构建时生成唯一类名，原子组件之间零样式冲突

**未选原因**：
- **Tailwind CSS 4**：Tailwind 的强项是快速搭建常规 UI（按钮、表单、卡片），但墨简的古风设计系统本质上是"每个组件都是高度自定义的"。使用 Tailwind 时，大量组件会退化为 `className="bg-[url('/textures/xuan-paper.png')] bg-[length:200px_200px] border-[1px] border-[var(--color-ink-light)] rounded-[2px]"` 这种任意值堆砌，既不可读也不比 CSS Modules 更简洁。Tailwind 的原子类对于需要完整 CSS 表达力的场景反而是阻碍
- **vanilla-extract**：类型安全的设计令牌定义是优势，但其 sprinkles API 和 recipes API 在处理高度自定义样式时限制较多（复杂渐变、SVG 滤镜等仍需降级到 `style` 对象）。学习曲线较陡，Agent 训练集覆盖度低，维护成本高。对墨简的收益不足以覆盖其引入的复杂度

**约束条件**：
1. 设计令牌定义在 `src/ui/tokens/*.css`，以 CSS 变量形式暴露
2. 每个组件使用同名 `.module.css` 文件（如 `SealButton.tsx` + `SealButton.module.css`）
3. 禁止内联 `style` 属性（除 Motion 动画的运行时样式外）
4. 全局样式仅在 `src/ui/tokens/` 中定义，组件禁止写全局 CSS

---

## 决策 8：动画库

**日期**：2026-03-26

**背景**：DESIGN.md 定义了"水墨物理学"动画哲学——元素进入模拟墨水扩散（ease-out, 300-500ms）、元素消失模拟墨迹褪去（ease-in, 150-250ms）、悬停模拟毛笔触纸（scale(0.98)）、加载状态墨水晕染。需要支持：组件进入/退出动画、布局动画（模板切换）、手势交互、`prefers-reduced-motion` 无障碍。

**候选方案**：

| 维度 | Motion (原 Framer Motion) | GSAP | CSS Animations + CSS Transitions |
|---|---|---|---|
| React 集成 | 原生 React 组件 API（`<motion.div animate={...} />`） | 命令式 API，需 `useRef` + `useEffect` 手动管理 | 纯 CSS，无 JS 库 |
| 进入/退出动画 | `AnimatePresence` 一行代码处理组件卸载动画——这是 React 的难题 | 需手动管理 DOM 移除时机 | 退出动画极难处理（元素已从 DOM 移除） |
| 布局动画 | `layout` prop 自动处理 DOM 位置变化动画 | 需手动计算 FLIP | 不支持 |
| 手势 | 内置 `whileHover`、`whileTap`、`drag` | 需额外插件 | 仅 `:hover`、`:active` |
| 体积 | ~32KB gzipped（tree-shakable） | ~23KB gzipped | 0 |
| Agent 可读性 | 极高。声明式 API，在训练集中覆盖度高 | 高。但命令式代码更长，上下文占用大 | 高。标准 CSS 语法 |

**决策**：Motion (原 Framer Motion)

**理由**：
1. **退出动画是杀手级需求**：水墨物理学要求"元素消失模拟墨迹褪去"——在 React 中，组件卸载后 DOM 节点立即移除，纯 CSS 无法实现退出动画。Motion 的 `AnimatePresence` 是解决此问题的标准方案，GSAP 需要手动延迟 DOM 移除，极易出错
2. **布局动画**：模板切换时简历内容需要平滑过渡到新布局。Motion 的 `layout` prop 自动处理 FLIP 动画（First-Last-Invert-Play），无需手动计算元素位置
3. **声明式 API 与水墨物理学的映射**：`<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: "easeOut" }} />` 直接对应 DESIGN.md 的动画规范，Agent 可读性极高
4. **`prefers-reduced-motion` 内置支持**：requirements 要求无障碍减少动画选项

**未选原因**：
- **GSAP**：性能极强，适合复杂时间线动画和 SVG morphing。但墨简的动画需求是 UI 交互动画（进入/退出/布局/悬停），不是复杂的时间线编排。GSAP 的命令式 API（`gsap.to(ref.current, { ... })`）在 React 中需要大量 `useRef` + `useEffect` 管理，代码量和复杂度远高于 Motion 的声明式方案。退出动画处理也需要手动管理，容易产生内存泄漏
- **CSS Animations + CSS Transitions**：零依赖，性能最佳。对于简单的悬停/焦点效果完全足够，但无法解决 React 中组件退出动画的核心问题。布局动画也无法实现。如果仅用 CSS，水墨物理学中"墨迹褪去"的退出效果将无法落地

**约束条件**：
1. 动画定义紧随组件，写在 `src/ui/components/` 和 `src/ui/patterns/` 中
2. 简单的悬停/焦点效果优先用 CSS Transitions（在 `.module.css` 中定义），Motion 仅用于需要 JS 控制的复杂动画
3. 所有 Motion 动画必须响应 `prefers-reduced-motion`

---

## 决策 9：富文本/编辑器方案

**日期**：2026-03-26

**背景**：简历编辑器需要支持：基础富文本（加粗、斜体、列表等）、结构化内容（简历模块：个人信息、教育经历、工作经历等是不同的结构块）、撤销/重做、实时同步到 Typst 渲染。编辑器不是通用文档编辑器——用户操作的是"简历结构"，不是自由文档。

**候选方案**：

| 维度 | TipTap (基于 ProseMirror) | Slate.js | 自建表单系统 (React Hook Form + 富文本片段) |
|---|---|---|---|
| Agent 可读性 | 高。TipTap 文档清晰，Extension API 直觉 | 中。API 灵活但无预设行为，理解成本高 | 高。表单是最基础的 React 模式 |
| 结构化内容 | Node/Mark 扩展系统可定义简历模块为自定义 Node | 完全自定义 schema，可建模任意结构 | 天然结构化——每个字段是一个表单控件 |
| 富文本支持 | 内置 Bold/Italic/BulletList 等 Extension，按需引入 | 需从零构建每个功能 | 仅在"工作描述"等文本字段内嵌入迷你编辑器 |
| 与 Typst 集成 | 输出 JSON → 转换为 Typst 源码 | 输出 JSON → 转换为 Typst 源码 | 直接从表单数据生成 Typst 源码，转换链最短 |
| 体积 | ~45KB (core + 常用扩展，tree-shakable) | ~35KB | React Hook Form ~9KB + 迷你富文本 |
| 拖拽排序 | 需自行实现 | 需自行实现 | 搭配 dnd-kit 等库 |

**决策**：TipTap

**理由**：
1. **结构化简历编辑的最佳平衡点**：TipTap 的自定义 Node 系统可以将简历模块（教育经历、工作经历等）建模为 ProseMirror Node，每个 Node 有自定义 schema 和渲染。这比纯表单更灵活（支持拖拽排序、模块内富文本），比 Slate 更快交付（TipTap 内置基础格式化功能）
2. **富文本开箱即用**：工作描述、项目经验等字段需要加粗/斜体/列表等格式。TipTap 的 StarterKit Extension 一行代码启用这些功能，而 Slate 需要从零实现每个功能
3. **撤销/重做内置**：ProseMirror 的 history 插件（TipTap 自动集成）提供文档级撤销/重做，覆盖 requirements 的验收标准
4. **JSON 输出**：TipTap 编辑器内容以 JSON 格式存储（ProseMirror document model），便于持久化到 IndexedDB（通过 Repo 层）和转换为 Typst 源码（通过 Service 层）
5. **React 集成**：`@tiptap/react` 提供 `useEditor` hook 和 `EditorContent` 组件，与 React 生态自然融合

**未选原因**：
- **Slate.js**：最大自由度，可建模任意编辑器。但"最大自由度"对墨简是负面的——简历编辑器的需求边界清晰（有限的模块类型、基础格式化、结构化输出），不需要 Slate 的无限灵活性。Slate 不提供任何预设行为（连加粗都要手写），初始开发成本远高于 TipTap。Agent 在 Slate 上构建简历编辑器需要编写大量 plugin/normalizer/renderer 代码，这些在 TipTap 中是内置的
- **自建表单系统**：对于"姓名"、"学校"等纯文本字段，表单确实最简洁。但"工作描述"、"项目经验"等字段需要段落内富文本（加粗关键数字、列表化成果），表单系统无法覆盖。虽然可以"表单 + 嵌入 mini 编辑器"的混合方案，但这会导致两套编辑体验混用，增加维护复杂度和不一致性。TipTap 用统一的编辑模型覆盖所有场景

**约束条件**：
1. TipTap 编辑器实例管理在 `src/runtime/` 层（编辑器状态是 Runtime 关注点）
2. 自定义 Node 定义在 `src/ui/components/editor/` 下（Node 的渲染是 UI 关注点）
3. 编辑器 JSON 内容 → Typst 源码的转换逻辑在 `src/service/typst/` 层

---

## 决策 10：PDF 导出方案

**日期**：2026-03-26

**背景**：已裁决仅 PDF 格式。需求：文字可选中可搜索（非图片化 PDF）、与预览视觉一致。Typst 原生支持 PDF 输出。

**候选方案**：

| 维度 | Typst 原生 PDF 输出 (via typst.ts WASM) | 额外 PDF 库 (jsPDF / pdf-lib) | 浏览器 print-to-PDF |
|---|---|---|---|
| 文字质量 | 原生矢量文字，可选中可搜索 | jsPDF 中文支持差，pdf-lib 需手动布局 | 取决于浏览器渲染 |
| 视觉一致性 | 预览和导出使用同一 Typst 模板，100% 一致 | 需二次实现布局逻辑，一致性无法保证 | 受浏览器差异影响 |
| 实现成本 | typst.ts 编译 `.typ` 直出 PDF bytes | 需重新用 JS 实现排版逻辑 | 需处理打印样式表 |
| 额外依赖 | 无（复用决策 5 的 typst.ts） | jsPDF ~200KB / pdf-lib ~150KB | 无 |

**决策**：Typst 原生 PDF 输出 (via typst.ts WASM)

**理由**：
1. **零额外依赖**：决策 5 已选定 typst.ts 作为渲染方案，PDF 导出复用同一 WASM 编译器。`typst-ts-web-compiler` 编译 `.typ` 源码后可直接输出 PDF 字节流，无需额外库
2. **100% 视觉一致**：预览和导出使用完全相同的 Typst 模板和编译器，不存在视觉差异
3. **原生矢量文字**：Typst 输出的 PDF 中文字是矢量排版（非图片），天然可选中可搜索，满足验收标准
4. **PDF/A 支持**：Typst 0.12.0 已支持 PDF/A 格式输出，对简历的长期存档友好

**未选原因**：
- **额外 PDF 库 (jsPDF / pdf-lib)**：引入额外 150-200KB 依赖，且需要在 JS 中重新实现 Typst 已完成的排版逻辑。这不仅是重复工作，还无法保证与 Typst 预览的视觉一致性。jsPDF 的中文支持尤其薄弱，需要嵌入字体文件
- **浏览器 print-to-PDF**：依赖 `window.print()` 和打印样式表，输出质量受浏览器差异影响（Chrome/Firefox/Safari 渲染不同）。无法精确控制页面尺寸和分页，不适合简历这种对排版精度要求高的场景

**约束条件**：PDF 导出逻辑封装在 `src/service/export/` 层，调用 `src/service/typst/` 的编译能力。UI 层通过 Runtime 层触发导出，获得 Blob/URL 后触发下载。

---

## 技术栈总览

| 领域 | 选型 | 所属架构层 |
|---|---|---|
| 前端框架 | React 19 | 全局 |
| 构建工具 | Vite 6 | 基础设施 |
| 语言 | TypeScript 5.x (strict mode) | 全局 |
| 路由 | React Router v7 | Runtime |
| 状态管理 | Zustand | Runtime (`src/runtime/store/`) |
| 本地存储 | Dexie.js (IndexedDB) | Repo (`src/repo/`) |
| Typst 渲染 | typst.ts (WASM) | Service (`src/service/typst/`) |
| AI 调用 | OpenAI SDK (via OpenRouter) | Service (`src/service/ai/`) |
| CSS 方案 | CSS Modules + CSS Variables | UI (`src/ui/`) |
| 动画 | Motion (原 Framer Motion) | UI (`src/ui/`) |
| 富文本编辑器 | TipTap | UI + Runtime |
| PDF 导出 | Typst 原生 (复用 WASM) | Service (`src/service/export/`) |

---

## 依赖清单

### 核心依赖

```
react                           ^19.0.0
react-dom                       ^19.0.0
react-router                    ^7.0.0
zustand                         ^5.0.0
dexie                           ^4.0.0
@tiptap/react                   ^2.0.0
@tiptap/starter-kit             ^2.0.0
@tiptap/pm                      ^2.0.0
motion                          ^11.0.0
openai                          ^4.0.0
@myriaddreamin/typst.ts         latest
@myriaddreamin/typst.react      latest
@myriaddreamin/typst-ts-web-compiler  latest
@myriaddreamin/typst-ts-renderer      latest
```

### 开发依赖

```
vite                            ^6.0.0
@vitejs/plugin-react            latest
typescript                      ^5.5.0
eslint                          ^9.0.0
```

---

## 决策 11：AI 上下文序列化策略（Resume -> AI JSON）

**日期**：2026-03-27

**背景**：requirements.md 3.3.1 要求将 Resume 数据模型序列化为 AI 可理解的 JSON 结构，发送到 AI prompt 的 user message 中。序列化需要：包含所有结构化字段（section 类型、item 的全部字段、技能 level、section 排序/可见性），同时排除系统字段（id、createdAt、updatedAt、templateId）和 item 级别 id。当前 `optimizeContent` 接收纯文本 `content: string`，需要重构为接收结构化 Resume 数据。

**候选方案**：

| 维度 | A: 手写序列化函数 | B: 通用序列化库 (class-transformer / superjson) | C: 直接 JSON.stringify + replacer 过滤 |
|---|---|---|---|
| 精确控制 | 完全可控：逐字段映射，精确排除系统字段和 item id，可自定义输出结构 | 通过装饰器/规则配置排除字段，灵活度中等 | replacer 函数可按 key 过滤，但无法区分"Resume.id"和"EducationItem.id"等同名不同层级的 key |
| 架构合规 | 函数定义在 Service 层（`src/service/ai/`），引用 Types 层的 Resume 接口，符合分层规则 | 需在 Types 层添加装饰器或 schema 定义，污染纯类型层 | 同 A，函数可定义在 Service 层 |
| 维护成本 | Resume 类型变更时需同步修改序列化函数，但变更可由 TypeScript 编译器检测到（字段缺失/多余） | 库本身需维护，装饰器与类型定义耦合 | 最低初始成本，但 replacer 无法处理嵌套层级同名字段的差异化过滤，后续维护困难 |
| Agent 可读性 | 最高。函数逻辑直白，任何 Agent 都能阅读和修改 | 中。需理解库的装饰器/配置 API | 高。JSON.stringify 是基础 API，但 replacer 逻辑复杂时可读性下降 |
| 新依赖 | 零 | +1 依赖 | 零 |

**决策**：A — 手写序列化函数

**理由**：
1. **序列化需求是领域特定的**：需求不是"通用地序列化一个对象"，而是"按 AI 理解的结构重组 Resume 数据"——排除系统字段、排除 item id、保留 section 排序/可见性、保留技能 level。这种精确控制只有手写函数能提供
2. **零新依赖**：项目已有的 TypeScript 类型系统提供了所有需要的工具。Resume 接口已完整定义（`src/types/resume.ts`），手写函数直接操作这些类型
3. **TypeScript 编译器作为安全网**：当 Resume 类型新增或删除字段时，序列化函数的类型签名会产生编译错误，确保两者保持同步。这比运行时检查更可靠
4. **函数体积极小**：Resume 数据结构已知且有限（personal + 5 种 section 类型），序列化函数预计 40-60 行代码，不值得引入外部库

**未选原因**：
- **B: 通用序列化库 (class-transformer / superjson)**：这些库解决的是"将类实例序列化/反序列化为 JSON"的通用问题，但墨简的 Resume 是纯 TypeScript interface（不是 class），且序列化目标不是"忠实还原原始结构"而是"重组为 AI 友好结构"。class-transformer 需要将 interface 改为 class 并添加装饰器，这会污染 Types 层的纯净性。superjson 侧重于处理 Date/Map/Set 等 JSON 不支持的类型，与本场景无关
- **C: JSON.stringify + replacer 过滤**：表面上最简单，但 replacer 函数无法区分嵌套层级中的同名 key。例如 `Resume.id`（要排除）和假设未来某个嵌套对象的 `id`（可能需要保留）会被同一个 replacer 规则命中。更重要的是，JSON.stringify 输出的是 Resume 的原始结构，而 3.3.1 要求的输出可能需要结构重组（如将 `sections` 元数据与对应的 item 数组关联输出），replacer 无法做到结构变换

**约束条件**：
1. 序列化函数定义在 `src/service/ai/serialize.ts`，输入类型为 `Resume`（来自 Types 层），输出类型为新定义的 `ResumeAiContext`（也定义在 Types 层）
2. 序列化函数为纯函数，无副作用，便于单元测试
3. 当 `src/types/resume.ts` 变更时，TypeScript 编译器将强制序列化函数同步更新

---

## 决策 12：AI 返回 JSON 解析与校验

**日期**：2026-03-27

**背景**：requirements.md 3.3.3 要求对 AI 返回的内容执行两步处理：(1) JSON 语法解析——AI 可能将 JSON 包裹在 markdown 代码块中（`` ```json ... ``` ``），或在 JSON 前后附加解释性文字；(2) 结构校验——解析出的 JSON 是否符合 Resume 数据模型的子集结构。校验失败时需给用户有意义的错误提示，原始简历数据不受影响（AC5）。

**候选方案**：

### 12a：JSON 提取（从 AI 返回的原始文本中提取 JSON）

此步骤是固定的——需要正则提取 markdown 代码块中的 JSON 或尝试直接 `JSON.parse`。无候选方案可选，所有方案都需要此步骤。实现方式：先尝试 `JSON.parse(raw)`；失败则用正则 `/```(?:json)?\s*([\s\S]*?)```/` 提取代码块内容再 `JSON.parse`；仍失败则报错。

### 12b：结构校验

| 维度 | A: Zod (v4 / Zod Mini) | B: 手写 TypeScript 类型守卫 | C: Ajv (JSON Schema) |
|---|---|---|---|
| Agent 可读性 | 极高。Zod 在 AI 训练集中覆盖度极大，`z.object({ company: z.string(), ... })` 模式清晰 | 高。标准 TypeScript 代码 | 中。JSON Schema 语法冗长，Agent 容易出错 |
| 错误信息质量 | 开箱即用的结构化错误路径（`issues[0].path` = `["work", 0, "company"]`），可直接转化为用户提示 | 需手动构建每个字段的错误信息 | 错误信息格式化需额外处理 |
| 与 Types 层的关系 | Zod schema 可自动推导 TypeScript 类型（`z.infer<typeof schema>`），但也意味着 schema 和 interface 存在两套定义 | 直接复用已有 Types 层的 interface | JSON Schema 独立于 TypeScript 类型，三套定义 |
| 部分校验（子集） | `z.object({...}).partial()` / `z.pick({...})` 可灵活定义 Resume 的子集 schema | 需为每种子集手写独立守卫函数 | JSON Schema 的 `$ref` + `additionalProperties` 可以但语法繁琐 |
| 运行时体积 | Zod Mini ~1.9KB gzipped（Zod 4 的 tree-shakable 分包） | 0（纯 TypeScript） | ~35KB gzipped |
| 维护成本 | 新增字段时需同步更新 Zod schema，但 `z.infer` 可保持与实际类型一致 | 每个新 section 类型需新增守卫代码，guard 函数容易与 Types 层漂移 | JSON Schema 与 TypeScript 类型完全独立，漂移风险最高 |

**决策**：A — Zod Mini (Zod 4 的 tree-shakable 子包)

**理由**：
1. **错误路径是核心需求**：AC5 要求"向用户展示有意义的错误提示"。当 AI 返回的 JSON 中 `work[2].company` 字段缺失时，Zod 的 `issue.path` 直接给出 `["work", 2, "company"]`，可以转化为"工作经历第 3 条缺少公司名称"。手写类型守卫要达到同等错误定位精度，需要在每个字段检查处手动拼接路径，代码量和出错率都很高
2. **Resume 子集校验的便利性**：AI 仅返回目标 section（如只返回 work 数组），校验 schema 是 Resume 完整 schema 的子集。Zod 的 `.pick()` / `.partial()` API 可以从完整 schema 派生子集 schema，而不是重新定义
3. **Zod Mini 体积可接受**：~1.9KB gzipped，与手写守卫（0KB）的差距在可接受范围内，远小于 Ajv（~35KB）
4. **Agent 可读性最高**：Zod 是当前 TypeScript 生态中使用最广泛的校验库（npm 周下载量 > 25M），AI Agent 训练集覆盖度极高，生成 Zod schema 代码的准确率远超 Ajv 或手写复杂守卫

**未选原因**：
- **B: 手写 TypeScript 类型守卫**：对于简单的"是否为 string"检查够用，但 Resume 的校验需求是嵌套的（`work` 是 `WorkItem[]`，每个 `WorkItem` 有 6 个字段，每个字段有类型约束）。手写完整的嵌套守卫函数估计 150-200 行代码，且最大的问题是错误信息——类型守卫只能返回 `true/false`，无法告诉用户"哪个字段出了什么问题"。要实现 Zod 级别的错误路径追踪，手写代码量将膨胀到 300+ 行，本质上是在重新发明 Zod
- **C: Ajv (JSON Schema)**：体积过大（~35KB gzipped，是 Zod Mini 的 18 倍），且 JSON Schema 的 DSL 与 TypeScript 类型系统完全独立——这意味着 `src/types/resume.ts` 的 interface 和 JSON Schema 定义之间无编译时检查，漂移风险最高。JSON Schema 语法冗长（`{ "type": "object", "properties": { "company": { "type": "string" } }, "required": ["company"] }` vs Zod 的 `z.object({ company: z.string() })`），Agent 可读性和维护效率均不如 Zod

**约束条件**：
1. Zod schema 定义在 `src/service/ai/schema.ts`（Service 层），因为校验是 AI 返回数据处理的一部分，不属于通用 Types 层
2. Zod schema 与 `src/types/resume.ts` 的 interface 之间需通过单元测试保证一致性（如：用 `expectTypeOf<z.infer<typeof workItemSchema>>().toEqualTypeOf<Omit<WorkItem, 'id'>>()` 断言）
3. JSON 提取 + Zod 校验封装为 `parseAiResponse(raw: string, targetSection: SectionType): ParseResult<T>` 函数，返回 `{ success: true, data } | { success: false, error: string }`
4. 新增依赖：`zod`（^3.24 / ^4.0，使用 `zod/mini` 入口）— 这是本轮选型唯一的新增运行时依赖

---

## 决策 13：数组合并策略与新增 item 的 id 生成

**日期**：2026-03-27

**背景**：requirements.md 3.3.3 要求 AI 返回的目标 section 数组整段替换原 section 数组。Q10 裁决 AI 可以增删 item（如添加一条工作经历），新增 item 需系统自动生成 id。此外，保留的 item 需保持原 id（AC7：系统字段不可变）。由于序列化时排除了 item id（3.3.1），AI 返回的数组中所有 item 都没有 id，系统需要一种策略来区分"已有 item"和"新增 item"，并为后者生成 id。

**子问题 13a：已有 item 识别与 id 回填**

由于 AI 看不到 item id，写回时需要通过内容匹配来识别哪些是已有 item。策略：对 AI 返回的每个 item，用关键字段（如 WorkItem 的 `company` + `position`）在原数组中查找匹配项。匹配成功则复用原 id，匹配失败则判定为新增 item 并生成新 id。

候选方案仅涉及实现细节，不涉及方案对比，因为 requirements.md 已明确"按 section 类型 + 数组整段替换"且"保留的 item 保持原 id"。

**子问题 13b：id 生成方案**

| 维度 | A: crypto.randomUUID() | B: nanoid | C: 自增 (counter++) |
|---|---|---|---|
| 唯一性保证 | UUID v4，128 bit 随机，碰撞概率 ~2^-122 | 默认 21 字符，126 bit 随机，碰撞概率接近 UUID | 仅在单次会话内唯一，跨浏览器/设备必碰撞 |
| 已有使用 | 项目已在 `src/repo/resume.ts` 和 `src/ui/pages/EditorPage/SectionEditor.tsx` 中使用 | 未使用，需新增依赖 | 未使用 |
| 新依赖 | 零（Web Crypto API 是浏览器原生 API） | +1 依赖 (~130 bytes gzipped) | 零 |
| id 格式 | 36 字符（`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`） | 21 字符，URL 友好 | 数字字符串，极短 |
| Agent 可读性 | 极高。标准 Web API | 高。但需记住导入路径 | 极高。但语义上不是"标识符" |

**决策**：A — `crypto.randomUUID()`

**理由**：
1. **项目一致性**：`crypto.randomUUID()` 已经是项目中 id 生成的标准方式，在 `src/repo/resume.ts` 和 `SectionEditor.tsx` 中均有使用。引入不同的 id 生成方案会造成不一致
2. **零新依赖**：Web Crypto API 是浏览器原生 API，项目已裁决仅桌面端（≥1024px），所有目标浏览器均支持 `crypto.randomUUID()`
3. **唯一性无忧**：UUID v4 的碰撞概率在简历编辑器的规模下可忽略不计

**未选原因**：
- **B: nanoid**：虽然 id 更短（21 vs 36 字符），体积极小（~130 bytes），但在项目已统一使用 `crypto.randomUUID()` 的前提下，引入 nanoid 只为获得更短的 id 格式，收益不足以抵消引入新依赖和两种 id 格式共存的维护成本
- **C: 自增 (counter++)**：不适合持久化场景。简历数据存储在 IndexedDB 中，多份简历之间的 item id 必须全局唯一。自增计数器在页面刷新后重置，不同简历的 item 可能产生相同 id，导致数据冲突

**合并策略完整流程**：
1. AI 返回目标 section 的 item 数组（无 id）
2. 对每个返回的 item，用关键字段匹配原数组中的 item：
   - personal 类型：直接覆盖（只有一份，无需匹配）
   - education：匹配 `school` + `degree`
   - work：匹配 `company` + `position`
   - skills：匹配 `name`
   - projects：匹配 `name`
   - custom：匹配 `title`
3. 匹配成功：复用原 item 的 `id`
4. 匹配失败：调用 `crypto.randomUUID()` 生成新 `id`
5. 用带有 id 的新数组整段替换原 section 数组

**约束条件**：
1. id 生成逻辑应统一提取到 `src/repo/` 层的工具函数中（目前 `generateId()` 分散在两个文件中，这是一个既有技术债，应在本次重构中修复）
2. 合并逻辑定义在 `src/service/ai/merge.ts`，输入为原 Resume 数据 + AI 返回的 section 数据 + 目标 section 标识，输出为合并后的完整 Resume
3. 合并函数必须是纯函数，方便单元测试

---

## 决策 14：前后对比视图技术方案

**日期**：2026-03-27

**背景**：requirements.md 3.3.3 和 Q12 裁决要求在 AI 返回结果写回前展示前后对比视图，用户一次性接受或拒绝全部修改。对比的对象是结构化 JSON 数据（Resume 的某个 section），不是纯文本。用户需要看到：哪些字段被修改了、哪些 item 是新增的、哪些被删除了。

**候选方案**：

| 维度 | A: 自行实现结构化字段对比 | B: jsondiffpatch 库 | C: json-diff-ts 库 |
|---|---|---|---|
| 适配度 | 完全针对 Resume 数据结构设计，对比粒度和展示逻辑可精确控制 | 通用 JSON diff，支持对象/数组/文本 diff，但展示需自定义 | 通用 JSON diff，TypeScript 原生支持 |
| 展示友好性 | 可产出"张三的公司名从 X 改为 Y"这种语义化对比 | 产出通用 delta 对象，需自行转化为用户可读的展示 | 产出 changeset 数组，需自行转化为用户可读的展示 |
| 数组 item 匹配 | 使用决策 13 中已定义的关键字段匹配逻辑，复用现成代码 | 内置 `objectHash` 配置，但与决策 13 的匹配逻辑独立，可能产生不一致 | 支持自定义 key 匹配 |
| 新依赖 | 零 | +1 依赖 (~15KB gzipped) | +1 依赖 (~5KB gzipped) |
| Agent 可读性 | 高。领域代码，逻辑直白 | 中。delta 格式有学习成本 | 中。changeset 格式需学习 |

**决策**：A — 自行实现结构化字段对比

**理由**：
1. **对比对象是已知的有限结构**：Resume section 只有 6 种类型（personal/education/work/skills/projects/custom），每种的字段数量和类型都是固定的。这不是"对比任意 JSON"的通用问题，而是"对比已知结构的两个版本"的领域问题
2. **展示需求是语义化的**：用户期望看到的不是 `{ "op": "replace", "path": "/work/0/company", "value": "新公司" }` 这种技术性 diff，而是一个可视化的前后对比面板——左边原文、右边新文、变更字段高亮。这种展示逻辑与 Resume 数据结构深度绑定，通用 diff 库的输出仍需大量转化工作
3. **复用决策 13 的匹配逻辑**：数组 item 的匹配（判断"修改"还是"新增/删除"）在决策 13 中已定义了关键字段匹配策略。自行实现对比可以直接复用这套逻辑，而引入 jsondiffpatch 意味着维护两套独立的匹配逻辑（jsondiffpatch 的 `objectHash` 和 merge.ts 的关键字段匹配），一致性难以保证
4. **零新依赖**：实现量有限（预计 80-120 行），不值得引入额外库

**未选原因**：
- **B: jsondiffpatch**：功能强大（支持文本 diff、数组移动检测等），但对墨简的场景而言过度设计。jsondiffpatch 的 delta 格式（`{ "_t": "a", "0": [newItem, 0, 0], "_0": [oldItem, 0, 0] }`）需要专门的解析逻辑才能转化为用户可读的对比视图，开发成本并不比自行实现低。且其数组 diff 使用 LCS 算法基于 `objectHash` 匹配，与决策 13 的关键字段匹配是两套独立逻辑，存在一致性风险。~15KB 的体积对"对比已知结构"的简单需求而言也不划算
- **C: json-diff-ts**：比 jsondiffpatch 更轻量（~5KB），TypeScript 支持更好，但核心问题相同——它输出的是通用 changeset 格式，仍需大量转化才能产出语义化的用户可读对比。Resume 的结构已知且有限，直接针对结构编写对比逻辑反而更直接、更可维护

**约束条件**：
1. 对比逻辑定义在 `src/service/ai/diff.ts`（Service 层），输入为原 section 数据 + AI 返回的 section 数据，输出为结构化的 `SectionDiff` 类型（定义在 Types 层）
2. `SectionDiff` 类型需包含：变更类型（added/removed/modified/unchanged）、字段级变更详情、足够 UI 渲染对比视图的信息
3. 对比视图的 UI 渲染由 design agent 在阶段 4 设计，本决策仅确定数据层方案
4. UI 层通过 Runtime 层获取 diff 数据，禁止直接调用 Service 层的 diff 函数

---

## 技术栈增量（3.3 AI 上下文工程新增）

| 领域 | 选型 | 所属架构层 | 新增/复用 |
|---|---|---|---|
| AI 上下文序列化 | 手写纯函数 | Service (`src/service/ai/serialize.ts`) | 新增代码 |
| AI 返回 JSON 校验 | Zod Mini (Zod 4) | Service (`src/service/ai/schema.ts`) | **新增依赖** |
| 新增 item id 生成 | crypto.randomUUID() | Repo (`src/repo/`) | 复用已有 |
| Section 合并 | 手写纯函数 + 关键字段匹配 | Service (`src/service/ai/merge.ts`) | 新增代码 |
| 前后对比 | 自行实现结构化字段对比 | Service (`src/service/ai/diff.ts`) | 新增代码 |
| JSON 提取 | 正则 + JSON.parse | Service (`src/service/ai/parse.ts`) | 新增代码 |

### 新增依赖

```
zod                             ^3.24.0 (使用 zod/mini 入口) 或 ^4.0.0 (待 Zod 4 稳定版发布)
```

### 新增文件预览

```
src/types/ai.ts                 ← 新增 ResumeAiContext, SectionDiff 等类型
src/service/ai/serialize.ts     ← Resume -> AI JSON 序列化
src/service/ai/schema.ts        ← Zod schema 定义 + 校验函数
src/service/ai/parse.ts         ← AI 返回文本 -> JSON 提取 + 校验
src/service/ai/merge.ts         ← AI 返回 section 合并回 Resume
src/service/ai/diff.ts          ← section 前后对比
src/service/ai/optimize.ts      ← 重构：接受结构化输入，调用上述模块
```

---

## 待人类裁决

### Q2: Zod 版本选择 — Zod 3 (稳定) vs Zod 4 (新发布)

**背景**：Zod 4 于 2025 年中发布，引入 Zod Mini（~1.9KB gzipped，tree-shakable），性能提升 2.3x。但作为大版本发布，生态兼容性（特别是与 TypeScript 5.x strict mode 的配合）需要评估。Zod 3 则完全稳定，npm 周下载量 25M+。

**选项**：
- A: 使用 Zod 3（`^3.24.0`），`import { z } from 'zod'`。最稳定，但无 tree-shaking，gzipped ~12KB
- B: 使用 Zod 4（`^4.0.0`），`import { z } from 'zod/mini'`。最小体积（~1.9KB），最新特性，但生态较新

**影响**：体积差 ~10KB gzipped。功能上对墨简的使用场景（object/array/string/number 校验）两个版本均完全覆盖。

**阻塞**：不阻塞架构设计。schema 代码在两个版本间的迁移成本极低（API 基本兼容）。可在阶段 3（环境搭建）时最终确定。

---

## 已裁决问题

| # | 问题 | 裁决 | 裁决人 | 日期 |
|---|---|---|---|---|
| Q1 | 中文字体加载策略 | B: CDN 懒加载，首次使用按需下载，后续可通过 Service Worker 补充离线缓存 | Lucas | 2026-03-26 |
