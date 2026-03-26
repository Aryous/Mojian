// Runtime 层：简历状态管理
// 依赖：Types, Repo（通过 Service 或直接 Repo）

import { create } from 'zustand'
import type { Resume, ResumeSummary, ResumeCreateInput } from '@/types'
import * as resumeService from '@/service/resume'

interface ResumeState {
  /** 简历列表 */
  resumes: ResumeSummary[]
  /** 当前正在编辑的简历 */
  currentResume: Resume | null
  /** 加载状态 */
  loading: boolean

  /** 加载简历列表 */
  loadResumes: () => Promise<void>
  /** 创建新简历 */
  createResume: (input: ResumeCreateInput) => Promise<Resume>
  /** 加载单份简历用于编辑 */
  openResume: (id: string) => Promise<void>
  /** 更新当前简历（局部更新 + 自动持久化） */
  updateCurrentResume: (changes: Partial<Omit<Resume, 'id' | 'createdAt'>>) => Promise<void>
  /** 删除简历 */
  deleteResume: (id: string) => Promise<void>
  /** 关闭当前编辑 */
  closeResume: () => void
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  resumes: [],
  currentResume: null,
  loading: false,

  loadResumes: async () => {
    set({ loading: true })
    const resumes = await resumeService.listResumes()
    set({ resumes, loading: false })
  },

  createResume: async (input) => {
    const resume = await resumeService.createResume(input)
    // 重新加载列表保持一致性
    await get().loadResumes()
    return resume
  },

  openResume: async (id) => {
    set({ loading: true })
    const resume = await resumeService.getResume(id)
    set({ currentResume: resume ?? null, loading: false })
  },

  updateCurrentResume: async (changes) => {
    const { currentResume } = get()
    if (!currentResume) return

    const updatedResume = {
      ...currentResume,
      ...changes,
      updatedAt: Date.now(),
    }
    set({ currentResume: updatedResume })

    // 异步持久化，不阻塞 UI
    await resumeService.updateResume(currentResume.id, changes)
  },

  deleteResume: async (id) => {
    await resumeService.deleteResume(id)
    const { currentResume } = get()
    if (currentResume?.id === id) {
      set({ currentResume: null })
    }
    await get().loadResumes()
  },

  closeResume: () => {
    set({ currentResume: null })
  },
}))
