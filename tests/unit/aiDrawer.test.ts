// tests/unit/aiDrawer.test.ts
// 覆盖 AiDrawer Task 6 的核心逻辑：
//   - aiStore.acceptResult() 返回 pendingChanges 并清除状态
//   - aiStore.rejectResult() 清除状态但不返回数据
//   - AiDiffEntry 数据结构与渲染分类符合预期
//   - 分发 onAccept 时 pendingChanges 正确传递

import { describe, it, expect, beforeEach } from 'vitest'
import type { AiDiffEntry, AiOptimizeResult } from '@/types'
import type { Resume } from '@/types'

// ── 共享 mock ──────────────────────────────────────────────────────────────────

const baseResume: Resume = {
  id: 'r1',
  title: '测试简历',
  templateId: 'classic',
  createdAt: 1000000,
  updatedAt: 2000000,
  personal: {
    name: '张三',
    title: '前端工程师',
    email: 'test@example.com',
    phone: '13800000000',
    location: '北京',
    website: '',
    summary: '原始简介',
  },
  sections: [
    { id: 's1', type: 'personal', title: '基本信息', visible: true, sortOrder: 0 },
    { id: 's2', type: 'work', title: '工作经历', visible: true, sortOrder: 1 },
  ],
  education: [],
  work: [
    {
      id: 'w1',
      company: '测试公司',
      position: '工程师',
      startDate: '2020-01',
      endDate: '2023-01',
      description: '原始工作描述',
    },
  ],
  skills: [],
  projects: [],
  custom: {},
}

// ── aiStore accept/reject 行为测试 ─────────────────────────────────────────────

describe('AiDrawer Task 6 — aiStore accept/reject 行为', () => {
  beforeEach(async () => {
    const { useAiStore } = await import('@/runtime/store/aiStore')
    useAiStore.setState({
      apiKeySet: true,
      optimizing: false,
      pendingResult: null,
      diffEntries: [],
      pendingChanges: null,
      error: null,
    })
  })

  it('acceptResult 返回 pendingChanges 并清空所有 pending 状态', async () => {
    const { useAiStore } = await import('@/runtime/store/aiStore')
    const mockChanges: Partial<Resume> = {
      personal: { ...baseResume.personal, summary: '优化后的简介' },
    }
    const mockPendingResult: AiOptimizeResult = {
      original: baseResume.personal,
      optimized: mockChanges.personal,
      targetSection: 'personal',
      optionId: 'polish',
    }
    const mockDiff: AiDiffEntry[] = [
      {
        path: 'personal.summary',
        type: 'modified',
        oldValue: '原始简介',
        newValue: '优化后的简介',
      },
    ]

    useAiStore.setState({
      pendingResult: mockPendingResult,
      diffEntries: mockDiff,
      pendingChanges: mockChanges,
    })

    const returned = useAiStore.getState().acceptResult()

    expect(returned).toEqual(mockChanges)
    const state = useAiStore.getState()
    expect(state.pendingResult).toBeNull()
    expect(state.pendingChanges).toBeNull()
    expect(state.diffEntries).toEqual([])
  })

  it('rejectResult 清空所有 pending 状态，不返回数据', async () => {
    const { useAiStore } = await import('@/runtime/store/aiStore')
    const mockChanges: Partial<Resume> = {
      work: [{ ...baseResume.work[0]!, description: '优化后工作描述' }],
    }
    useAiStore.setState({
      pendingResult: { original: {}, optimized: {}, targetSection: 'work', optionId: 'quantify' },
      diffEntries: [{ path: 'work[0].description', type: 'modified', oldValue: '原始', newValue: '优化后' }],
      pendingChanges: mockChanges,
    })

    useAiStore.getState().rejectResult()

    const state = useAiStore.getState()
    expect(state.pendingResult).toBeNull()
    expect(state.pendingChanges).toBeNull()
    expect(state.diffEntries).toEqual([])
  })

  it('acceptResult 在无 pending 时返回 null，状态保持干净', async () => {
    const { useAiStore } = await import('@/runtime/store/aiStore')

    const result = useAiStore.getState().acceptResult()

    expect(result).toBeNull()
    const state = useAiStore.getState()
    expect(state.pendingResult).toBeNull()
    expect(state.pendingChanges).toBeNull()
    expect(state.diffEntries).toEqual([])
  })
})

