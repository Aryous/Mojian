---
status: review
author: coordinator
date: 2026-03-27
depends_on:
  - docs/product-specs/requirements.md (approved)
  - docs/tech/tech-decisions.md (approved)
  - docs/design-docs/design-spec.md (approved)
---

# AI 上下文工程 — JSON 中间数据层 实施计划

> **For agentic workers:** Use feature agent to implement this plan task-by-task.

**Goal:** 将 AI 优化从纯文本拼接重构为结构化 JSON 数据流，使 AI 能正确读取简历结构、精准写回修改、完整接收用户意图。

**Architecture:** Resume JSON 作为共享数据层。序列化（Resume→AI JSON）在 Service 层，AI 返回 JSON 经校验+合并写回 Resume。UI 层展示前后对比，用户批量接受/拒绝。

**Tech Stack:** Zod（JSON 校验）、crypto.randomUUID()（新 item id 生成）、手写序列化/合并/对比函数

---

## 文件规划

| 文件 | 操作 | 职责 |
|---|---|---|
| `src/types/ai.ts` | 修改 | 扩展 AiOptimizeResult 类型，新增 AiOptimizeRequest 类型 |
| `src/service/ai/serialize.ts` | 新建 | Resume → AI JSON 序列化 |
| `src/service/ai/parse.ts` | 新建 | AI 返回文本 → JSON 提取 + Zod 校验 |
| `src/service/ai/merge.ts` | 新建 | AI JSON → Resume 合并（数组替换 + id 回填/生成） |
| `src/service/ai/diff.ts` | 新建 | 前后对比数据生成 |
| `src/service/ai/optimize.ts` | 重写 | 新签名：接收 Resume + targetSection + userPrompt |
| `src/service/ai/index.ts` | 修改 | 导出新模块 |
| `src/config/ai.ts` | 修改 | system prompt 追加 JSON 输出格式指令 |
| `src/runtime/store/aiStore.ts` | 重写 | 新状态：pendingResult（含 diff）、accept/reject actions |
| `src/ui/pages/EditorPage/AiDrawer.tsx` | 重写 | 对比视图 + 接受/拒绝 UI + 传递 Resume 而非纯文本 |
| `src/ui/pages/EditorPage/AiDrawer.module.css` | 修改 | 对比视图样式 |
| `src/ui/pages/EditorPage/EditorPage.tsx` | 修改 | 传递 Resume 对象（而非 resumeTextContent） |

---

## Task 1: Types 层 — 扩展 AI 类型定义

**Files:**
- Modify: `src/types/ai.ts`
- Modify: `src/types/index.ts`

**目标:** 定义新的 AI 请求/响应类型，供后续所有 Task 依赖。

- [ ] **Step 1: 扩展 `src/types/ai.ts`**

在现有类型基础上新增：

```typescript
import type { SectionType, Resume } from './resume'

/** AI 优化请求（结构化） */
export interface AiOptimizeRequest {
  /** 完整简历数据（序列化后发送给 AI） */
  resume: Resume
  /** 优化选项 ID */
  optionId: string
  /** 用户自由文本指令（原文传递） */
  userPrompt: string
  /** 目标 section 类型（null = 全文优化） */
  targetSection: SectionType | null
}

/** AI 返回的 section 数据（泛型，按 section 类型不同） */
export interface AiSectionResult {
  sectionType: SectionType
  /** AI 返回的该 section 的完整数据（items 数组或 personal 对象） */
  data: unknown
}

/** AI 优化结果（结构化） */
export interface AiOptimizeResult {
  /** 优化前的 section 数据快照 */
  original: unknown
  /** AI 返回的优化后数据 */
  optimized: unknown
  /** 目标 section 类型 */
  targetSection: SectionType
  /** 使用的优化选项 */
  optionId: string
}

/** 对比视图中的单个变更 */
export interface AiDiffEntry {
  /** 字段路径，如 "work[0].description" */
  path: string
  /** 变更类型 */
  type: 'modified' | 'added' | 'removed'
  /** 旧值（removed/modified 时有值） */
  oldValue?: string
  /** 新值（added/modified 时有值） */
  newValue?: string
}
```

- [ ] **Step 2: 更新 `src/types/index.ts` 导出**

追加导出新类型：

