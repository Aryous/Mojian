// Runtime 层：预览状态管理
// 负责 Typst 编译结果的状态，UI 层通过此 store 获取预览数据
// 渲染路径：compiler(vector) → renderer(SVG[] per page) → UI dangerouslySetInnerHTML
// @req R2.3 — 简历导出：exportPdf 触发 PDF 编译并下载

import { create } from 'zustand'
import type { Resume } from '@/types'
import { compileToSvgs, compileToPdf } from '@/service/typst'
import { getResumeProgress } from '@/service/resume/progress'

interface PreviewState {
  /** 每页编译产物（SVG 字符串数组） */
  svgs: string[]
  /** 当前预览页（0-indexed） */
  currentPage: number
  /** 总页数 */
  pageCount: number
  /** 编译错误信息 */
  error: string | null
  /** 是否正在编译 */
  compiling: boolean
  /** 是否正在导出 PDF */
  exporting: boolean

  /** 触发编译（输出多页 SVG） */
  compile: (resume: Resume) => Promise<void>
  /** 切换当前预览页 */
  setCurrentPage: (page: number) => void
  /** 导出 PDF 并触发下载 */
  exportPdf: (resume: Resume) => Promise<void>
  /** 清除预览 */
  clear: () => void
}

export const usePreviewStore = create<PreviewState>((set) => ({
  svgs: [],
  currentPage: 0,
  pageCount: 0,
  error: null,
  compiling: false,
  exporting: false,

  compile: async (resume) => {
    set({ compiling: true, error: null })
    try {
      const result = await compileToSvgs(resume)
      set({ svgs: result, pageCount: result.length, currentPage: 0, compiling: false })

      // Cache first-page SVG preview and progress to localStorage for Dashboard
      try {
        if (result.length > 0) {
          localStorage.setItem(`mojian:preview:${resume.id}`, result[0]!)
        }
        const progress = getResumeProgress(resume)
        localStorage.setItem(`mojian:progress:${resume.id}`, JSON.stringify(progress))
      } catch {
        // localStorage full or unavailable — non-critical, skip silently
      }
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Compilation failed',
        svgs: [],
        pageCount: 0,
        compiling: false,
      })
    }
  },

  setCurrentPage: (page) => {
    set((state) => ({
      currentPage: Math.max(0, Math.min(page, state.pageCount - 1)),
    }))
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
    set({ svgs: [], currentPage: 0, pageCount: 0, error: null, compiling: false, exporting: false })
  },
}))
