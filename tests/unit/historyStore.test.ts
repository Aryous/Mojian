// @req F05 — 撤销/重做：historyStore 单元测试
import { describe, it, expect, beforeEach } from 'vitest'
import { useHistoryStore } from '@/runtime/store/historyStore'
import type { Resume } from '@/types'

// 最小化 Resume fixture，仅含测试所需字段
function makeResume(id: string, title: string): Resume {
  return {
    id,
    title,
    templateId: 'classic',
    sections: [],
    createdAt: 0,
    updatedAt: 0,
  } as unknown as Resume
}

describe('Runtime 层：historyStore — 撤销/重做状态管理', () => {
  beforeEach(() => {
    // 每次测试前重置 store
    useHistoryStore.setState({ past: [], future: [] })
  })

  it('初始状态 past/future 为空', () => {
    const { past, future } = useHistoryStore.getState()
    expect(past).toEqual([])
    expect(future).toEqual([])
  })

  it('pushSnapshot 后 past 有 1 项，future 被清空', () => {
    const r1 = makeResume('r1', '版本1')
    const r2 = makeResume('r2', '版本2')

    // 先放一个 future，确认 pushSnapshot 会清空它
    useHistoryStore.setState({ future: [r2] })

    useHistoryStore.getState().pushSnapshot(r1)

    const { past, future } = useHistoryStore.getState()
    expect(past).toHaveLength(1)
    expect(past[0]).toEqual(r1)
    expect(future).toEqual([])
  })

  it('undo 返回上一个状态，current 进入 future', () => {
    const r1 = makeResume('r1', '版本1')
    const r2 = makeResume('r2', '版本2，是 current')

    useHistoryStore.getState().pushSnapshot(r1)

    const result = useHistoryStore.getState().undo(r2)

    expect(result).toEqual(r1)
    const { past, future } = useHistoryStore.getState()
    expect(past).toHaveLength(0)
    expect(future).toHaveLength(1)
    expect(future[0]).toEqual(r2)
  })

  it('redo 返回下一个状态，current 进入 past', () => {
    const r1 = makeResume('r1', '版本1，是 current')
    const r2 = makeResume('r2', '版本2')

    // 手动设置 future 模拟 undo 之后的状态
    useHistoryStore.setState({ past: [], future: [r2] })

    const result = useHistoryStore.getState().redo(r1)

    expect(result).toEqual(r2)
    const { past, future } = useHistoryStore.getState()
    expect(past).toHaveLength(1)
    expect(past[0]).toEqual(r1)
    expect(future).toHaveLength(0)
  })

  it('past 为空时 undo 返回 null，状态不变', () => {
    const r1 = makeResume('r1', '当前')
    const result = useHistoryStore.getState().undo(r1)

    expect(result).toBeNull()
    const { past, future } = useHistoryStore.getState()
    expect(past).toEqual([])
    expect(future).toEqual([])
  })

  it('future 为空时 redo 返回 null，状态不变', () => {
    const r1 = makeResume('r1', '当前')
    const result = useHistoryStore.getState().redo(r1)

    expect(result).toBeNull()
    const { past, future } = useHistoryStore.getState()
    expect(past).toEqual([])
    expect(future).toEqual([])
  })

  it('pushSnapshot 超过 MAX_HISTORY(50) 时裁剪 past 最旧的条目', () => {
    // 推入 51 个快照
    for (let i = 0; i < 51; i++) {
      useHistoryStore.getState().pushSnapshot(makeResume(`r${i}`, `版本${i}`))
    }

    const { past } = useHistoryStore.getState()
    expect(past).toHaveLength(50)
    // 最旧的 r0 应该被丢弃，最新的 r50 在末尾
    expect(past[0]?.id).toBe('r1')
    expect(past[49]?.id).toBe('r50')
  })

  it('clear 清空 past 和 future', () => {
    const r1 = makeResume('r1', '版本1')
    const r2 = makeResume('r2', '版本2')

    useHistoryStore.setState({ past: [r1], future: [r2] })
    useHistoryStore.getState().clear()

    const { past, future } = useHistoryStore.getState()
    expect(past).toEqual([])
    expect(future).toEqual([])
  })

  it('连续 pushSnapshot + undo + undo 正确恢复多层历史', () => {
    const r0 = makeResume('r0', '初始')
    const r1 = makeResume('r1', '编辑1')
    const r2 = makeResume('r2', '编辑2，当前')

    // 两次编辑
    useHistoryStore.getState().pushSnapshot(r0)
    useHistoryStore.getState().pushSnapshot(r1)

    // 第一次撤销：恢复到 r1
    const prev1 = useHistoryStore.getState().undo(r2)
    expect(prev1).toEqual(r1)

    // 第二次撤销：恢复到 r0
    const prev2 = useHistoryStore.getState().undo(r1)
    expect(prev2).toEqual(r0)

    // past 已清空
    expect(useHistoryStore.getState().past).toHaveLength(0)
    // future 有两项
    expect(useHistoryStore.getState().future).toHaveLength(2)
  })

  it('undo 后新编辑（pushSnapshot）清空 future', () => {
    const r0 = makeResume('r0', '初始')
    const r1 = makeResume('r1', '编辑1')
    const r2 = makeResume('r2', '编辑2')

    useHistoryStore.getState().pushSnapshot(r0)
    useHistoryStore.getState().pushSnapshot(r1)
    useHistoryStore.getState().undo(r2)

    // 此时 future 有 r2
    expect(useHistoryStore.getState().future).toHaveLength(1)

    // 新编辑 — future 应该被清空
    useHistoryStore.getState().pushSnapshot(makeResume('r1-after-undo', '撤销后的当前'))
    expect(useHistoryStore.getState().future).toEqual([])
  })
})