```typescript
export type {
  AiOptimizeOption,
  AiOptimizeResult,
  AiOptimizeRequest,
  AiSectionResult,
  AiDiffEntry,
} from './ai'
```

- [ ] **Step 3: 类型检查**

运行 `npx tsc -b --noEmit` 确认编译通过。

- [ ] **Step 4: Commit**

```bash
git add src/types/ai.ts src/types/index.ts
git commit -m "feat(types): add structured AI request/response types for context engineering"
```

---

## Task 2: Service 层 — serialize.ts + parse.ts

**Files:**
- Create: `src/service/ai/serialize.ts`
- Create: `src/service/ai/parse.ts`

**目标:** 实现 Resume→AI JSON 序列化（剥离系统字段）和 AI 返回文本→JSON 安全提取。

- [ ] **Step 1: 创建 `src/service/ai/serialize.ts`**

```typescript
// Service/AI 层：Resume → AI JSON 序列化
// 依赖：Types

import type { Resume, SectionType } from '@/types'

/**
 * 将 Resume 序列化为 AI 可理解的 JSON 对象
 * 剥离系统字段（id、createdAt、updatedAt、templateId），保留结构化内容
 */
export function serializeResumeForAi(resume: Resume): Record<string, unknown> {
  return {
    personal: {
      name: resume.personal.name,
      title: resume.personal.title,
      email: resume.personal.email,
      phone: resume.personal.phone,
      location: resume.personal.location,
      website: resume.personal.website,
      summary: resume.personal.summary,
    },
    sections: resume.sections
      .filter((s) => s.visible)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => ({ type: s.type, title: s.title })),
    education: resume.education.map(({ id: _, ...rest }) => rest),
    work: resume.work.map(({ id: _, ...rest }) => rest),
    skills: resume.skills.map(({ id: _, ...rest }) => rest),
    projects: resume.projects.map(({ id: _, ...rest }) => rest),
    custom: Object.fromEntries(
      Object.entries(resume.custom).map(([key, items]) => [
        key,
        items.map(({ id: _, ...rest }) => rest),
      ]),
    ),
  }
}

/**
 * 提取指定 section 的数据（用于构建 AI prompt 中的 target 指示）
 */
export function extractSectionData(
  resume: Resume,
  sectionType: SectionType,
): unknown {
  switch (sectionType) {
    case 'personal':
      return serializeResumeForAi(resume).personal
    case 'education':
      return serializeResumeForAi(resume).education
    case 'work':
      return serializeResumeForAi(resume).work
    case 'skills':
      return serializeResumeForAi(resume).skills
    case 'projects':
      return serializeResumeForAi(resume).projects
    case 'custom':
      return serializeResumeForAi(resume).custom
  }
}
```

- [ ] **Step 2: 安装 Zod 依赖**

```bash
npm install zod
```

- [ ] **Step 3: 创建 `src/service/ai/parse.ts`**

```typescript
// Service/AI 层：AI 返回文本 → JSON 安全提取 + 校验
// 依赖：Types, zod

import { z } from 'zod'
import type { SectionType } from '@/types'

/**
 * 从 AI 返回的文本中提取 JSON
 * 处理 markdown 代码块包裹、多余文本等情况
 */
export function extractJsonFromText(text: string): unknown {
  // 1. 尝试匹配 ```json ... ``` 代码块
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/)
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1].trim())
  }

  // 2. 尝试匹配最外层 { } 或 [ ]
  const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1])
  }

  // 3. 直接尝试解析整个文本
  return JSON.parse(text.trim())
}

// Zod schemas for each section type (不含 id)
const educationItemSchema = z.object({
  school: z.string(),
  degree: z.string(),
  field: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
})

const workItemSchema = z.object({
  company: z.string(),
  position: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
})

const skillItemSchema = z.object({
  name: z.string(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
})

const projectItemSchema = z.object({
  name: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
  url: z.string(),
})

const customItemSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  date: z.string(),
  description: z.string(),
})

const personalSchema = z.object({
  name: z.string(),
  title: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  website: z.string(),
  summary: z.string(),
})

const sectionSchemaMap: Record<SectionType, z.ZodSchema> = {
  personal: personalSchema,
  education: z.array(educationItemSchema),
  work: z.array(workItemSchema),
  skills: z.array(skillItemSchema),
  projects: z.array(projectItemSchema),
  custom: z.array(customItemSchema),
}

/**
 * 校验 AI 返回的 section 数据是否合规
 * @returns 校验后的数据（Zod 会剥离多余字段）
 * @throws ZodError 包含具体错误路径
 */
export function validateSectionData(
  sectionType: SectionType,
  data: unknown,
): unknown {
  const schema = sectionSchemaMap[sectionType]
  return schema.parse(data)
}
```

