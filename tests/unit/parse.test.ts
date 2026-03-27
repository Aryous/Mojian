import { describe, it, expect } from 'vitest'
import { extractJsonFromText, validateSectionData } from '@/service/ai/parse'

describe('extractJsonFromText', () => {
  it('解析裸 JSON 对象', () => {
    const result = extractJsonFromText('{"name":"张三","title":"工程师"}')
    expect(result).toEqual({ name: '张三', title: '工程师' })
  })

  it('解析裸 JSON 数组', () => {
    const result = extractJsonFromText('[{"name":"TypeScript"}]')
    expect(result).toEqual([{ name: 'TypeScript' }])
  })

  it('提取 ```json 代码块中的 JSON', () => {
    const text = '```json\n{"name":"张三"}\n```'
    const result = extractJsonFromText(text)
    expect(result).toEqual({ name: '张三' })
  })

  it('提取 ``` 代码块（无 json 标注）', () => {
    const text = '```\n{"name":"张三"}\n```'
    const result = extractJsonFromText(text)
    expect(result).toEqual({ name: '张三' })
  })

  it('提取前后带文字说明的 JSON', () => {
    const text = '以下是优化后的简历数据：\n{"name":"张三","title":"工程师"}\n请确认是否接受。'
    const result = extractJsonFromText(text)
    expect(result).toEqual({ name: '张三', title: '工程师' })
  })

  it('无效 JSON 时抛出 SyntaxError', () => {
    expect(() => extractJsonFromText('这不是 JSON')).toThrow(SyntaxError)
  })

  it('多行 JSON 对象正确解析', () => {
    const text = `
\`\`\`json
[
  {"company": "字节跳动", "position": "前端工程师", "startDate": "2019-07", "endDate": "至今", "description": "负责开发"},
  {"company": "阿里巴巴", "position": "高级工程师", "startDate": "2022-01", "endDate": "至今", "description": "架构设计"}
]
\`\`\`
`
    const result = extractJsonFromText(text) as unknown[]
    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(2)
  })
})

describe('validateSectionData', () => {
  describe('personal', () => {
    it('valid personal 数据通过校验', () => {
      const data = {
        name: '张三',
        title: '工程师',
        email: 'a@b.com',
        phone: '13800000000',
        location: '北京',
        website: 'https://example.com',
        summary: '五年经验',
      }
      const result = validateSectionData('personal', data)
      expect(result).toEqual(data)
    })

    it('缺少必填字段时抛出 ZodError', () => {
      const data = { name: '张三' }
      expect(() => validateSectionData('personal', data)).toThrow()
    })
  })

  describe('education', () => {
    it('valid education 数组通过校验', () => {
      const data = [
        {
          school: '北京大学',
          degree: '学士',
          field: '计算机',
          startDate: '2015-09',
          endDate: '2019-06',
          description: '主修计算机',
        },
      ]
      const result = validateSectionData('education', data)
      expect(result).toEqual(data)
    })

    it('空数组通过校验', () => {
      const result = validateSectionData('education', [])
      expect(result).toEqual([])
    })

    it('非数组时抛出 ZodError', () => {
      expect(() => validateSectionData('education', { school: '北京大学' })).toThrow()
    })
  })

  describe('work', () => {
    it('valid work 数组通过校验', () => {
      const data = [
        {
          company: '字节跳动',
          position: '前端工程师',
          startDate: '2019-07',
          endDate: '至今',
          description: '负责开发',
        },
      ]
      const result = validateSectionData('work', data)
      expect(result).toEqual(data)
    })
  })

  describe('skills', () => {
    it('valid skills 数组通过校验', () => {
      const data = [
        { name: 'TypeScript', level: 'advanced' as const },
        { name: 'React', level: 'expert' as const },
      ]
      const result = validateSectionData('skills', data)
      expect(result).toEqual(data)
    })

    it('level 值非法时抛出 ZodError', () => {
      const data = [{ name: 'TypeScript', level: 'godlike' }]
      expect(() => validateSectionData('skills', data)).toThrow()
    })
  })

  describe('projects', () => {
    it('valid projects 数组通过校验', () => {
      const data = [
        {
          name: '开源组件库',
          role: '主要贡献者',
          startDate: '2021-01',
          endDate: '2022-12',
          description: '维护组件库',
          url: 'https://github.com/example/lib',
        },
      ]
      const result = validateSectionData('projects', data)
      expect(result).toEqual(data)
    })
  })

  describe('custom', () => {
    it('valid custom 数组通过校验', () => {
      const data = [
        { title: 'AWS 认证', subtitle: '云从业者', date: '2022-03', description: '通过认证' },
      ]
      const result = validateSectionData('custom', data)
      expect(result).toEqual(data)
    })
  })

  it('Zod 会剥离多余字段（strip）', () => {
    const data = [
      {
        name: 'TypeScript',
        level: 'advanced' as const,
        extraField: '这个字段不应该存在',
      },
    ]
    const result = validateSectionData('skills', data) as Array<Record<string, unknown>>
    const item = result[0]!
    expect(item).not.toHaveProperty('extraField')
    expect(item.name).toBe('TypeScript')
  })
})
