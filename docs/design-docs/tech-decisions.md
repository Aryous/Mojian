---
status: approved
author: tech-selection
date: 2026-03-26
blocks: [design, feature]
open_questions: 0
approved_by: Lucas
approved_date: 2026-03-26
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

## 已裁决问题

| # | 问题 | 裁决 | 裁决人 | 日期 |
|---|---|---|---|---|
| Q1 | 中文字体加载策略 | B: CDN 懒加载，首次使用按需下载，后续可通过 Service Worker 补充离线缓存 | Lucas | 2026-03-26 |
