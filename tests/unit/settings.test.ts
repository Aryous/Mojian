// @req F19 — API Key 存储安全：验证 sessionStorage 读写行为，localStorage 无残留
import { describe, it, expect, beforeEach, vi } from 'vitest'

// --- Mock sessionStorage ---

const sessionStorageMock = (() => {
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
    _store: () => store,
  }
})()

// --- Mock localStorage（用于验证无残留）---

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

vi.stubGlobal('sessionStorage', sessionStorageMock)
vi.stubGlobal('localStorage', localStorageMock)

// settings 模块在 mock 之后导入
import { getApiKey, setApiKey, clearApiKey } from '@/repo/settings'

describe('Settings（@req F19）：API Key 存储使用 sessionStorage', () => {
  beforeEach(() => {
    sessionStorageMock.clear()
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('setApiKey 写入 sessionStorage', () => {
    setApiKey('sk-test-123')
    expect(sessionStorageMock.setItem).toHaveBeenCalledOnce()
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'mojian:openrouter-api-key',
      'sk-test-123',
    )
  })

  it('getApiKey 从 sessionStorage 读取', () => {
    setApiKey('sk-test-456')
    const result = getApiKey()
    expect(sessionStorageMock.getItem).toHaveBeenCalledWith('mojian:openrouter-api-key')
    expect(result).toBe('sk-test-456')
  })

  it('clearApiKey 从 sessionStorage 移除', () => {
    setApiKey('sk-test-789')
    clearApiKey()
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('mojian:openrouter-api-key')
    expect(getApiKey()).toBeNull()
  })

  it('未设置时 getApiKey 返回 null', () => {
    const result = getApiKey()
    expect(result).toBeNull()
  })

  it('localStorage 中无残留 — setApiKey 不触碰 localStorage', () => {
    setApiKey('sk-test-noleak')
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
    expect(localStorageMock.getItem).not.toHaveBeenCalled()
  })

  it('localStorage 中无残留 — clearApiKey 不触碰 localStorage', () => {
    setApiKey('sk-test-noleak-clear')
    vi.clearAllMocks()
    clearApiKey()
    expect(localStorageMock.removeItem).not.toHaveBeenCalled()
  })
})