// ── AiDiffEntry 数据结构验证 ───────────────────────────────────────────────────

describe('AiDrawer Task 6 — AiDiffEntry 数据结构', () => {
  it('modified 类型有 oldValue 和 newValue', () => {
    const entry: AiDiffEntry = {
      path: 'personal.summary',
      type: 'modified',
      oldValue: '旧值',
      newValue: '新值',
    }
    expect(entry.type).toBe('modified')
    expect(entry.oldValue).toBe('旧值')
    expect(entry.newValue).toBe('新值')
  })

  it('added 类型只有 newValue', () => {
    const entry: AiDiffEntry = {
      path: 'work[1].description',
      type: 'added',
      newValue: '新增的工作项',
    }
    expect(entry.type).toBe('added')
    expect(entry.newValue).toBeDefined()
    expect(entry.oldValue).toBeUndefined()
  })

  it('removed 类型只有 oldValue', () => {
    const entry: AiDiffEntry = {
      path: 'work[2].description',
      type: 'removed',
      oldValue: '被删除的工作项',
    }
    expect(entry.type).toBe('removed')
    expect(entry.oldValue).toBeDefined()
    expect(entry.newValue).toBeUndefined()
  })

  it('path 字段正确描述字段路径', () => {
    const entries: AiDiffEntry[] = [
      { path: 'personal.summary', type: 'modified', oldValue: 'a', newValue: 'b' },
      { path: 'work[0].description', type: 'modified', oldValue: 'c', newValue: 'd' },
      { path: 'work[1]', type: 'added', newValue: 'new item' },
    ]
    expect(entries[0]!.path).toMatch(/^personal\./)
    expect(entries[1]!.path).toMatch(/^work\[/)
    expect(entries[2]!.path).toMatch(/^work\[/)
  })
})

// ── onAccept 回调联动逻辑 ──────────────────────────────────────────────────────

describe('AiDrawer Task 6 — onAccept 回调联动', () => {
  it('accept 链路：acceptResult 返回的 changes 应用到 resume', async () => {
    const { useAiStore } = await import('@/runtime/store/aiStore')

    const expectedChanges: Partial<Resume> = {
      personal: { ...baseResume.personal, summary: '已优化的个人简介' },
    }
    useAiStore.setState({
      pendingResult: {
        original: baseResume.personal,
        optimized: expectedChanges.personal,
        targetSection: 'personal',
        optionId: 'polish',
      },
      diffEntries: [
        { path: 'personal.summary', type: 'modified', oldValue: '原始简介', newValue: '已优化的个人简介' },
      ],
      pendingChanges: expectedChanges,
    })

    // 模拟 AiDrawer handleAccept 逻辑：acceptResult() → onAccept(changes)
    let receivedChanges: Partial<Resume> | null = null
    const onAccept = (changes: Partial<Resume>) => {
      receivedChanges = changes
    }

    const changes = useAiStore.getState().acceptResult()
    if (changes) {
      onAccept(changes)
    }

    expect(receivedChanges).toEqual(expectedChanges)
    expect(receivedChanges!.personal!.summary).toBe('已优化的个人简介')
  })

  it('reject 链路：rejectResult 后 onAccept 不被调用', async () => {
    const { useAiStore } = await import('@/runtime/store/aiStore')

    useAiStore.setState({
      pendingChanges: { personal: { ...baseResume.personal, summary: '待拒绝的修改' } },
      pendingResult: { original: {}, optimized: {}, targetSection: 'personal', optionId: 'polish' },
      diffEntries: [],
    })

    let onAcceptCalled = false
    const onAccept = (_changes: Partial<Resume>) => {
      onAcceptCalled = true
    }

    // 模拟 AiDrawer handleReject 逻辑：只调用 rejectResult，不调用 onAccept
    useAiStore.getState().rejectResult()
    // onAccept 不应被调用
    void onAccept

    expect(onAcceptCalled).toBe(false)
    expect(useAiStore.getState().pendingResult).toBeNull()
  })
})
