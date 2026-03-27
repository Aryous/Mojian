// Runtime 层：AI 功能状态管理
// 依赖：Types, Service

import { create } from 'zustand'
import type { Resume, SectionType, AiOptimizeResult, AiDiffEntry, ChatMessage } from '@/types'
import { optimizeResume } from '@/service/ai/optimize'
import { mergeAllSections } from '@/service/ai/merge'
import { generateDiffForSections } from '@/service/ai/diff'
import { extractSectionData } from '@/service/ai/serialize'
import { getApiKey, setApiKey as saveApiKey, clearApiKey } from '@/service/settings'

interface AiState {
  apiKeySet: boolean
  optimizing: boolean
  pendingResult: AiOptimizeResult | null
  diffEntries: AiDiffEntry[]
  pendingChanges: Partial<Resume> | null
  error: string | null
  /** 对话历史（多轮上下文） */
  messages: ChatMessage[]

  loadApiKey: () => void
  setApiKey: (key: string) => void
  removeApiKey: () => void
  /** AI 优化 — targetSection 可选，省略时为全文优化 */
  optimize: (resume: Resume, optionId: string, userPrompt: string, targetSection?: SectionType) => Promise<void>
  acceptResult: () => Partial<Resume> | null
  rejectResult: () => void
  clearMessages: () => void
  clearState: () => void
}

const CLEAR_PENDING = {
  pendingResult: null,
  diffEntries: [] as AiDiffEntry[],
  pendingChanges: null,
} as const

export const useAiStore = create<AiState>((set, get) => ({
  apiKeySet: false,
  optimizing: false,
  pendingResult: null,
  diffEntries: [],
  pendingChanges: null,
  error: null,
  messages: [],

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
    set({ apiKeySet: false, ...CLEAR_PENDING, error: null })
  },

  optimize: async (
    resume: Resume,
    optionId: string,
    userPrompt: string,
    targetSection?: SectionType,
  ) => {
    // 添加用户消息到对话历史
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userPrompt,
      timestamp: Date.now(),
    }
    set((s) => ({
      optimizing: true,
      error: null,
      ...CLEAR_PENDING,
      messages: [...s.messages, userMsg],
    }))

    try {
      // 构建对话历史（用于多轮上下文）
      const history = get().messages
        .filter((m) => m.id !== userMsg.id) // 排除刚添加的当前消息（会作为 userMessage 单独传）
        .map((m) => ({ role: m.role, content: m.content }))

      // 1. 调用 AI — 一次调用，返回所有修改的 section
      const result = await optimizeResume({ resume, optionId, userPrompt, targetSection, history })

      // 2. 快照原始数据（只快照 AI 实际返回的 section）
      const originalSections: Record<string, unknown> = {}
      for (const key of Object.keys(result.sections)) {
        originalSections[key] = extractSectionData(resume, key as SectionType)
      }

      // 3. 合并所有返回的 section
      const pendingChanges = mergeAllSections(resume, result.sections as Record<string, unknown>)

      // 4. 生成 diff
      const diffEntries = generateDiffForSections(originalSections, result.sections as Record<string, unknown>)

      // 5. 构建 pendingResult
      const pendingResult: AiOptimizeResult = {
        original: originalSections,
        optimized: result.sections,
        targetSection: targetSection ?? 'personal',
        optionId,
      }

      // 6. 添加 AI 回复到对话历史
      const sectionNames = Object.keys(result.sections)
      const aiReply = `已优化 ${sectionNames.join('、')} 部分，共 ${diffEntries.length} 处修改。`
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiReply,
        timestamp: Date.now(),
      }

      set((s) => ({
        optimizing: false,
        pendingResult,
        diffEntries,
        pendingChanges,
        messages: [...s.messages, aiMsg],
      }))
    } catch (e) {
      const errorText = e instanceof Error ? e.message : 'AI 优化失败，请重试'
      // 添加错误消息到对话历史
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `优化失败：${errorText}`,
        timestamp: Date.now(),
      }
      set((s) => ({
        error: errorText,
        optimizing: false,
        messages: [...s.messages, errMsg],
      }))
    }
  },

  acceptResult: () => {
    const { pendingChanges } = get()
    set({ ...CLEAR_PENDING, error: null })
    return pendingChanges
  },

  rejectResult: () => {
    set({ ...CLEAR_PENDING, error: null })
  },

  clearMessages: () => {
    set({ messages: [] })
  },

  clearState: () => {
    set({ optimizing: false, ...CLEAR_PENDING, error: null, messages: [] })
  },
}))
