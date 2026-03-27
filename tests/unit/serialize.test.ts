import { describe, it, expect } from 'vitest'
import { serializeResumeForAi, extractSectionData } from '@/service/ai/serialize'
import type { Resume } from '@/types'

const mockResume: Resume = {
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
    { id: 's3', type: 'education', title: '教育背景', visible: false, sortOrder: 2 },
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
      { id: 'cert-1', title: 'AWS 认证', subtitle: '云从业者', date: '2022-03', description: '通过 AWS 云从业者认证' },
    ],
  },
}

describe('serializeResumeForAi', () => {
  it('剥离系统字段（id、createdAt、updatedAt、templateId）', () => {
    const result = serializeResumeForAi(mockResume)
    expect(result).not.toHaveProperty('id')
    expect(result).not.toHaveProperty('createdAt')
    expect(result).not.toHaveProperty('updatedAt')
    expect(result).not.toHaveProperty('templateId')
    expect(result).not.toHaveProperty('title')
  })

  it('保留 personal 信息', () => {
    const result = serializeResumeForAi(mockResume)
    expect(result.personal).toEqual({
      name: '张三',
      title: '前端工程师',
      email: 'zhangsan@example.com',
      phone: '13800000000',
      location: '北京',
      website: 'https://example.com',
      summary: '五年前端开发经验',
    })
  })

  it('sections 只保留可见的，并按 sortOrder 排序', () => {
    const result = serializeResumeForAi(mockResume)
    const sections = result.sections as Array<{ type: string; title: string }>
    // education 的 visible: false，应被过滤掉
    expect(sections).toHaveLength(2)
    const first = sections[0]!
    const second = sections[1]!
    expect(first.type).toBe('personal')
    expect(second.type).toBe('work')
  })

  it('education 条目剥离 id', () => {
    const result = serializeResumeForAi(mockResume)
    const education = result.education as Array<Record<string, unknown>>
    const item = education[0]!
    expect(item).not.toHaveProperty('id')
    expect(item.school).toBe('北京大学')
  })

  it('work 条目剥离 id', () => {
    const result = serializeResumeForAi(mockResume)
    const work = result.work as Array<Record<string, unknown>>
    const item = work[0]!
    expect(item).not.toHaveProperty('id')
    expect(item.company).toBe('字节跳动')
  })

  it('skills 条目剥离 id', () => {
    const result = serializeResumeForAi(mockResume)
    const skills = result.skills as Array<Record<string, unknown>>
    const item = skills[0]!
    expect(item).not.toHaveProperty('id')
    expect(item.name).toBe('TypeScript')
  })

  it('projects 条目剥离 id', () => {
    const result = serializeResumeForAi(mockResume)
    const projects = result.projects as Array<Record<string, unknown>>
    const item = projects[0]!
    expect(item).not.toHaveProperty('id')
    expect(item.name).toBe('开源组件库')
  })

  it('custom 条目剥离 id，key 不变', () => {
    const result = serializeResumeForAi(mockResume)
    const custom = result.custom as Record<string, Array<Record<string, unknown>>>
    expect(custom).toHaveProperty('certifications')
    const certItems = custom['certifications']!
    const item = certItems[0]!
    expect(item).not.toHaveProperty('id')
    expect(item.title).toBe('AWS 认证')
  })

  it('空数组时不报错', () => {
    const emptyResume: Resume = {
      ...mockResume,
      education: [],
      work: [],
      skills: [],
      projects: [],
      custom: {},
    }
    const result = serializeResumeForAi(emptyResume)
    expect(result.education).toEqual([])
    expect(result.work).toEqual([])
    expect(result.custom).toEqual({})
  })
})

describe('extractSectionData', () => {
  it('personal 返回 personal 对象', () => {
    const result = extractSectionData(mockResume, 'personal')
    expect(result).toEqual(expect.objectContaining({ name: '张三' }))
  })

  it('education 返回 education 数组（无 id）', () => {
    const result = extractSectionData(mockResume, 'education') as Array<Record<string, unknown>>
    expect(Array.isArray(result)).toBe(true)
    const item = result[0]!
    expect(item).not.toHaveProperty('id')
    expect(item.school).toBe('北京大学')
  })

  it('work 返回 work 数组（无 id）', () => {
    const result = extractSectionData(mockResume, 'work') as Array<Record<string, unknown>>
    expect(Array.isArray(result)).toBe(true)
    const item = result[0]!
    expect(item.company).toBe('字节跳动')
  })

  it('skills 返回 skills 数组', () => {
    const result = extractSectionData(mockResume, 'skills') as Array<Record<string, unknown>>
    const item = result[0]!
    expect(item.name).toBe('TypeScript')
  })

  it('projects 返回 projects 数组', () => {
    const result = extractSectionData(mockResume, 'projects') as Array<Record<string, unknown>>
    const item = result[0]!
    expect(item.name).toBe('开源组件库')
  })

  it('custom 返回 custom 对象', () => {
    const result = extractSectionData(mockResume, 'custom') as Record<string, unknown>
    expect(result).toHaveProperty('certifications')
  })
})
