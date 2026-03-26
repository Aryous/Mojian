// Repo 层：用户设置持久化（localStorage）
// 依赖：Config

import { AI_API_KEY_STORAGE_KEY } from '@/config'

/** 读取已保存的 API Key */
export function getApiKey(): string | null {
  return localStorage.getItem(AI_API_KEY_STORAGE_KEY)
}

/** 保存 API Key */
export function setApiKey(key: string): void {
  localStorage.setItem(AI_API_KEY_STORAGE_KEY, key)
}

/** 清除 API Key */
export function clearApiKey(): void {
  localStorage.removeItem(AI_API_KEY_STORAGE_KEY)
}