- [ ] **Step 4: 类型检查**

```bash
npx tsc -b --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/service/ai/serialize.ts src/service/ai/parse.ts package.json package-lock.json
git commit -m "feat(service/ai): add serialize and parse modules for structured AI data flow"
```

---

## Task 3: Service 层 — merge.ts + diff.ts

**Files:**
- Create: `src/service/ai/merge.ts`
- Create: `src/service/ai/diff.ts`

**目标:** 实现 AI 返回 JSON → Resume 合并（数组替换 + id 回填/生成）和前后对比数据生成。

- [ ] **Step 1: 创建 `src/service/ai/merge.ts`**

```typescript
// Service/AI 层：AI JSON → Resume 合并
// 依赖：Types

import type {
  Resume,
  SectionType,
  PersonalInfo,
  EducationItem,
  WorkItem,
  SkillItem,
  ProjectItem,
  CustomItem,
} from '@/types'

/**
 * 将 AI 返回的 section 数据合并回 Resume
 * 策略：按 section 类型整段替换数组，通过关键字段匹配回填 id
 * 新增 item 自动生成 id，删除的 item 直接丢弃
 */
export function mergeAiResult(
  resume: Resume,
  sectionType: SectionType,
  aiData: unknown,
): Partial<Resume> {
  switch (sectionType) {
    case 'personal':
      return { personal: mergePersonal(resume.personal, aiData as Partial<PersonalInfo>) }
    case 'education':
      return { education: mergeItems(resume.education, aiData as Omit<EducationItem, 'id'>[], matchEducation) }
    case 'work':
      return { work: mergeItems(resume.work, aiData as Omit<WorkItem, 'id'>[], matchWork) }
    case 'skills':
      return { skills: mergeItems(resume.skills, aiData as Omit<SkillItem, 'id'>[], matchSkill) }
    case 'projects':
      return { projects: mergeItems(resume.projects, aiData as Omit<ProjectItem, 'id'>[], matchProject) }
    case 'custom':
      // custom 暂不支持 AI 修改，返回空
      return {}
  }
}

/** personal 是对象，直接覆盖所有字段 */
function mergePersonal(original: PersonalInfo, aiData: Partial<PersonalInfo>): PersonalInfo {
  return { ...original, ...aiData }
}

/**
 * 泛型数组合并：
 * 1. 对 AI 返回的每个 item，尝试用 matchFn 匹配原数组中的 item
 * 2. 匹配到 → 回填原 id
 * 3. 未匹配 → 生成新 id（crypto.randomUUID()）
 */
function mergeItems<T extends { id: string }>(
  originals: T[],
  aiItems: Omit<T, 'id'>[],
  matchFn: (original: T, aiItem: Omit<T, 'id'>) => boolean,
): T[] {
  const used = new Set<number>()

  return aiItems.map((aiItem) => {
    const matchIndex = originals.findIndex(
      (orig, idx) => !used.has(idx) && matchFn(orig, aiItem),
    )
    if (matchIndex >= 0) {
      used.add(matchIndex)
      return { ...aiItem, id: originals[matchIndex].id } as T
    }
    return { ...aiItem, id: crypto.randomUUID() } as T
  })
}

// 匹配函数：用不易被 AI 修改的字段作为 key
function matchEducation(orig: EducationItem, ai: Omit<EducationItem, 'id'>): boolean {
  return orig.school === ai.school && orig.startDate === ai.startDate
}

function matchWork(orig: WorkItem, ai: Omit<WorkItem, 'id'>): boolean {
  return orig.company === ai.company && orig.startDate === ai.startDate
}

function matchSkill(orig: SkillItem, ai: Omit<SkillItem, 'id'>): boolean {
  return orig.name === ai.name
}

function matchProject(orig: ProjectItem, ai: Omit<ProjectItem, 'id'>): boolean {
  return orig.name === ai.name && orig.startDate === ai.startDate
}
```

