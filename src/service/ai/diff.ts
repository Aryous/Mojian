// Service/AI 层：前后对比数据生成
// 依赖：Types
// @req R3.3 — AI 上下文工程：section 级别 diff 生成 (前后对比变更列表)

import type { AiDiffEntry, SectionType } from '@/types'

// ── helpers ───────────────────────────────────────────────────────────────────

/**
 * 安全读取对象字段的字符串值。
 * 只对比字符串字段，忽略非字符串类型。
 */
function toStringRecord(obj: unknown): Record<string, string> {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return {}
  }
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = value
    }
  }
  return result
}

/**
 * 将未知值转换为对象数组，过滤掉非对象元素。
 */
function toObjectArray(data: unknown): Record<string, unknown>[] {
  if (!Array.isArray(data)) return []
  return data.filter((item): item is Record<string, unknown> => {
    return typeof item === 'object' && item !== null && !Array.isArray(item)
  })
}

// ── diff generators ───────────────────────────────────────────────────────────

/**
 * 对比两个对象的字符串字段，生成变更列表。
 * prefix 用于构造 path，如 "personal"。
 */
function diffObject(
  prefix: string,
  original: unknown,
  optimized: unknown,
): AiDiffEntry[] {
  const entries: AiDiffEntry[] = []
  const origFields = toStringRecord(original)
  const optFields = toStringRecord(optimized)

  // 所有出现过的字段 key
  const allKeys = new Set([...Object.keys(origFields), ...Object.keys(optFields)])

  for (const key of allKeys) {
    const path = `${prefix}.${key}`
    const oldValue = origFields[key]
    const newValue = optFields[key]

    if (oldValue === undefined && newValue !== undefined) {
      entries.push({ path, type: 'added', newValue })
    } else if (oldValue !== undefined && newValue === undefined) {
      entries.push({ path, type: 'removed', oldValue })
    } else if (oldValue !== undefined && newValue !== undefined && oldValue !== newValue) {
      entries.push({ path, type: 'modified', oldValue, newValue })
    }
    // 值相同 → 跳过
  }

  return entries
}

/**
 * 对比两个数组（按索引），生成每个 item 的字段变更。
 * sectionPrefix 如 "work"，生成路径如 "work[0].description"。
 */
function diffArray(
  sectionPrefix: string,
  original: unknown,
  optimized: unknown,
): AiDiffEntry[] {
  const entries: AiDiffEntry[] = []
  const origArr = toObjectArray(original)
  const optArr = toObjectArray(optimized)

  const maxLen = Math.max(origArr.length, optArr.length)

  for (let i = 0; i < maxLen; i++) {
    const origItem = origArr[i]
    const optItem = optArr[i]
    const itemPrefix = `${sectionPrefix}[${i}]`

    if (origItem === undefined && optItem !== undefined) {
      // 新增 item：对 optItem 的每个字符串字段生成 added
      const optFields = toStringRecord(optItem)
      for (const [key, newValue] of Object.entries(optFields)) {
        entries.push({ path: `${itemPrefix}.${key}`, type: 'added', newValue })
      }
    } else if (origItem !== undefined && optItem === undefined) {
      // 删除 item：对 origItem 的每个字符串字段生成 removed
      const origFields = toStringRecord(origItem)
      for (const [key, oldValue] of Object.entries(origFields)) {
        entries.push({ path: `${itemPrefix}.${key}`, type: 'removed', oldValue })
      }
    } else if (origItem !== undefined && optItem !== undefined) {
      // 修改：逐字段对比
      entries.push(...diffObject(itemPrefix, origItem, optItem))
    }
  }

  return entries
}

// ── public API ────────────────────────────────────────────────────────────────

/**
 * 根据 sectionType 生成前后对比变更列表。
 *
 * - personal：逐字段对比对象
 * - 数组 section：按索引对比，处理新增 / 删除 / 修改
 * - custom：暂不支持，返回空数组
 * - 无变化时返回空数组
 */
export function generateDiff(
  sectionType: SectionType,
  original: unknown,
  optimized: unknown,
): AiDiffEntry[] {
  switch (sectionType) {
    case 'personal':
      return diffObject('personal', original, optimized)
    case 'education':
      return diffArray('education', original, optimized)
    case 'work':
      return diffArray('work', original, optimized)
    case 'skills':
      return diffArray('skills', original, optimized)
    case 'projects':
      return diffArray('projects', original, optimized)
    case 'custom':
      return []
  }
}

/**
 * 对多个 section 生成合并的 diff。
 * originalSections / optimizedSections 的 key 是 section type。
 */
export function generateDiffForSections(
  originalSections: Record<string, unknown>,
  optimizedSections: Record<string, unknown>,
): AiDiffEntry[] {
  const allDiffs: AiDiffEntry[] = []
  const sectionKeys: SectionType[] = ['personal', 'education', 'work', 'skills', 'projects']
  for (const key of sectionKeys) {
    if (optimizedSections[key] !== undefined) {
      allDiffs.push(...generateDiff(key, originalSections[key], optimizedSections[key]))
    }
  }
  return allDiffs
}
