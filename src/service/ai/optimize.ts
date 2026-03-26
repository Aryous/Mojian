// Service/AI 层：简历内容优化
// 依赖：Config, Types, provider.ts

import { AI_OPTIMIZE_OPTIONS } from '@/config'
import { getAiClient, defaultModel } from './provider'

/**
 * 使用 AI 优化简历内容
 * @param content 待优化的文本
 * @param optionId 优化选项 ID（polish / quantify / concise / match-job）
 * @returns 优化后的文本
 */
export async function optimizeContent(
  content: string,
  optionId: string,
): Promise<string> {
  const option = AI_OPTIMIZE_OPTIONS.find((o) => o.id === optionId)
  if (!option) {
    throw new Error(`未知的优化选项: ${optionId}`)
  }

  const client = getAiClient()

  const response = await client.chat.completions.create({
    model: defaultModel,
    messages: [
      { role: 'system', content: option.systemPrompt },
      { role: 'user', content },
    ],
    temperature: 0.7,
    max_tokens: 2048,
  })

  const result = response.choices[0]?.message?.content
  if (!result) {
    throw new Error('AI 未返回有效内容，请重试。')
  }

  return result.trim()
}