- [ ] **Step 2: 创建 `src/service/ai/diff.ts`**

```typescript
// Service/AI 层：前后对比数据生成
// 依赖：Types

import type { AiDiffEntry, SectionType } from '@/types'

/**
 * 生成 AI 修改前后的对比数据
 * 用于 UI 展示 diff 视图
 */
export function generateDiff(
  sectionType: SectionType,
  original: unknown,
  optimized: unknown,
): AiDiffEntry[] {
  if (sectionType === 'personal') {
    return diffObject(original as Record<string, string>, optimized as Record<string, string>, '')
  }

  // 数组类型的 section
  const origArr = original as Record<string, string>[]
  const optArr = optimized as Record<string, string>[]
  const entries: AiDiffEntry[] = []

  const maxLen = Math.max(origArr.length, optArr.length)
  for (let i = 0; i < maxLen; i++) {
    const prefix = `${sectionType}[${i}]`
    if (i >= origArr.length) {
      // 新增 item
      entries.push({ path: prefix, type: 'added', newValue: summarizeItem(optArr[i]) })
    } else if (i >= optArr.length) {
      // 删除 item
      entries.push({ path: prefix, type: 'removed', oldValue: summarizeItem(origArr[i]) })
    } else {
      // 可能修改
      entries.push(...diffObject(origArr[i], optArr[i], prefix))
    }
  }

  return entries
}

function diffObject(
  original: Record<string, string>,
  optimized: Record<string, string>,
  prefix: string,
): AiDiffEntry[] {
  const entries: AiDiffEntry[] = []
  const allKeys = new Set([...Object.keys(original), ...Object.keys(optimized)])

  for (const key of allKeys) {
    const path = prefix ? `${prefix}.${key}` : key
    const oldVal = original[key] ?? ''
    const newVal = optimized[key] ?? ''
    if (oldVal !== newVal) {
      entries.push({
        path,
        type: oldVal === '' ? 'added' : newVal === '' ? 'removed' : 'modified',
        oldValue: oldVal || undefined,
        newValue: newVal || undefined,
      })
    }
  }

  return entries
}

function summarizeItem(item: Record<string, string>): string {
  const vals = Object.values(item).filter(Boolean)
  return vals.slice(0, 3).join(' / ')
}
```

- [ ] **Step 3: 类型检查**

```bash
npx tsc -b --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/service/ai/merge.ts src/service/ai/diff.ts
git commit -m "feat(service/ai): add merge and diff modules for AI result processing"
```

---

## Task 4: Service 层 — 重写 optimize.ts + 更新 prompt + 更新 index

**Files:**
- Rewrite: `src/service/ai/optimize.ts`
- Modify: `src/config/ai.ts`
- Modify: `src/service/ai/index.ts`

**目标:** 重写 AI 调用核心，新签名接收结构化数据，prompt 中注入 JSON 格式指令，返回结构化结果。

- [x] **Step 1: 重写 `src/service/ai/optimize.ts`**

```typescript
// Service/AI 层：简历内容优化（结构化 JSON 数据流）
// 依赖：Config, Types, provider.ts, serialize.ts, parse.ts

import { AI_OPTIMIZE_OPTIONS } from '@/config'
import type { Resume, SectionType } from '@/types'
import { getAiClient, defaultModel } from './provider'
import { serializeResumeForAi } from './serialize'
import { extractJsonFromText, validateSectionData } from './parse'

export interface OptimizeParams {
  resume: Resume
  optionId: string
  userPrompt: string
  targetSection: SectionType
}

/**
 * 使用 AI 优化简历的指定 section
 * @returns AI 返回的经过校验的 section 数据
 */
export async function optimizeSection(params: OptimizeParams): Promise<unknown> {
  const { resume, optionId, userPrompt, targetSection } = params

  const option = AI_OPTIMIZE_OPTIONS.find((o) => o.id === optionId)
  if (!option) {
    throw new Error(`未知的优化选项: ${optionId}`)
  }

  const serialized = serializeResumeForAi(resume)
  const client = getAiClient()

  // 构建 user message
  const userMessage = buildUserMessage(serialized, targetSection, userPrompt)

  // 构建 system message（原有 prompt + JSON 格式指令）
  const systemMessage = buildSystemMessage(option.systemPrompt, targetSection)

  const response = await client.chat.completions.create({
    model: defaultModel,
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  })

  const rawText = response.choices[0]?.message?.content
  if (!rawText) {
    throw new Error('AI 未返回有效内容，请重试。')
  }

  // 提取 JSON + 校验
  const parsed = extractJsonFromText(rawText)
  const validated = validateSectionData(targetSection, parsed)

  return validated
}

function buildSystemMessage(basePrompt: string, targetSection: SectionType): string {
  return `${basePrompt}

