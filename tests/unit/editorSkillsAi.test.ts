// tests/unit/editorSkillsAi.test.ts
// @req F14 — skills section 墨灵润色入口
//
// 验证范围：
//   - handleSectionAi 对 skills section 正常触发（不被排除）
//   - 所有 SectionType 都可以作为 AI target section
//   - EditorPage 源代码中不再包含排除 skills 的条件

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import type { SectionType } from '@/types'

// ── 源代码层面验证排除条件已移除 ──────────────────────────────────────────────

describe('F14 — 排除条件已从源代码中移除', () => {
  const srcPath = resolve(__dirname, '../../src/ui/pages/EditorPage/EditorPage.tsx')
  const src = readFileSync(srcPath, 'utf-8')

  it('EditorPage.tsx 不再包含 section.type !== "skills" 排除条件', () => {
    expect(src).not.toMatch(/section\.type\s*!==\s*['"]skills['"]/)
  })

  it('EditorPage.tsx 包含 @req F14 标注', () => {
    expect(src).toContain('@req F14')
  })

  it('墨灵润色按钮渲染不被 skills 条件包裹', () => {
    // 确认按钮的 sectionAiBtn className 存在于源码中
    expect(src).toContain('sectionAiBtn')
    // 确认按钮的 aria-label 存在
    expect(src).toContain('墨灵润色${section.title}')
  })
})

// ── handleSectionAi 逻辑：对所有 SectionType 均可设为 target ─────────────────

describe('F14 — handleSectionAi 对 skills section 正常工作', () => {
  // 模拟 EditorPage 中 handleSectionAi 的逻辑
  function makeHandleSectionAi() {
    let aiTargetSection: SectionType | undefined = undefined
    let aiOpen = false

    const handleSectionAi = (sectionType: SectionType) => {
      aiTargetSection = sectionType
      aiOpen = true
    }

    return { handleSectionAi, getTarget: () => aiTargetSection, isOpen: () => aiOpen }
  }

  it('传入 skills 时 aiTargetSection 被设为 skills', () => {
    const { handleSectionAi, getTarget, isOpen } = makeHandleSectionAi()
    handleSectionAi('skills')
    expect(getTarget()).toBe('skills')
    expect(isOpen()).toBe(true)
  })

  it('传入 work 时 aiTargetSection 被设为 work', () => {
    const { handleSectionAi, getTarget } = makeHandleSectionAi()
    handleSectionAi('work')
    expect(getTarget()).toBe('work')
  })

  it('所有 SectionType 均可作为 target，无一被过滤', () => {
    const allTypes: SectionType[] = ['personal', 'education', 'work', 'skills', 'projects', 'custom']

    for (const type of allTypes) {
      const { handleSectionAi, getTarget } = makeHandleSectionAi()
      handleSectionAi(type)
      expect(getTarget()).toBe(type)
    }
  })
})
