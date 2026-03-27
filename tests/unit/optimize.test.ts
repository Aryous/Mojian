import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Resume } from '@/types'

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
    key: vi.fn(() => null),
  }
})()

vi.stubGlobal('localStorage', localStorageMock)

// Mock OpenAI SDK
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    })),
  }
})

/** 最小合法 Resume fixture */
const mockResume: Resume = {
  id: 'test-resume-id',
  title: '测试简历',
  templateId: 'classic',
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
  personal: {
    name: '张三',
    title: '前端工程师',
    email: 'zhangsan@example.com',
    phone: '13800000000',
    location: '北京',
    website: 'https://example.com',
    summary: '5年前端开发经验',
  },
  sections: [
    { id: 'sec-personal', type: 'personal', title: '个人信息', visible: true, sortOrder: 0 },
    { id: 'sec-work', type: 'work', title: '工作经历', visible: true, sortOrder: 1 },
    { id: 'sec-edu', type: 'education', title: '教育经历', visible: true, sortOrder: 2 },
    { id: 'sec-skills', type: 'skills', title: '技能', visible: true, sortOrder: 3 },
    { id: 'sec-proj', type: 'projects', title: '项目经验', visible: true, sortOrder: 4 },
  ],
  education: [
    {
      id: 'edu-1',
      school: '北京大学',
      degree: '本科',
      field: '计算机科学',
      startDate: '2016-09',
      endDate: '2020-06',
      description: '',
    },
  ],
  work: [
    {
      id: 'work-1',
      company: '字节跳动',
      position: '前端工程师',
      startDate: '2020-07',
      endDate: '2024-01',
      description: '负责抖音 Web 端开发',
    },
  ],
  skills: [
    { id: 'skill-1', name: 'React', level: 'expert' },
    { id: 'skill-2', name: 'TypeScript', level: 'advanced' },
  ],
  projects: [
    {
      id: 'proj-1',
      name: '个人博客',
      role: '独立开发者',
      startDate: '2023-01',
      endDate: '2023-06',
      description: '基于 Next.js 搭建',
      url: 'https://blog.example.com',
    },
  ],
  custom: {},
}

describe('optimizeResume — 基础校验', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('未知 optionId 应抛出包含"未知的优化选项"的错误', async () => {
    // 设置 API Key，使 getAiClient 不抛 API Key 错误
    localStorageMock.setItem('mojian:openrouter-api-key', 'sk-test-key')

    const { optimizeResume } = await import('@/service/ai/optimize')
    await expect(
      optimizeResume({
        resume: mockResume,
        optionId: 'nonexistent-option-id',
        userPrompt: '请优化',
        targetSection: 'work',
      }),
    ).rejects.toThrow('未知的优化选项')
  })

  it('AI 返回空内容时应抛出"AI 未返回有效内容"错误', async () => {
    localStorageMock.setItem('mojian:openrouter-api-key', 'sk-test-key')

    // 动态获取 OpenAI mock 实例，设置 create 返回空内容
    const OpenAI = (await import('openai')).default
    const mockCreate = vi.fn().mockResolvedValue({
      choices: [{ message: { content: null } }],
    })
    vi.mocked(OpenAI).mockImplementation(
      () =>
        ({
          chat: { completions: { create: mockCreate } },
        }) as unknown as InstanceType<typeof OpenAI>,
    )

    const { optimizeResume } = await import('@/service/ai/optimize')
    await expect(
      optimizeResume({
        resume: mockResume,
        optionId: 'polish',
        userPrompt: '',
        targetSection: 'work',
      }),
    ).rejects.toThrow('AI 未返回有效内容')
  })
})

describe('optimizeResume — happy path（mock AI 返回）', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    localStorageMock.setItem('mojian:openrouter-api-key', 'sk-test-key')
  })

  it('AI 返回合法 work JSON 数组，经 Zod 校验后返回数据', async () => {
    const aiWorkData = [
      {
        company: '字节跳动',
        position: '高级前端工程师',
        startDate: '2020-07',
        endDate: '2024-01',
        description: '主导抖音 Web 端核心功能开发，带领 3 人团队完成性能优化，页面加载速度提升 40%',
      },
    ]

    const OpenAI = (await import('openai')).default
    const mockCreate = vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: '```json\n' + JSON.stringify(aiWorkData) + '\n```',
          },
        },
      ],
    })
    vi.mocked(OpenAI).mockImplementation(
      () =>
        ({
          chat: { completions: { create: mockCreate } },
        }) as unknown as InstanceType<typeof OpenAI>,
    )

    const { optimizeResume } = await import('@/service/ai/optimize')
    const result = await optimizeResume({
      resume: mockResume,
      optionId: 'polish',
      userPrompt: '请让描述更有力量',
      targetSection: 'work',
    })

    expect(result.sections.work).toEqual(aiWorkData)
    expect(mockCreate).toHaveBeenCalledOnce()

    // 校验 system message 包含 JSON 输出格式要求
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callArgs = mockCreate.mock.calls[0]![0] as any
    expect(callArgs.messages[0].role).toBe('system')
    expect(callArgs.messages[0].content).toContain('JSON 数组')

    // 校验 user message 包含简历 JSON 和优化目标
    expect(callArgs.messages[1].role).toBe('user')
    expect(callArgs.messages[1].content).toContain('字节跳动')
    expect(callArgs.messages[1].content).toContain('工作经历（work）')
    expect(callArgs.messages[1].content).toContain('请让描述更有力量')
  })

  it('AI 返回合法 personal JSON 对象，经 Zod 校验后返回数据', async () => {
    const aiPersonalData = {
      name: '张三',
      title: '资深前端工程师',
      email: 'zhangsan@example.com',
      phone: '13800000000',
      location: '北京',
      website: 'https://example.com',
      summary: '5 年前端开发经验，主导过多个大型项目，精通 React 和 TypeScript',
    }

    const OpenAI = (await import('openai')).default
    const mockCreate = vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify(aiPersonalData),
          },
        },
      ],
    })
    vi.mocked(OpenAI).mockImplementation(
      () =>
        ({
          chat: { completions: { create: mockCreate } },
        }) as unknown as InstanceType<typeof OpenAI>,
    )

    const { optimizeResume } = await import('@/service/ai/optimize')
    const result = await optimizeResume({
      resume: mockResume,
      optionId: 'concise',
      userPrompt: '',
      targetSection: 'personal',
    })

    expect(result.sections.personal).toEqual(aiPersonalData)

    // personal section 的 system message 应包含"JSON 对象"而非数组
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callArgs = mockCreate.mock.calls[0]![0] as any
    expect(callArgs.messages[0].content).toContain('JSON 对象')
    expect(callArgs.messages[0].content).toContain('name、title、email')
  })

  it('max_tokens 为 4096（比旧接口的 2048 更大）', async () => {
    const OpenAI = (await import('openai')).default
    const mockCreate = vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify([
              {
                name: 'React',
                level: 'expert',
              },
            ]),
          },
        },
      ],
    })
    vi.mocked(OpenAI).mockImplementation(
      () =>
        ({
          chat: { completions: { create: mockCreate } },
        }) as unknown as InstanceType<typeof OpenAI>,
    )

    const { optimizeResume } = await import('@/service/ai/optimize')
    await optimizeResume({
      resume: mockResume,
      optionId: 'quantify',
      userPrompt: '',
      targetSection: 'skills',
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callArgs = mockCreate.mock.calls[0]![0] as any
    expect(callArgs.max_tokens).toBe(4096)
  })
})

