// Runtime 层：AI 功能状态管理
// 依赖：Types, Config, Service

import { create } from 'zustand'
import type { AiOptimizeResult } from '@/types'
import { optimizeContent } from '@/service/ai'
import { getApiKey, setApiKey as saveApiKey, clearApiKey } from '@/service/settings'

interface AiState {
  /** 用户是否已配置 API Key */
  apiKeySet: boolean
  /** 是否正在优化 */
  optimizing: boolean
  /** 优化结果 */
  result: AiOptimizeResult | null
  /** 错误信息 */
  error: string | null

  /** 从持久化存储加载 API Key 状态 */
  loadApiKey: () => void
  /** 设置 API Key（保存到持久化存储） */
  setApiKey: (key: string) => void
  /** 清除 API Key */
  removeApiKey: () => void
  /** 执行 AI 优化 */
  optimize: (content: string, optionId: string) => Promise<void>
  /** 清除优化结果 */
  clearResult: () => void
}

export const useAiStore = create<AiState>((set) => ({
  apiKeySet: false,
  optimizing: false,
  result: null,
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
    set({ apiKeySet: false, result: null, error: null })
  },

  optimize: async (content: string, optionId: string) => {
    set({ optimizing: true, error: null, result: null })
    try {
      const optimized = await optimizeContent(content, optionId)
      set({
        result: { original: content, optimized, optionId },
        optimizing: false,
      })
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'AI 优化失败，请重试',
        optimizing: false,
      })
    }
  },

  clearResult: () => {
    set({ result: null, error: null })
  },
}))
