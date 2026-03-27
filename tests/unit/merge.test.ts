import { describe, it, expect } from 'vitest'
import { mergeAiResult } from '@/service/ai/merge'
import type { Resume } from '@/types'

// ── 共享 mock ─────────────────────────────────────────────────────────────────

const baseResume: Resume = {
  id: 'resume-1',
  title: '测试简历',
  templateId: 'classic',
  createdAt: 1000000,
  updatedAt: 2000000,
  personal: {
    name: '张三',
    title: '前端工程师',
    email: 'zhangsan@example.com',
    phone: '13800000000',
    location: '北京',
    website: 'https://example.com',
    summary: '五年前端开发经验',
  },
  sections: [
    { id: 's1', type: 'personal', title: '基本信息', visible: true, sortOrder: 0 },
    { id: 's2', type: 'work', title: '工作经历', visible: true, sortOrder: 1 },
    { id: 's3', type: 'education', title: '教育背景', visible: true, sortOrder: 2 },
    { id: 's4', type: 'skills', title: '技能', visible: true, sortOrder: 3 },
    { id: 's5', type: 'projects', title: '项目', visible: true, sortOrder: 4 },
  ],
  education: [
    {
      id: 'edu-1',
      school: '北京大学',
      degree: '学士',
      field: '计算机科学',
      startDate: '2015-09',
      endDate: '2019-06',
      description: '主修计算机科学与技术',
    },
  ],
  work: [
    {
      id: 'work-1',
      company: '字节跳动',
      position: '前端工程师',
      startDate: '2019-07',
      endDate: '至今',
      description: '负责抖音 Web 端开发',
    },
  ],
  skills: [
    { id: 'skill-1', name: 'TypeScript', level: 'advanced' },
    { id: 'skill-2', name: 'React', level: 'expert' },
  ],
  projects: [
    {
      id: 'proj-1',
      name: '开源组件库',
      role: '主要贡献者',
      startDate: '2021-01',
      endDate: '2022-12',
      description: '维护了一个 React 组件库',
      url: 'https://github.com/example/lib',
    },
  ],
  custom: {
    certifications: [
      { id: 'cert-1', title: 'AWS 认证', subtitle: '云从业者', date: '2022-03', description: '通过认证' },
    ],
  },
}

// ── personal ──────────────────────────────────────────────────────────────────

describe('mergeAiResult — personal', () => {
  it('直接覆盖所有字段', () => {
    const aiData = {
      name: '李四',
      title: '全栈工程师',
      email: 'lisi@example.com',
      phone: '13900000000',
      location: '上海',
      website: 'https://lisi.dev',
      summary: '十年全栈开发经验',
    }
    const result = mergeAiResult(baseResume, 'personal', aiData)
    expect(result.personal).toEqual(aiData)
  })

  it('AI 数据为非对象时返回空对象', () => {
    expect(mergeAiResult(baseResume, 'personal', null)).toEqual({})
    expect(mergeAiResult(baseResume, 'personal', [])).toEqual({})
    expect(mergeAiResult(baseResume, 'personal', 'string')).toEqual({})
  })
})

// ── education ─────────────────────────────────────────────────────────────────

