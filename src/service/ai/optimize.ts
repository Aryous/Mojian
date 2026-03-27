// Service/AI 层：简历内容优化
// 依赖：Config, Types, provider.ts, serialize.ts, parse.ts
// @req R3.3 — AI 上下文工程：编排层 (buildSystemMessage, buildUserMessage, API 调用)
// @req F12 — AI 自动路由：classifyUserIntent 轻量分类

import { AI_OPTIMIZE_OPTIONS } from '@/config'
import type { Resume, SectionType } from '@/types'
import { getAiClient, defaultModel } from './provider'
import { serializeResumeForAi } from './serialize'
import { extractJsonFromText, validateSectionData, validatePartialResume } from './parse'
import type { ValidatedPartialResume } from './parse'

/** 可用于自动路由的优化策略 ID（排除 generate，冷启动不参与路由） */
const ROUTABLE_IDS = ['polish', 'quantify', 'concise', 'match-job'] as const

/**
 * 轻量 AI 调用：根据用户自由文本自动选择最合适的优化策略。
 * 返回 optionId（polish / quantify / concise / match-job），默认 polish。
 */
export async function classifyUserIntent(userPrompt: string): Promise<string> {
  const client = getAiClient()
  const response = await client.chat.completions.create({
    model: defaultModel,
    messages: [
      {
        role: 'system',
        content: `你是一个意图分类器。根据用户对简历的优化指令，返回最匹配的策略 ID。

可选策略：
- polish — 润色表述、改善措辞、替换弱动词、修正语病、翻译、改写
- quantify — 量化成果、添加数据指标、用数字说话
- concise — 精简内容、删除冗余、缩短篇幅
- match-job — 匹配岗位、JD 对齐、突出相关经验、ATS 优化

规则：
- 只返回一个策略 ID，不要输出任何其他内容
- 如果无法明确判断，返回 polish`,
      },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0,
    max_tokens: 20,
  })

  const raw = response.choices[0]?.message?.content?.trim().toLowerCase() ?? ''
  // 校验返回值是否合法，不合法则 fallback
  if ((ROUTABLE_IDS as readonly string[]).includes(raw)) return raw
  return 'polish'
}

export interface OptimizeParams {
  resume: Resume
  optionId: string
  userPrompt: string
  /** 目标 section — 有值时 AI 聚焦该 section 并返回单 section；省略时 AI 优化全文并返回多 section 对象 */
  targetSection?: SectionType
  /** 对话历史（多轮上下文），最近 N 轮的 user/assistant 消息 */
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}

export interface OptimizeResult {
  /** AI 返回的各 section 数据，key 是 section type */
  sections: ValidatedPartialResume
}

/**
 * AI 优化简历 — 统一入口
 *
 * - targetSection 有值：prompt 指示 AI 聚焦该 section，AI 返回单 section 数据
 * - targetSection 省略：prompt 指示 AI 优化全文，AI 返回 { personal?, education?, work?, ... } 对象
 *
 * 一次 API 调用，一次返回。
 */
export async function optimizeResume(params: OptimizeParams): Promise<OptimizeResult> {
  const { resume, optionId, userPrompt, targetSection, history } = params

  const option = AI_OPTIMIZE_OPTIONS.find((o) => o.id === optionId)
  if (!option) throw new Error(`未知的优化选项: ${optionId}`)

  const serialized = serializeResumeForAi(resume)
  const client = getAiClient()

  const systemMessage = buildSystemMessage(option.systemPrompt, targetSection)
  const userMessage = buildUserMessage(serialized, targetSection, userPrompt)

  // 构建消息列表：system + 历史对话 + 当前用户消息
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemMessage },
  ]

  // 注入最近对话历史（限制 10 条 = 5 轮，控制 token）
  if (history && history.length > 0) {
    const recentHistory = history.slice(-10)
    for (const msg of recentHistory) {
      messages.push({ role: msg.role, content: msg.content })
    }
  }

  messages.push({ role: 'user', content: userMessage })

  const response = await client.chat.completions.create({
    model: defaultModel,
    messages,
    temperature: 0.7,
    max_tokens: 4096,
  })

  const rawText = response.choices[0]?.message?.content
  if (!rawText) throw new Error('AI 未返回有效内容，请重试。')

  const parsed = extractJsonFromText(rawText)

  if (targetSection) {
    // 单 section 模式：AI 返回的是单个 section 的数据（数组或对象）
    const validated = validateSectionData(targetSection, parsed)
    return { sections: { [targetSection]: validated } }
  } else {
    // 全文模式：AI 返回的是 { personal?: ..., work?: [...], ... } 对象
    const validated = validatePartialResume(parsed)
    return { sections: validated }
  }
}

