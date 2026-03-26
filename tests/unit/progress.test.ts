import { describe, it, expect } from 'vitest'
import { getResumeProgress } from '@/service/resume/progress'
import type { Resume } from '@/types'

function makeResume(overrides: Partial<Resume> = {}): Resume {
  return {
    id: 'test-1',
    title: 'Test',
    templateId: 'classic',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    personal: { name: '', title: '', email: '', phone: '', location: '', website: '', summary: '' },
    sections: [],
    education: [],
    work: [],
    skills: [],
    projects: [],
    custom: {},
    ...overrides,
  }
}

describe('getResumeProgress', () => {
  it('returns 0/5 for empty resume', () => {
    const result = getResumeProgress(makeResume())
    expect(result).toEqual({ filled: 0, total: 5 })
  })

  it('counts personal as filled when name is non-empty', () => {
    const result = getResumeProgress(makeResume({
      personal: { name: '张三', title: '', email: '', phone: '', location: '', website: '', summary: '' },
    }))
    expect(result).toEqual({ filled: 1, total: 5 })
  })

  it('counts education as filled when array is non-empty', () => {
    const result = getResumeProgress(makeResume({
      education: [{ id: 'e1', school: '北大', degree: '硕士', field: 'CS', startDate: '', endDate: '', description: '' }],
    }))
    expect(result).toEqual({ filled: 1, total: 5 })
  })

  it('returns 5/5 when all sections filled', () => {
    const result = getResumeProgress(makeResume({
      personal: { name: '张三', title: '工程师', email: 'a@b.com', phone: '138', location: '北京', website: '', summary: '' },
      education: [{ id: 'e1', school: '北大', degree: '硕士', field: 'CS', startDate: '', endDate: '', description: '' }],
      work: [{ id: 'w1', company: '字节', position: '前端', startDate: '', endDate: '', description: '' }],
      skills: [{ id: 's1', name: 'React', level: 'expert' }],
      projects: [{ id: 'p1', name: '墨简', role: '开发', startDate: '', endDate: '', description: '', url: '' }],
    }))
    expect(result).toEqual({ filled: 5, total: 5 })
  })
})
