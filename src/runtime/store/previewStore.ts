// Runtime 层：预览状态管理
// 负责 Typst 编译结果的状态，UI 层通过此 store 获取预览数据

import { create } from 'zustand'
import type { Resume } from '@/types'
import { compileToVector, compileToPdf } from '@/service/typst'

interface PreviewState {
  /** 编译产物（vector 格式） */
  artifact: Uint8Array | null
  /** 编译错误信息 */
  error: string | null
  /** 是否正在编译 */
  compiling: boolean
  /** 是否正在导出 PDF */
  exporting: boolean

  /** 触发编译 */
  compile: (resume: Resume) => Promise<void>
  /** 导出 PDF 并触发下载 */
  exportPdf: (resume: Resume) => Promise<void>
  /** 清除预览 */
  clear: () => void
}

export const usePreviewStore = create<PreviewState>((set) => ({
  artifact: null,
  error: null,
  compiling: false,
  exporting: false,

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

  exportPdf: async (resume) => {
    set({ exporting: true, error: null })
    try {
      const pdf = await compileToPdf(resume)
      const blob = new Blob([pdf as unknown as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${resume.title || '简历'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      set({ exporting: false })
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'PDF export failed',
        exporting: false,
      })
    }
  },

  clear: () => {
    set({ artifact: null, error: null, compiling: false, exporting: false })
  },
}))
