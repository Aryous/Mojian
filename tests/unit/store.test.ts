import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((_index: number) => null),
  }
})()

vi.stubGlobal('localStorage', localStorageMock)

// Mock Typst（previewStore 依赖它）
vi.mock('@myriaddreamin/typst.ts', () => ({
  createTypstCompiler: vi.fn(() => ({
    init: vi.fn(),
    addSource: vi.fn(),
    compile: vi.fn(),
  })),
}))
vi.mock('@/service/typst/templates/classic.typ?raw', () => ({
  default: '// classic template',
}))
vi.mock('@/service/typst/templates/twocolumn.typ?raw', () => ({
  default: '// twocolumn template',
}))
vi.mock('@/service/typst/templates/academic.typ?raw', () => ({
  default: '// academic template',
}))

import { db } from '@/repo/db'

// --- resumeStore 测试 ---

describe('Runtime 层：resumeStore 状态流转', () => {
  // 每次测试前清理 DB 和 store 状态
  beforeEach(async () => {
    await db.delete()
    await db.open()
    // 重置 zustand store 状态
    const { useResumeStore } = await import('@/runtime/store/resumeStore')
    useResumeStore.setState({
      resumes: [],
      currentResume: null,
      loading: false,
    })
  })

  it('初始状态正确', async () => {
    const { useResumeStore } = await import('@/runtime/store/resumeStore')
    const state = useResumeStore.getState()
    expect(state.resumes).toEqual([])
    expect(state.currentResume).toBeNull()
    expect(state.loading).toBe(false)
  })

  it('createResume 后列表中有新简历', async () => {
    const { useResumeStore } = await import('@/runtime/store/resumeStore')
    const store = useResumeStore.getState()

    const resume = await store.createResume({ title: 'Store 测试' })

    expect(resume.title).toBe('Store 测试')
    // createResume 内部会调用 loadResumes，检查列表是否更新
    const updatedState = useResumeStore.getState()
    expect(updatedState.resumes.length).toBe(1)
    expect(updatedState.resumes[0]!.title).toBe('Store 测试')
  })

  it('openResume 后 currentResume 不为空', async () => {
    const { useResumeStore } = await import('@/runtime/store/resumeStore')
    const store = useResumeStore.getState()

    const resume = await store.createResume({ title: '打开测试' })
    await useResumeStore.getState().openResume(resume.id)

    const state = useResumeStore.getState()
    expect(state.currentResume).not.toBeNull()
    expect(state.currentResume!.id).toBe(resume.id)
    expect(state.currentResume!.title).toBe('打开测试')
  })

  it('updateCurrentResume 更新当前简历', async () => {
    const { useResumeStore } = await import('@/runtime/store/resumeStore')

    const resume = await useResumeStore.getState().createResume({ title: '更新测试' })
    await useResumeStore.getState().openResume(resume.id)
    await useResumeStore.getState().updateCurrentResume({ title: '已更新标题' })

    const state = useResumeStore.getState()
    expect(state.currentResume!.title).toBe('已更新标题')
  })

  it('deleteResume 后列表为空，currentResume 被清除', async () => {
    const { useResumeStore } = await import('@/runtime/store/resumeStore')

    const resume = await useResumeStore.getState().createResume({ title: '删除测试' })
    await useResumeStore.getState().openResume(resume.id)
    await useResumeStore.getState().deleteResume(resume.id)

    const state = useResumeStore.getState()
    expect(state.resumes).toHaveLength(0)
    expect(state.currentResume).toBeNull()
  })

  it('closeResume 清除 currentResume', async () => {
    const { useResumeStore } = await import('@/runtime/store/resumeStore')

    const resume = await useResumeStore.getState().createResume({ title: '关闭测试' })
    await useResumeStore.getState().openResume(resume.id)
    useResumeStore.getState().closeResume()

    expect(useResumeStore.getState().currentResume).toBeNull()
  })
})

// --- aiStore 测试 ---

describe('Runtime 层：aiStore 状态流转', () => {
  beforeEach(async () => {
    localStorageMock.clear()
    vi.clearAllMocks()
    const { useAiStore } = await import('@/runtime/store/aiStore')
    useAiStore.setState({
      apiKeySet: false,
      optimizing: false,
      result: null,
      error: null,
    })
  })

  it('初始状态正确', async () => {
    const { useAiStore } = await import('@/runtime/store/aiStore')
    const state = useAiStore.getState()
    expect(state.apiKeySet).toBe(false)
    expect(state.optimizing).toBe(false)
    expect(state.result).toBeNull()
    expect(state.error).toBeNull()
  })

  it('loadApiKey 在无 Key 时 apiKeySet 为 false', async () => {
    const { useAiStore } = await import('@/runtime/store/aiStore')
    useAiStore.getState().loadApiKey()
    expect(useAiStore.getState().apiKeySet).toBe(false)
  })

  it('setApiKey 后 apiKeySet 为 true', async () => {
    const { useAiStore } = await import('@/runtime/store/aiStore')
    useAiStore.getState().setApiKey('sk-test-key')
    expect(useAiStore.getState().apiKeySet).toBe(true)
  })

  it('setApiKey 后 loadApiKey 能感知到 Key', async () => {
    const { useAiStore } = await import('@/runtime/store/aiStore')
    useAiStore.getState().setApiKey('sk-test-key')

    // 重置状态模拟重新加载
    useAiStore.setState({ apiKeySet: false })
    useAiStore.getState().loadApiKey()

    expect(useAiStore.getState().apiKeySet).toBe(true)
  })

  it('removeApiKey 后 apiKeySet 为 false', async () => {
    const { useAiStore } = await import('@/runtime/store/aiStore')
    useAiStore.getState().setApiKey('sk-test-key')
    useAiStore.getState().removeApiKey()

    const state = useAiStore.getState()
    expect(state.apiKeySet).toBe(false)
    expect(state.result).toBeNull()
    expect(state.error).toBeNull()
  })
})

// --- previewStore 测试（仅测初始状态，不初始化 WASM） ---

describe('Runtime 层：previewStore 初始状态', () => {
  it('初始状态正确', async () => {
    const { usePreviewStore } = await import('@/runtime/store/previewStore')
    const state = usePreviewStore.getState()
    expect(state.svgs).toEqual([])
    expect(state.currentPage).toBe(0)
    expect(state.pageCount).toBe(0)
    expect(state.error).toBeNull()
    expect(state.compiling).toBe(false)
    expect(state.exporting).toBe(false)
  })

  it('clear 重置所有状态', async () => {
    const { usePreviewStore } = await import('@/runtime/store/previewStore')
    // 手动设置一些状态
    usePreviewStore.setState({
      svgs: ['<svg>test</svg>'],
      currentPage: 1,
      pageCount: 2,
      error: 'some error',
      compiling: true,
      exporting: true,
    })
    usePreviewStore.getState().clear()

    const state = usePreviewStore.getState()
    expect(state.svgs).toEqual([])
    expect(state.currentPage).toBe(0)
    expect(state.pageCount).toBe(0)
    expect(state.error).toBeNull()
    expect(state.compiling).toBe(false)
    expect(state.exporting).toBe(false)
  })
})
