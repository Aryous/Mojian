// @req F05 — 撤销/重做：历史状态管理
// Runtime 层：撤销/重做状态栈
// 依赖：Types

import { create } from 'zustand'
import type { Resume } from '@/types'

const MAX_HISTORY = 50

interface HistoryState {
  past: Resume[]
  future: Resume[]
  /** 新编辑前调用，记录当前快照 */
  pushSnapshot: (resume: Resume) => void
  /** 撤销：返回上一个状态，current 进入 future；无历史时返回 null */
  undo: (current: Resume) => Resume | null
  /** 重做：返回下一个状态，current 进入 past；无 future 时返回 null */
  redo: (current: Resume) => Resume | null
  /** 切换简历或关闭编辑器时清空所有历史 */
  clear: () => void
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],

  pushSnapshot: (resume) => {
    set((state) => ({
      past: [...state.past.slice(-(MAX_HISTORY - 1)), resume],
      future: [], // 新编辑清空 redo 栈
    }))
  },

  undo: (current) => {
    const { past } = get()
    if (past.length === 0) return null
    const previous = past[past.length - 1]!
    set((state) => ({
      past: state.past.slice(0, -1),
      future: [current, ...state.future],
    }))
    return previous
  },

  redo: (current) => {
    const { future } = get()
    if (future.length === 0) return null
    const next = future[0]!
    set((state) => ({
      past: [...state.past, current],
      future: state.future.slice(1),
    }))
    return next
  },

  clear: () => set({ past: [], future: [] }),
}))