## 输出格式要求（严格遵守）

你必须仅返回一段合法 JSON，不要添加任何解释、前缀或后缀文字。
${targetSection === 'personal'
    ? '返回一个 JSON 对象，包含 personal 的所有字段（name, title, email, phone, location, website, summary）。'
    : `返回一个 JSON 数组，每个元素是一个 ${targetSection} 条目。不要包含 id 字段。`
  }
你可以新增或删除条目，但不要改变数据结构。`
}

function buildUserMessage(
  serialized: Record<string, unknown>,
  targetSection: SectionType,
  userPrompt: string,
): string {
  const parts: string[] = []

  parts.push('## 完整简历数据')
  parts.push('```json')
  parts.push(JSON.stringify(serialized, null, 2))
  parts.push('```')

  parts.push(`\n## 优化目标\n请仅优化 **${targetSection}** 部分。`)

  if (userPrompt.trim()) {
    parts.push(`\n## 用户指令\n${userPrompt}`)
  }

  parts.push(`\n## 输出\n请直接返回优化后的 ${targetSection} 的 JSON${targetSection === 'personal' ? '对象' : '数组'}，不要包含其他内容。`)

  return parts.join('\n')
}

// 保留旧函数签名供过渡期兼容（可在后续 Task 中删除）
export async function optimizeContent(
  content: string,
  optionId: string,
): Promise<string> {
  const option = AI_OPTIMIZE_OPTIONS.find((o) => o.id === optionId)
  if (!option) throw new Error(`未知的优化选项: ${optionId}`)

  const client = getAiClient()
  const response = await client.chat.completions.create({
    model: defaultModel,
    messages: [
      { role: 'system', content: option.systemPrompt },
      { role: 'user', content },
    ],
    temperature: 0.7,
    max_tokens: 2048,
  })

  const result = response.choices[0]?.message?.content
  if (!result) throw new Error('AI 未返回有效内容，请重试。')
  return result.trim()
}
```

- [x] **Step 2: 更新 `src/service/ai/index.ts`**

```typescript
// Service/AI 层：AI API 调用（OpenAI SDK via OpenRouter）
// 依赖：Repo, Config, Types

export { getAiClient, defaultModel } from './provider'
export { optimizeContent, optimizeSection } from './optimize'
export type { OptimizeParams } from './optimize'
export { serializeResumeForAi, extractSectionData } from './serialize'
export { extractJsonFromText, validateSectionData } from './parse'
export { mergeAiResult } from './merge'
export { generateDiff } from './diff'
```

- [x] **Step 3: 类型检查**

```bash
npx tsc -b --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/service/ai/optimize.ts src/service/ai/index.ts
git commit -m "feat(service/ai): rewrite optimize with structured JSON data flow"
```

---

## Task 5: Runtime 层 — 重写 aiStore

**Files:**
- Rewrite: `src/runtime/store/aiStore.ts`

**目标:** Store 支持结构化优化流程：发起请求 → 收到结果 → 展示对比 → 接受/拒绝。

- [ ] **Step 1: 重写 `src/runtime/store/aiStore.ts`**

```typescript
// Runtime 层：AI 功能状态管理
// 依赖：Types, Service

import { create } from 'zustand'
import type { Resume, SectionType, AiOptimizeResult, AiDiffEntry } from '@/types'
import { optimizeSection } from '@/service/ai/optimize'
import { mergeAiResult } from '@/service/ai/merge'
import { generateDiff } from '@/service/ai/diff'
import { extractSectionData } from '@/service/ai/serialize'
import { getApiKey, setApiKey as saveApiKey, clearApiKey } from '@/service/settings'