describe('mergeAiResult — education', () => {
  it('回填已有条目的 id（school + startDate 匹配）', () => {
    const aiData = [
      {
        school: '北京大学',
        degree: '硕士',       // AI 修改了学位
        field: '计算机科学',
        startDate: '2015-09',
        endDate: '2019-06',
        description: '深入研究计算机科学',
      },
    ]
    const result = mergeAiResult(baseResume, 'education', aiData)
    expect(result.education).toHaveLength(1)
    expect(result.education![0]!.id).toBe('edu-1')     // id 被回填
    expect(result.education![0]!.degree).toBe('硕士')  // 新字段生效
  })

  it('新增 item 生成新 id（UUID 格式）', () => {
    const aiData = [
      {
        school: '复旦大学',        // 不存在于原数据
        degree: '学士',
        field: '软件工程',
        startDate: '2020-09',
        endDate: '2024-06',
        description: '软件工程专业',
      },
    ]
    const result = mergeAiResult(baseResume, 'education', aiData)
    const newId = result.education![0]!.id
    // UUID v4 格式：8-4-4-4-12
    expect(newId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  })

  it('AI 删除 item（返回空数组）', () => {
    const result = mergeAiResult(baseResume, 'education', [])
    expect(result.education).toEqual([])
  })

  it('AI 返回非数组时产出空数组', () => {
    const result = mergeAiResult(baseResume, 'education', { school: '北京大学' })
    expect(result.education).toEqual([])
  })
})

// ── work ──────────────────────────────────────────────────────────────────────

describe('mergeAiResult — work', () => {
  it('回填已有条目的 id（company + startDate 匹配）', () => {
    const aiData = [
      {
        company: '字节跳动',
        position: '高级前端工程师',   // AI 修改了职位
        startDate: '2019-07',
        endDate: '至今',
        description: '负责抖音 Web 端核心开发',
      },
    ]
    const result = mergeAiResult(baseResume, 'work', aiData)
    expect(result.work![0]!.id).toBe('work-1')
    expect(result.work![0]!.position).toBe('高级前端工程师')
  })

  it('company 不同时生成新 id', () => {
    const aiData = [
      {
        company: '阿里巴巴',
        position: '前端工程师',
        startDate: '2019-07',
        endDate: '至今',
        description: '负责淘宝开发',
      },
    ]
    const result = mergeAiResult(baseResume, 'work', aiData)
    expect(result.work![0]!.id).not.toBe('work-1')
  })
})

// ── skills ────────────────────────────────────────────────────────────────────

describe('mergeAiResult — skills', () => {
  it('回填已有条目的 id（name 匹配）', () => {
    const aiData = [
      { name: 'TypeScript', level: 'expert' },  // AI 提升了 level
      { name: 'React', level: 'expert' },
    ]
    const result = mergeAiResult(baseResume, 'skills', aiData)
    expect(result.skills![0]!.id).toBe('skill-1')
    expect(result.skills![0]!.level).toBe('expert')
    expect(result.skills![1]!.id).toBe('skill-2')
  })

  it('新技能生成新 id', () => {
    const aiData = [{ name: 'Rust', level: 'beginner' }]
    const result = mergeAiResult(baseResume, 'skills', aiData)
    expect(result.skills![0]!.id).not.toBe('skill-1')
    expect(result.skills![0]!.id).not.toBe('skill-2')
  })

  it('未知 level 值降级为 intermediate', () => {
    const aiData = [{ name: 'Go', level: 'godlike' }]
    const result = mergeAiResult(baseResume, 'skills', aiData)
    expect(result.skills![0]!.level).toBe('intermediate')
  })
})

// ── projects ──────────────────────────────────────────────────────────────────

describe('mergeAiResult — projects', () => {
  it('回填已有条目的 id（name + startDate 匹配）', () => {
    const aiData = [
      {
        name: '开源组件库',
        role: '核心维护者',           // AI 修改了角色
        startDate: '2021-01',
        endDate: '2022-12',
        description: '主导组件库架构设计',
        url: 'https://github.com/example/lib',
      },
    ]
    const result = mergeAiResult(baseResume, 'projects', aiData)
    expect(result.projects![0]!.id).toBe('proj-1')
    expect(result.projects![0]!.role).toBe('核心维护者')
  })

  it('name 不同时生成新 id', () => {
    const aiData = [
      {
        name: '全新项目',
        role: '负责人',
        startDate: '2023-01',
        endDate: '2024-12',
        description: '新项目描述',
        url: '',
      },
    ]
    const result = mergeAiResult(baseResume, 'projects', aiData)
    expect(result.projects![0]!.id).not.toBe('proj-1')
  })
})

// ── custom ────────────────────────────────────────────────────────────────────

describe('mergeAiResult — custom', () => {
  it('暂不支持 AI 修改，返回空对象', () => {
    const result = mergeAiResult(baseResume, 'custom', [{ title: 'anything' }])
    expect(result).toEqual({})
  })
})
