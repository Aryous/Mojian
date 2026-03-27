import { describe, it, expect } from 'vitest'
import { generateDiff } from '@/service/ai/diff'

// ── personal ──────────────────────────────────────────────────────────────────

describe('generateDiff — personal', () => {
  const original = {
    name: '张三',
    title: '前端工程师',
    email: 'zhangsan@example.com',
    phone: '13800000000',
    location: '北京',
    website: 'https://example.com',
    summary: '五年前端开发经验',
  }

  it('检测修改字段', () => {
    const optimized = {
      ...original,
      title: '全栈工程师',
      summary: '十年全栈开发经验，专注于高性能应用',
    }
    const diff = generateDiff('personal', original, optimized)
    const paths = diff.map((e) => e.path)
    expect(paths).toContain('personal.title')
    expect(paths).toContain('personal.summary')
    // 未变化字段不出现
    expect(paths).not.toContain('personal.name')
    expect(paths).not.toContain('personal.email')
  })

  it('修改条目带 oldValue 和 newValue', () => {
    const optimized = { ...original, title: '全栈工程师' }
    const diff = generateDiff('personal', original, optimized)
    const entry = diff.find((e) => e.path === 'personal.title')!
    expect(entry.type).toBe('modified')
    expect(entry.oldValue).toBe('前端工程师')
    expect(entry.newValue).toBe('全栈工程师')
  })

  it('无变化时返回空数组', () => {
    const diff = generateDiff('personal', original, original)
    expect(diff).toEqual([])
  })

  it('新增字段（original 没有 newfield）', () => {
    const optimized = { ...original, linkedin: 'https://linkedin.com/in/zhangsan' }
    const diff = generateDiff('personal', original, optimized)
    const entry = diff.find((e) => e.path === 'personal.linkedin')
    expect(entry).toBeDefined()
    expect(entry!.type).toBe('added')
    expect(entry!.newValue).toBe('https://linkedin.com/in/zhangsan')
    expect(entry!.oldValue).toBeUndefined()
  })

  it('删除字段（optimized 里的字段不见了）', () => {
    const optimizedWithoutWebsite = { ...original, website: undefined }
    const diff = generateDiff('personal', original, optimizedWithoutWebsite)
    const entry = diff.find((e) => e.path === 'personal.website')
    expect(entry).toBeDefined()
    expect(entry!.type).toBe('removed')
    expect(entry!.oldValue).toBe('https://example.com')
    expect(entry!.newValue).toBeUndefined()
  })
})

// ── work (数组 section) ───────────────────────────────────────────────────────

describe('generateDiff — work', () => {
  const original = [
    {
      company: '字节跳动',
      position: '前端工程师',
      startDate: '2019-07',
      endDate: '至今',
      description: '负责抖音 Web 端开发',
    },
  ]

  it('检测 item 字段修改', () => {
    const optimized = [
      {
        company: '字节跳动',
        position: '高级前端工程师',
        startDate: '2019-07',
        endDate: '至今',
        description: '主导抖音 Web 端核心模块开发与架构优化',
      },
    ]
    const diff = generateDiff('work', original, optimized)
    const paths = diff.map((e) => e.path)
    expect(paths).toContain('work[0].position')
    expect(paths).toContain('work[0].description')
    expect(paths).not.toContain('work[0].company')
    expect(paths).not.toContain('work[0].startDate')
  })

  it('修改条目的 type 为 modified，带 oldValue 和 newValue', () => {
    const optimized = [{ ...original[0]!, position: '高级前端工程师' }]
    const diff = generateDiff('work', original, optimized)
    const entry = diff.find((e) => e.path === 'work[0].position')!
    expect(entry.type).toBe('modified')
    expect(entry.oldValue).toBe('前端工程师')
    expect(entry.newValue).toBe('高级前端工程师')
  })

  it('新增 item（optimized 比 original 长）', () => {
    const optimized = [
      ...original,
      {
        company: '阿里巴巴',
        position: '技术专家',
        startDate: '2023-01',
        endDate: '至今',
        description: '负责淘宝核心功能',
      },
    ]
    const diff = generateDiff('work', original, optimized)
    const addedEntries = diff.filter((e) => e.path.startsWith('work[1]') && e.type === 'added')
    expect(addedEntries.length).toBeGreaterThan(0)
    // 新增 item 的字段没有 oldValue
    for (const entry of addedEntries) {
      expect(entry.oldValue).toBeUndefined()
      expect(entry.newValue).toBeDefined()
    }
  })

  it('删除 item（optimized 比 original 短）', () => {
    const diff = generateDiff('work', original, [])
    const removedEntries = diff.filter((e) => e.path.startsWith('work[0]') && e.type === 'removed')
    expect(removedEntries.length).toBeGreaterThan(0)
    // 删除 item 的字段没有 newValue
    for (const entry of removedEntries) {
      expect(entry.newValue).toBeUndefined()
      expect(entry.oldValue).toBeDefined()
    }
  })

  it('无变化时返回空数组', () => {
    const diff = generateDiff('work', original, original)
    expect(diff).toEqual([])
  })

  it('path 格式正确（section[index].field）', () => {
    const multiOriginal = [
      { company: '字节跳动', position: '初级', startDate: '2019-07', endDate: '2020-01', description: 'A' },
      { company: '阿里巴巴', position: '中级', startDate: '2020-02', endDate: '至今', description: 'B' },
    ]
    const multiOptimized = [
      { company: '字节跳动', position: '高级', startDate: '2019-07', endDate: '2020-01', description: 'A' },
      { company: '阿里巴巴', position: '专家', startDate: '2020-02', endDate: '至今', description: 'B' },
    ]
    const diff = generateDiff('work', multiOriginal, multiOptimized)
    const paths = diff.map((e) => e.path)
    expect(paths).toContain('work[0].position')
    expect(paths).toContain('work[1].position')
  })
})

