import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// fake-indexeddb 必须在 Dexie 之前导入（已在顶部）
import { db } from '@/repo/db'
import {
  createResume,
  getResume,
  listResumes,
  updateResume,
  deleteResume,
} from '@/repo/resume'

// --- 简历 CRUD 测试 ---

describe('Repo 层：简历 CRUD', () => {
  beforeEach(async () => {
    // 清理数据库：删除后重新打开
    await db.delete()
    await db.open()
  })

  it('createResume 返回完整 Resume 结构', async () => {
    const resume = await createResume({ title: '测试简历' })

    expect(resume.id).toBeDefined()
    expect(typeof resume.id).toBe('string')
    expect(resume.title).toBe('测试简历')
    expect(resume.templateId).toBe('classic')
    expect(resume.createdAt).toBeTypeOf('number')
    expect(resume.updatedAt).toBeTypeOf('number')
    expect(resume.personal).toBeDefined()
    expect(resume.sections).toBeDefined()
    expect(resume.sections.length).toBeGreaterThan(0)
    expect(resume.education).toEqual([])
    expect(resume.work).toEqual([])
    expect(resume.skills).toEqual([])
    expect(resume.projects).toEqual([])
  })

  it('getResume 能取回刚创建的简历', async () => {
    const created = await createResume({ title: '取回测试' })
    const retrieved = await getResume(created.id)

    expect(retrieved).toBeDefined()
    expect(retrieved!.id).toBe(created.id)
    expect(retrieved!.title).toBe('取回测试')
  })

  it('getResume 对不存在的 ID 返回 undefined', async () => {
    const result = await getResume('nonexistent-id')
    expect(result).toBeUndefined()
  })

  it('listResumes 按更新时间倒序排列', async () => {
    await createResume({ title: '简历 A' })
    // 确保时间戳不同
    await new Promise((r) => setTimeout(r, 10))
    await createResume({ title: '简历 B' })

    const list = await listResumes()

    expect(list).toHaveLength(2)
    // 最新的排在前面
    expect(list[0]!.title).toBe('简历 B')
    expect(list[1]!.title).toBe('简历 A')
    // 列表项只包含摘要字段
    expect(list[0]).toHaveProperty('id')
    expect(list[0]).toHaveProperty('title')
    expect(list[0]).toHaveProperty('templateId')
    expect(list[0]).toHaveProperty('createdAt')
    expect(list[0]).toHaveProperty('updatedAt')
  })

  it('updateResume 更新字段', async () => {
    const created = await createResume({ title: '待更新' })
    await updateResume(created.id, { title: '已更新' })

    const updated = await getResume(created.id)
    expect(updated!.title).toBe('已更新')
    expect(updated!.updatedAt).toBeGreaterThanOrEqual(created.updatedAt)
  })

  it('deleteResume 删除后取不到', async () => {
    const created = await createResume({ title: '待删除' })
    await deleteResume(created.id)

    const result = await getResume(created.id)
    expect(result).toBeUndefined()

    const list = await listResumes()
    expect(list).toHaveLength(0)
  })
})

// --- Settings 测试（sessionStorage，@req F19）---

// Mock sessionStorage（settings.ts 已迁移至 sessionStorage）
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
  }
})()

vi.stubGlobal('sessionStorage', sessionStorageMock)

// 在 mock sessionStorage 之后再导入 settings
// 使用动态 import 确保 mock 先生效
describe('Repo 层：Settings (API Key)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let settings: any

  beforeEach(async () => {
    sessionStorageMock.clear()
    vi.clearAllMocks()
    // 动态导入确保每次使用最新的 mock 状态
    settings = await import('@/repo/settings')
  })

  it('getApiKey 未设置时返回 null', () => {
    const key = settings.getApiKey()
    expect(key).toBeNull()
  })

  it('setApiKey 后 getApiKey 能取回', () => {
    settings.setApiKey('sk-test-key-123')
    const key = settings.getApiKey()
    expect(key).toBe('sk-test-key-123')
  })

  it('clearApiKey 后 getApiKey 返回 null', () => {
    settings.setApiKey('sk-test-key-456')
    settings.clearApiKey()
    const key = settings.getApiKey()
    expect(key).toBeNull()
  })
})
