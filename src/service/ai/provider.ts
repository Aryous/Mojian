// Service/AI 层：AI Provider（OpenAI SDK via OpenRouter）
// 依赖：Config, Repo
// 唯一入口：所有 AI API 调用必须经过此文件

import OpenAI from 'openai'
import { AI_BASE_URL, AI_DEFAULT_MODEL } from '@/config'
import { getApiKey } from '@/repo/settings'

/**
 * 获取配置好的 OpenAI SDK 实例
 * 每次调用都重新创建，确保使用最新的 API Key
 */
export function getAiClient(): OpenAI {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('API Key 未配置。请先在 AI 面板中设置 OpenRouter API Key。')
  }

  return new OpenAI({
    baseURL: AI_BASE_URL,
    apiKey,
    dangerouslyAllowBrowser: true,
  })
}

/** 默认模型标识 */
export const defaultModel = AI_DEFAULT_MODEL
