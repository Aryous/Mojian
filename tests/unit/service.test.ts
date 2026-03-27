import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Typst 编译器的 ?raw 导入和 createTypstCompiler
// 必须在导入被测模块之前 mock
vi.mock('@myriaddreamin/typst.ts', () => ({
  createTypstCompiler: vi.fn(() => ({
    init: vi.fn(),
    addSource: vi.fn(),
    compile: vi.fn(),
  })),
}))

// Mock ?raw 模板导入
vi.mock('@/service/typst/templates/classic.typ?raw', () => ({
  default: '// classic template',
}))
vi.mock('@/service/typst/templates/twocolumn.typ?raw', () => ({
  default: '// twocolumn template',
}))
vi.mock('@/service/typst/templates/academic.typ?raw', () => ({
  default: '// academic template',
}))
vi.mock('@/service/typst/templates/modern.typ?raw', () => ({
  default: '// modern template',
}))
vi.mock('@/service/typst/templates/minimal.typ?raw', () => ({
  default: '// minimal template',
}))

// Mock localStorage for settings
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

describe('Service 层：Typst 模板', () => {
  it('getTemplateIds 返回五个模板 ID', async () => {
    const { getTemplateIds } = await import('@/service/typst/compiler')
    const ids = getTemplateIds()
    expect(ids).toEqual(['classic', 'twocolumn', 'academic', 'modern', 'minimal'])
  })
})

describe('Service 层：AI 客户端', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('getAiClient 在 API Key 未配置时抛错', async () => {
    // 确保 localStorage 中没有 API Key
    localStorageMock.clear()
    const { getAiClient } = await import('@/service/ai/provider')
    expect(() => getAiClient()).toThrow('API Key 未配置')
  })
})
