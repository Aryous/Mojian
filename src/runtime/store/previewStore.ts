// Runtime 层：预览状态管理
// 负责 Typst 编译结果的状态，UI 层通过此 store 获取预览数据
// 渲染路径：compiler(vector) → renderer(SVG string) → UI dangerouslySetInnerHTML

import { create } from 'zustand'
import type { Resume } from '@/types'
import { compileToSvg, compileToPdf } from '@/service/typst'
import { getResumeProgress } from '@/service/resume/progress'

interface PreviewState {
  /** 编译产物（SVG 字符串） */
  svg: string | null
  /** 编译错误信息 */
  error: string | null
  /** 是否正在编译 */
  compiling: boolean
  /** 是否正在导出 PDF */
  exporting: boolean

  /** 触发编译（输出 SVG） */
  compile: (resume: Resume) => Promise<void>
  /** 导出 PDF 并触发下载 */
  exportPdf: (resume: Resume) => Promise<void>
  /** 清除预览 */
  clear: () => void
}

export const usePreviewStore = create<PreviewState>((set) => ({
  svg: null,
  error: null,
  compiling: false,
  exporting: false,

  compile: async (resume) => {
    set({ compiling: true, error: null })
    try {
      const result = await compileToSvg(resume)
      set({ svg: result, compiling: false })

      // Cache SVG preview and progress to localStorage for Dashboard
      try {
        localStorage.setItem(`mojian:preview:${resume.id}`, result)
        const progress = getResumeProgress(resume)
        localStorage.setItem(`mojian:progress:${resume.id}`, JSON.stringify(progress))
      } catch {
        // localStorage full or unavailable — non-critical, skip silently
      }
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Compilation failed',
        svg: null,
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
    set({ svg: null, error: null, compiling: false, exporting: false })
  },
}))
