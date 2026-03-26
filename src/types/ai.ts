// AI 相关类型定义
// Types 层：最底层，不依赖任何其他层

/** AI 优化选项 */
export interface AiOptimizeOption {
  id: string
  name: string
  description: string
  systemPrompt: string
}

/** AI 优化结果 */
export interface AiOptimizeResult {
  original: string
  optimized: string
  optionId: string
}
