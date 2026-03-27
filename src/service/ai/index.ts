// Service/AI 层：AI API 调用（OpenAI SDK via OpenRouter）
// 依赖：Repo, Config, Types

export { getAiClient, defaultModel } from './provider'
export { optimizeResume } from './optimize'
export type { OptimizeParams, OptimizeResult } from './optimize'
export { serializeResumeForAi, extractSectionData } from './serialize'
export { extractJsonFromText, validateSectionData, validatePartialResume } from './parse'
export { mergeAiResult, mergeAllSections } from './merge'
export { generateDiff, generateDiffForSections } from './diff'
