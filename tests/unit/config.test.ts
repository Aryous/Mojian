import { describe, it, expect } from 'vitest'
import { TEMPLATES, AI_OPTIMIZE_OPTIONS, AI_BASE_URL } from '@/config'

describe('Config 层：模板配置', () => {
  it('TEMPLATES 包含 3 个模板', () => {
    expect(TEMPLATES).toHaveLength(3)
  })

  it.each(TEMPLATES)('模板 "$id" 包含必需字段', (template) => {
    expect(template).toHaveProperty('id')
    expect(template).toHaveProperty('name')
    expect(template).toHaveProperty('description')
    expect(typeof template.id).toBe('string')
    expect(typeof template.name).toBe('string')
    expect(typeof template.description).toBe('string')
  })

  it('模板 ID 分别为 classic / twocolumn / academic', () => {
    const ids = TEMPLATES.map((t) => t.id)
    expect(ids).toEqual(['classic', 'twocolumn', 'academic'])
  })
})

describe('Config 层：AI 优化选项', () => {
  it('AI_OPTIMIZE_OPTIONS 包含 4 个选项', () => {
    expect(AI_OPTIMIZE_OPTIONS).toHaveLength(4)
  })

  it.each(AI_OPTIMIZE_OPTIONS)('选项 "$id" 包含必需字段', (option) => {
    expect(option).toHaveProperty('id')
    expect(option).toHaveProperty('name')
    expect(option).toHaveProperty('description')
    expect(option).toHaveProperty('systemPrompt')
    expect(typeof option.id).toBe('string')
    expect(typeof option.name).toBe('string')
    expect(typeof option.description).toBe('string')
    expect(typeof option.systemPrompt).toBe('string')
    expect(option.systemPrompt.length).toBeGreaterThan(0)
  })

  it('选项 ID 分别为 polish / quantify / concise / match-job', () => {
    const ids = AI_OPTIMIZE_OPTIONS.map((o) => o.id)
    expect(ids).toEqual(['polish', 'quantify', 'concise', 'match-job'])
  })
})

describe('Config 层：AI 基础地址', () => {
  it('AI_BASE_URL 指向 openrouter', () => {
    expect(AI_BASE_URL).toContain('openrouter')
  })

  it('AI_BASE_URL 是合法的 HTTPS URL', () => {
    expect(AI_BASE_URL).toMatch(/^https:\/\//)
  })
})
