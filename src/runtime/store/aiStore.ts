// Runtime 层：AI 功能状态管理
// 依赖：Types, Service

import { create } from 'zustand'
import type { Resume, SectionType, AiOptimizeResult, AiDiffEntry } from '@/types'
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

  loadApiKey: () => void
  setApiKey: (key: string) => void
  removeApiKey: () => void
  /** AI 优化 — targetSection 可选，省略时为全文优化 */
  optimize: (resume: Resume, optionId: string, userPrompt: string, targetSection?: SectionType) => Promise<void>
  acceptResult: () => Partial<Resume> | null
  rejectResult: () => void
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
    set({ optimizing: true, error: null, ...CLEAR_PENDING })

    try {
      // 1. 调用 AI — 一次调用，返回所有修改的 section
      const result = await optimizeResume({ resume, optionId, userPrompt, targetSection })

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

      set({ optimizing: false, pendingResult, diffEntries, pendingChanges })
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'AI 优化失败，请重试',
        optimizing: false,
      })
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

  clearState: () => {
    set({ optimizing: false, ...CLEAR_PENDING, error: null })
  },
}))
