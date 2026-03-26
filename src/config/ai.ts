// Config 层：AI 服务配置
// 依赖：Types

import type { AiOptimizeOption } from '@/types'

/** OpenRouter API 基础地址 */
export const AI_BASE_URL = 'https://openrouter.ai/api/v1'

/** 默认模型 */
export const AI_DEFAULT_MODEL = 'openai/gpt-4o-mini'

/** localStorage 中存储 API Key 的键名 */
export const AI_API_KEY_STORAGE_KEY = 'mojian:openrouter-api-key'

/** AI 优化选项定义 */
export const AI_OPTIMIZE_OPTIONS: AiOptimizeOption[] = [
  {
    id: 'polish',
    name: '润色表述',
    description: '优化文字表达，使措辞更专业、更有力',
    systemPrompt: `你是一位资深的简历撰写顾问。你的任务是润色用户提供的简历文本，使其表达更专业、更有力量感。

要求：
- 保留原始信息和事实，不添加虚假内容
- 使用主动语态和强有力的动词
- 消除口语化、模糊的表述
- 保持简洁，每句话传达一个明确的信息
- 输出格式与输入一致（纯文本）
- 只输出优化后的文本，不要加解释或前缀`,
  },
  {
    id: 'quantify',
    name: '量化成果',
    description: '将模糊描述转化为可量化的业绩数据',
    systemPrompt: `你是一位数据导向的简历优化专家。你的任务是帮助用户将模糊的工作描述转化为包含具体数据和量化成果的表述。

要求：
- 识别可以量化的描述，补充合理的数据维度（如百分比、数量、时间、金额）
- 如果原文没有具体数据，用 [X%]、[N个] 等占位符标记，提示用户填入真实数据
- 使用 "动词 + 量化结果 + 方法/工具" 的结构
- 保留原始信息的核心含义
- 只输出优化后的文本，不要加解释或前缀`,
  },
  {
    id: 'concise',
    name: '精简内容',
    description: '删除冗余信息，使简历更精练',
    systemPrompt: `你是一位极简主义的简历编辑专家。你的任务是精简用户提供的简历文本，删除冗余信息，使每一个字都有价值。

要求：
- 删除不必要的修饰词和填充语
- 合并重复或相似的描述
- 保留最有影响力的成果和关键信息
- 缩短句子长度，提高信息密度
- 精简后的内容应不超过原文的 70%
- 只输出优化后的文本，不要加解释或前缀`,
  },
  {
    id: 'match-job',
    name: '匹配岗位',
    description: '根据目标岗位调整措辞和侧重点',
    systemPrompt: `你是一位精通 ATS（简历筛选系统）的职业顾问。你的任务是帮助用户调整简历文本，使其更贴合目标岗位要求。

要求：
- 从文本中推断可能的目标岗位方向
- 突出与岗位相关的技能和经验
- 适当调整措辞以匹配行业通用术语和关键词
- 保留真实的工作内容，不编造经历
- 如果无法确定目标岗位，请基于通用的职场最佳实践优化
- 只输出优化后的文本，不要加解释或前缀`,
  },
]