// ── education ─────────────────────────────────────────────────────────────────

describe('generateDiff — education', () => {
  it('检测 description 修改', () => {
    const original = [
      { school: '北京大学', degree: '学士', field: '计算机', startDate: '2015-09', endDate: '2019-06', description: '主修计算机' },
    ]
    const optimized = [
      { school: '北京大学', degree: '学士', field: '计算机', startDate: '2015-09', endDate: '2019-06', description: '深入研究计算机科学与算法' },
    ]
    const diff = generateDiff('education', original, optimized)
    expect(diff.some((e) => e.path === 'education[0].description')).toBe(true)
  })
})

// ── skills ────────────────────────────────────────────────────────────────────

describe('generateDiff — skills', () => {
  it('检测 level 修改', () => {
    const original = [{ name: 'TypeScript', level: 'advanced' }]
    const optimized = [{ name: 'TypeScript', level: 'expert' }]
    const diff = generateDiff('skills', original, optimized)
    const entry = diff.find((e) => e.path === 'skills[0].level')!
    expect(entry.type).toBe('modified')
    expect(entry.oldValue).toBe('advanced')
    expect(entry.newValue).toBe('expert')
  })
})

// ── projects ──────────────────────────────────────────────────────────────────

describe('generateDiff — projects', () => {
  it('检测 description 和 role 修改', () => {
    const original = [
      { name: '开源组件库', role: '贡献者', startDate: '2021-01', endDate: '2022-12', description: '维护组件库', url: '' },
    ]
    const optimized = [
      { name: '开源组件库', role: '核心维护者', startDate: '2021-01', endDate: '2022-12', description: '主导架构设计与 API 演进', url: '' },
    ]
    const diff = generateDiff('projects', original, optimized)
    const paths = diff.map((e) => e.path)
    expect(paths).toContain('projects[0].role')
    expect(paths).toContain('projects[0].description')
    expect(paths).not.toContain('projects[0].name')
  })
})

// ── custom ────────────────────────────────────────────────────────────────────

describe('generateDiff — custom', () => {
  it('暂不支持，始终返回空数组', () => {
    const diff = generateDiff('custom', [{ title: 'A' }], [{ title: 'B' }])
    expect(diff).toEqual([])
  })
})

// ── 边界情况 ──────────────────────────────────────────────────────────────────

describe('generateDiff — 边界情况', () => {
  it('original 或 optimized 为非数组时，数组 section 返回空数组或所有 added/removed', () => {
    // original 为非数组
    const diffFromNonArray = generateDiff('work', null, [{ company: '字节跳动', position: 'X', startDate: '2019', endDate: '至今', description: 'Y' }])
    // 非数组解析为空数组，所以 original 为空，optimized 有一项 → 全是 added
    expect(diffFromNonArray.every((e) => e.type === 'added')).toBe(true)
  })

  it('非字符串字段不出现在 diff 中', () => {
    const original = { name: '张三', count: 42, tags: ['a', 'b'] }
    const optimized = { name: '李四', count: 99, tags: ['x', 'y'] }
    const diff = generateDiff('personal', original, optimized)
    // count 和 tags 不是字符串，不应出现
    expect(diff.every((e) => e.path === 'personal.name')).toBe(true)
    expect(diff).toHaveLength(1)
  })
})
