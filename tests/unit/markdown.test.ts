import { describe, it, expect } from 'vitest'
import { markdownToTypst } from '@/service/typst/markdown'

describe('markdownToTypst', () => {
  it('空字符串原样返回', () => {
    expect(markdownToTypst('')).toBe('')
  })

  it('纯文本原样返回（无 markdown 语法）', () => {
    expect(markdownToTypst('普通文本内容')).toBe('普通文本内容')
  })

  // ── bold ──────────────────────────────────────────────────────────
  it('**bold** → *bold*', () => {
    expect(markdownToTypst('**粗体文字**')).toBe('*粗体文字*')
  })

  it('文本中嵌入 bold', () => {
    expect(markdownToTypst('带领团队完成 **3 个核心功能** 交付'))
      .toBe('带领团队完成 *3 个核心功能* 交付')
  })

  it('多个 bold 片段', () => {
    expect(markdownToTypst('**React** 和 **TypeScript**'))
      .toBe('*React* 和 *TypeScript*')
  })

  // ── italic ────────────────────────────────────────────────────────
  it('*italic* → _italic_', () => {
    expect(markdownToTypst('*斜体文字*')).toBe('_斜体文字_')
  })

  // ── bold + italic 共存 ────────────────────────────────────────────
  it('bold 和 italic 共存不冲突', () => {
    expect(markdownToTypst('**粗体** 和 *斜体*'))
      .toBe('*粗体* 和 _斜体_')
  })

  // ── bold italic ───────────────────────────────────────────────────
  it('***bold italic*** → *_bold italic_*', () => {
    expect(markdownToTypst('***粗斜体***')).toBe('*_粗斜体_*')
  })

  // ── 列表 ──────────────────────────────────────────────────────────
  it('无序列表保持不变（markdown 和 Typst 语法一致）', () => {
    const input = '- 第一项\n- 第二项\n- 第三项'
    expect(markdownToTypst(input)).toBe(input)
  })

  it('编号列表 "1. " → "+ "（Typst 枚举）', () => {
    expect(markdownToTypst('1. 第一项\n2. 第二项\n3. 第三项'))
      .toBe('+ 第一项\n+ 第二项\n+ 第三项')
  })

  // ── Typst 特殊字符转义 ────────────────────────────────────────────
  it('# 被转义为 \\#', () => {
    expect(markdownToTypst('C# 开发经验')).toBe('C\\# 开发经验')
  })

  it('$ 被转义为 \\$', () => {
    expect(markdownToTypst('节省 $50K 成本')).toBe('节省 \\$50K 成本')
  })

  it('@ 被转义为 \\@', () => {
    expect(markdownToTypst('联系 user@example.com')).toBe('联系 user\\@example.com')
  })

  it('\\ 被转义为 \\\\', () => {
    expect(markdownToTypst('a\\b')).toBe('a\\\\b')
  })

  // ── 综合场景 ──────────────────────────────────────────────────────
  it('综合：bold + 列表 + 特殊字符', () => {
    const input = '主导 **核心功能** 开发：\n- 性能优化 #1 优先级\n- 节省 $30K'
    const expected = '主导 *核心功能* 开发：\n- 性能优化 \\#1 优先级\n- 节省 \\$30K'
    expect(markdownToTypst(input)).toBe(expected)
  })

  it('典型简历描述', () => {
    const input = '带领 **5 人团队** 完成 *敏捷转型*，交付周期缩短 **40%**'
    const expected = '带领 *5 人团队* 完成 _敏捷转型_，交付周期缩短 *40%*'
    expect(markdownToTypst(input)).toBe(expected)
  })
})