interface AiState {
  /** 用户是否已配置 API Key */
  apiKeySet: boolean
  /** 是否正在优化 */
  optimizing: boolean
  /** 待确认的优化结果（用户尚未接受/拒绝） */
  pendingResult: AiOptimizeResult | null
  /** 对比数据 */
  diffEntries: AiDiffEntry[]
  /** 合并后的 Resume 变更（用户接受时应用） */
  pendingChanges: Partial<Resume> | null
  /** 错误信息 */
  error: string | null

  /** 从持久化存储加载 API Key 状态 */
  loadApiKey: () => void
  /** 设置 API Key */
  setApiKey: (key: string) => void
  /** 清除 API Key */
  removeApiKey: () => void
  /** 执行结构化 AI 优化 */
  optimizeResume: (
    resume: Resume,
    optionId: string,
    userPrompt: string,
    targetSection: SectionType,
  ) => Promise<void>
  /** 接受 AI 优化结果，返回要应用到 Resume 的变更 */
  acceptResult: () => Partial<Resume> | null
  /** 拒绝 AI 优化结果 */
  rejectResult: () => void
  /** 清除状态 */
  clearState: () => void
}

export const useAiStore = create<AiState>((set, get) => ({
  apiKeySet: false,
  optimizing: false,
  pendingResult: null,
  diffEntries: [],
  pendingChanges: null,
  error: null,

  loadApiKey: () => {
    const key = getApiKey()
    set({ apiKeySet: !!key })
  },

  setApiKey: (key: string) => {
    saveApiKey(key)
    set({ apiKeySet: true, error: null })
  },

  removeApiKey: () => {
    clearApiKey()
    set({ apiKeySet: false, pendingResult: null, diffEntries: [], pendingChanges: null, error: null })
  },

  optimizeResume: async (resume, optionId, userPrompt, targetSection) => {
    set({ optimizing: true, error: null, pendingResult: null, diffEntries: [], pendingChanges: null })
    try {
      // 快照原始数据
      const originalData = extractSectionData(resume, targetSection)

      // 调用 AI
      const optimizedData = await optimizeSection({
        resume,
        optionId,
        userPrompt,
        targetSection,
      })

      // 计算合并结果
      const changes = mergeAiResult(resume, targetSection, optimizedData)

      // 生成对比数据
      const diff = generateDiff(targetSection, originalData, optimizedData)

      set({
        pendingResult: {
          original: originalData,
          optimized: optimizedData,
          targetSection,
          optionId,
        },
        diffEntries: diff,
        pendingChanges: changes,
        optimizing: false,
      })
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'AI 优化失败，请重试',
        optimizing: false,
      })
    }
  },

  acceptResult: () => {
    const { pendingChanges } = get()
    set({ pendingResult: null, diffEntries: [], pendingChanges: null, error: null })
    return pendingChanges
  },

  rejectResult: () => {
    set({ pendingResult: null, diffEntries: [], pendingChanges: null, error: null })
  },

  clearState: () => {
    set({ pendingResult: null, diffEntries: [], pendingChanges: null, error: null, optimizing: false })
  },
}))
```

- [ ] **Step 2: 类型检查**

```bash
npx tsc -b --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/runtime/store/aiStore.ts
git commit -m "feat(runtime): rewrite aiStore for structured AI optimize flow"
```

---

## Task 6: UI 层 — 重写 AiDrawer + EditorPage 集成

**Files:**
- Rewrite: `src/ui/pages/EditorPage/AiDrawer.tsx`
- Modify: `src/ui/pages/EditorPage/AiDrawer.module.css`
- Modify: `src/ui/pages/EditorPage/EditorPage.tsx`

**目标:** AiDrawer 接收完整 Resume，展示对比视图，用户批量接受/拒绝。EditorPage 传递 Resume 对象并处理接受回调。

- [ ] **Step 1: 修改 EditorPage.tsx — 更新 props 传递**

删除 `resumeTextContent` useMemo 和旧的 `handleAiAccept`，改为：

```typescript
// 替换旧的 handleAiAccept
const handleAiAccept = useCallback(
  (changes: Partial<Resume>) => {
    updateCurrentResume(changes)
  },
  [updateCurrentResume],
)

