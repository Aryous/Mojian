// AI 相关类型定义
// Types 层：最底层，不依赖任何其他层

import type { SectionType, Resume } from './resume'

/** 对话消息 */
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

/** AI 优化选项 */
export interface AiOptimizeOption {
  id: string
  name: string
  description: string
  systemPrompt: string
}

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
