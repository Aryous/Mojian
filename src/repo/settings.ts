// Repo 层：用户设置持久化（sessionStorage）
// 依赖：Config
// @req F19 — API Key 存储安全：使用 sessionStorage 替代 localStorage，关闭标签页即清除

import { AI_API_KEY_STORAGE_KEY } from '@/config'

/** 读取已保存的 API Key（sessionStorage，刷新保持，关闭标签页清除） */
export function getApiKey(): string | null {
  return sessionStorage.getItem(AI_API_KEY_STORAGE_KEY)
}

/** 保存 API Key（sessionStorage，刷新保持，关闭标签页清除） */
export function setApiKey(key: string): void {
  sessionStorage.setItem(AI_API_KEY_STORAGE_KEY, key)
}

/** 清除 API Key */
export function clearApiKey(): void {
  sessionStorage.removeItem(AI_API_KEY_STORAGE_KEY)
}
