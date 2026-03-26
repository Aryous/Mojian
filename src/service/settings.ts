// Service 层：用户设置服务
// 依赖：Repo
// 作为 Runtime 层和 Repo 层之间的桥梁

import { getApiKey as repoGetApiKey, setApiKey as repoSetApiKey, clearApiKey as repoClearApiKey } from '@/repo/settings'

/** 读取已保存的 API Key */
export function getApiKey(): string | null {
  return repoGetApiKey()
}

/** 保存 API Key */
export function setApiKey(key: string): void {
  repoSetApiKey(key)
}

/** 清除 API Key */
export function clearApiKey(): void {
  repoClearApiKey()
}