// AiDrawer 传参改为：
<AiDrawer
  open={aiOpen}
  onClose={handleCloseAi}
  resume={currentResume}
  onAccept={handleAiAccept}
/>
```

删除 `resumeTextContent` 相关代码（不再使用纯文本拼接）。

- [ ] **Step 2: 重写 `AiDrawer.tsx`**

核心改动：
- Props: `content: string` → `resume: Resume | null`
- Props: `onAccept: (optimized: string)` → `onAccept: (changes: Partial<Resume>)`
- Quick actions 调用 `optimizeResume(resume, optionId, prompt, targetSection)`
- 默认 targetSection 从 quick action 推断（润色/量化/精简 → 全文依次选 work → personal；岗位匹配 → work）
- 用户自由文本发送时 default targetSection = 'work'
- AI 返回后展示对比视图（diff entries），用户点击"接受"或"拒绝"
- 接受时 `onAccept(store.acceptResult())`

```typescript
// 关键接口变化
interface AiDrawerProps {
  open: boolean
  onClose: () => void
  resume: Resume | null
  onAccept: (changes: Partial<Resume>) => void
}
```

对比视图 UI：
- 当 `pendingResult` 存在时，显示 diff 区域而非聊天消息
- 每个 `AiDiffEntry` 渲染为一行：路径 + 旧值（删除线）+ 新值（高亮）
- 底部两个按钮：「采纳修改」和「放弃」

- [ ] **Step 3: 更新 `AiDrawer.module.css`**

新增对比视图样式（使用现有设计令牌）：

```css
.diffSection { ... }
.diffEntry { ... }
.diffPath { ... }
.diffOld { text-decoration: line-through; color: var(--sem-status-error); }
.diffNew { color: var(--sem-status-success); }
.diffActions { display: flex; gap: var(--space-3); padding: var(--space-3); }
.acceptBtn { ... }
.rejectBtn { ... }
```

- [ ] **Step 4: 类型检查 + 手动验证**

```bash
npx tsc -b --noEmit
npm run dev
```

手动测试：
1. 点击"润色全文"→ AI 返回后显示 diff 对比视图
2. 点击"采纳修改"→ 修改写入 Resume，预览更新
3. 点击"放弃"→ 恢复原始状态

- [ ] **Step 5: Commit**

```bash
git add src/ui/pages/EditorPage/AiDrawer.tsx src/ui/pages/EditorPage/AiDrawer.module.css src/ui/pages/EditorPage/EditorPage.tsx
git commit -m "feat(ui): rewrite AiDrawer with structured JSON flow and diff comparison view"
```

---

## Task 7: 清理 + 回归验证

**Files:**
- Modify: `src/service/ai/optimize.ts` (删除旧 `optimizeContent`)
- Verify: 全量类型检查 + 测试

- [ ] **Step 1: 删除旧的 `optimizeContent` 函数和旧导出**

从 `optimize.ts` 删除 `optimizeContent` 函数。
从 `index.ts` 删除 `optimizeContent` 导出。

- [ ] **Step 2: 全量类型检查**

```bash
npx tsc -b --noEmit
```

- [ ] **Step 3: 运行已有测试**

```bash
npx vitest run
```

- [ ] **Step 4: 手动验证验收标准**

| AC | 验证方法 |
|---|---|
| AC1 | 浏览器 Network 面板查看 AI 请求体，确认包含 JSON 结构 |
| AC2 | 分别对 work 和 education 执行优化，确认 AI 只修改目标 section |
| AC3 | 优化 work 后，检查 education/skills/personal 数据未变 |
| AC4 | 在输入框输入"用 STAR 法则重写"，Network 面板确认 user message 包含原文 |
| AC5 | 模拟 AI 返回非法 JSON（可临时改 parse.ts），确认错误提示不崩溃 |
| AC6 | 点击某个 section 的优化按钮，确认仅返回该 section 数据 |
| AC7 | 优化前后对比 Resume 的 id/createdAt/updatedAt/templateId，确认不变 |

- [ ] **Step 5: 最终 Commit**

```bash
git add -A
git commit -m "chore(ai): remove legacy optimizeContent, finalize context engineering"
```