// ── prompt 构建 ────────────────────────────────────────────────────────────────

function buildSystemMessage(basePrompt: string, targetSection?: SectionType): string {
  let jsonInstruction: string

  if (!targetSection) {
    // 全文模式
    jsonInstruction = `\n\n## 输出格式要求（严格遵守）

你必须且只能输出一个合法的 JSON 对象，格式如下：
{
  "personal": { "name": "...", "title": "...", "email": "...", "phone": "...", "location": "...", "website": "...", "summary": "..." },
  "education": [ { "school": "...", "degree": "...", "field": "...", "startDate": "...", "endDate": "...", "description": "..." } ],
  "work": [ { "company": "...", "position": "...", "startDate": "...", "endDate": "...", "description": "..." } ],
  "projects": [ { "name": "...", "role": "...", "startDate": "...", "endDate": "...", "description": "...", "url": "..." } ]
}

只包含你实际修改了的 section。如果某个 section 不需要修改，不要包含它。
不要包含 id 字段。不要包含 skills（除非用户明确要求）。
description 和 summary 字段中如需换行（如列表、分段），使用 \\n 换行符。例如："- 成果一\\n- 成果二"。
不要输出任何解释文字，不要在 JSON 前后添加额外内容。`
  } else if (targetSection === 'personal') {
    jsonInstruction = `\n\n## 输出格式要求（严格遵守）

你必须且只能输出一个合法的 JSON 对象，包含以下字段：name、title、email、phone、location、website、summary。
summary 字段中如需换行（如列表、分段），使用 \\n 换行符。
不要输出任何解释文字，不要在 JSON 前后添加额外内容，不要改变字段名称。`
  } else {
    jsonInstruction = `\n\n## 输出格式要求（严格遵守）

你必须且只能输出一个合法的 JSON 数组，数组每个元素对应一条记录。
不要包含 id 字段。可以新增或删除条目，但不要改变每条记录的字段结构（字段名必须与输入一致）。
description 字段中如需换行（如列表、分段），使用 \\n 换行符。例如："- 成果一\\n- 成果二"。
不要输出任何解释文字，不要在 JSON 前后添加额外内容。`
  }

  return basePrompt + jsonInstruction
}

function buildUserMessage(
  serialized: Record<string, unknown>,
  targetSection: SectionType | undefined,
  userPrompt: string,
): string {
  const parts: string[] = [
    '以下是完整的简历数据（JSON 格式）：',
    '',
    '```json',
    JSON.stringify(serialized, null, 2),
    '```',
  ]

  if (targetSection) {
    const sectionNameMap: Record<SectionType, string> = {
      personal: '个人信息（personal）',
      education: '教育经历（education）',
      work: '工作经历（work）',
      skills: '技能（skills）',
      projects: '项目经验（projects）',
      custom: '自定义（custom）',
    }
    parts.push('', `**优化目标**：仅优化 ${sectionNameMap[targetSection]} 部分，其他 section 不要修改。`)
    parts.push('', `**输出要求**：只输出 ${targetSection === 'personal' ? '该 section 的 JSON 对象' : '该 section 的 JSON 数组'}，不要包含其他内容。`)
  } else {
    parts.push('', '**优化目标**：优化整份简历，你认为需要修改的 section 都可以修改。')
    parts.push('', '**输出要求**：输出一个 JSON 对象，key 是 section 名称（personal / education / work / projects），value 是修改后的数据。只包含你实际修改了的 section。')
  }

  if (userPrompt.trim()) {
    parts.push('', `**用户指令**：${userPrompt.trim()}`)
  }

  return parts.join('\n')
}
