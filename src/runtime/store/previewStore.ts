// Runtime 层：预览状态管理
// 负责 Typst 编译结果的状态，UI 层通过此 store 获取预览数据

import { create } from 'zustand'
import type { Resume } from '@/types'
import { compileToVector } from '@/service/typst'

interface PreviewState {
  /** 编译产物（vector 格式） */
  artifact: Uint8Array | null
  /** 编译错误信息 */
  error: string | null
  /** 是否正在编译 */
  compiling: boolean

  /** 触发编译 */
  compile: (resume: Resume) => Promise<void>
  /** 清除预览 */
  clear: () => void
}

export const usePreviewStore = create<PreviewState>((set) => ({
  artifact: null,
  error: null,
  compiling: false,

  compile: async (resume) => {
    set({ compiling: true, error: null })
    try {
      const result = await compileToVector(resume)
      set({ artifact: result, compiling: false })
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Compilation failed',
        artifact: null,
        compiling: false,
      })
    }
  },

  clear: () => {
    set({ artifact: null, error: null, compiling: false })
  },
}))
