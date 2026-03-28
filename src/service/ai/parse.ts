// Service/AI 层：AI 返回文本 → JSON 安全提取 + 校验
// 依赖：Types, zod
// @req R3.3 — AI 上下文工程：AI 响应 JSON 提取 + Zod schema 校验

import { z } from 'zod'
import type { SectionType } from '@/types'

/**
 * 从 AI 返回的文本中提取 JSON
 * 处理 markdown 代码块包裹、多余文本等情况
 */
export function extractJsonFromText(text: string): unknown {
  // 1. 尝试匹配 ```json ... ``` 代码块
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/)
  if (codeBlockMatch?.[1] !== undefined) {
    return JSON.parse(codeBlockMatch[1].trim())
  }

  // 2. 尝试匹配最外层 { } 或 [ ]
  const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
  if (jsonMatch?.[1] !== undefined) {
    return JSON.parse(jsonMatch[1])
  }

  // 3. 直接尝试解析整个文本
  return JSON.parse(text.trim())
}

// Zod schemas for each section type (不含 id)
const educationItemSchema = z.object({
  school: z.string().optional().default(''),
  degree: z.string().optional().default(''),
  field: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  description: z.string().optional().default(''),
})

const workItemSchema = z.object({
  company: z.string().optional().default(''),
  position: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  description: z.string().optional().default(''),
})

const skillItemSchema = z.object({
  name: z.string().optional().default(''),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
})

const projectItemSchema = z.object({
  name: z.string().optional().default(''),
  role: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  description: z.string().optional().default(''),
  url: z.string().optional().default(''),
})

const customItemSchema = z.object({
  title: z.string().optional().default(''),
  subtitle: z.string().optional().default(''),
  date: z.string().optional().default(''),
  description: z.string().optional().default(''),
})

const personalSchema = z.object({
  name: z.string().optional().default(''),
  title: z.string().optional().default(''),
  email: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  location: z.string().optional().default(''),
  website: z.string().optional().default(''),
  summary: z.string().optional().default(''),
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
 * 校验 AI 返回的单 section 数据是否合规
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

/** AI 返回的部分简历对象 — 只包含 AI 实际修改的 section */
const partialResumeSchema = z.object({
  personal: personalSchema.optional(),
  education: z.array(educationItemSchema).optional(),
  work: z.array(workItemSchema).optional(),
  skills: z.array(skillItemSchema).optional(),
  projects: z.array(projectItemSchema).optional(),
}).passthrough() // 允许多余 key（AI 可能返回 sections 等），但只取已知 key

export type ValidatedPartialResume = {
  [K in SectionType]?: unknown
}

/**
 * 校验 AI 返回的部分简历对象
 * AI 全文优化时返回 { personal?: ..., work?: [...], education?: [...], ... }
 * 只保留合法的 section key，忽略未知字段
 */
export function validatePartialResume(data: unknown): ValidatedPartialResume {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error('AI 返回的不是 JSON 对象')
  }
  const parsed = partialResumeSchema.parse(data)
  const result: ValidatedPartialResume = {}
  const sectionKeys: SectionType[] = ['personal', 'education', 'work', 'skills', 'projects']
  for (const key of sectionKeys) {
    if (parsed[key] !== undefined) {
      result[key] = parsed[key]
    }
  }
  if (Object.keys(result).length === 0) {
    throw new Error('AI 未返回任何有效的 section 数据')
  }
  return result
}
