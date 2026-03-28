import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// @req F23 — modern 模板分页修复验证
// 这组测试验证 modern.typ 源码结构满足 F23 的修复要求：
// 不再使用 grid+rect(height: 100%) 锁死高度，改用 page background 方案

const templatePath = resolve(
  __dirname,
  '../../src/service/typst/templates/modern.typ',
)
const source = readFileSync(templatePath, 'utf-8')

describe('F23: modern.typ 分页修复 — 模板结构验证', () => {
  it('包含 @req F23 标注', () => {
    expect(source).toContain('@req F23')
  })

  it('使用 context place 方案绘制边栏背景', () => {
    // 社区验证方案（Typst 论坛）：
    // background 用 context { } 包裹，使 height: 100% 在页面上下文中正确解析
    // place(left, rect(width: 6.4cm, height: 100%, fill: dark-bg)) 覆盖整页左侧
    // 不再使用 fill: dark-bg + fill: white 反向填充 hack
    expect(source).toContain('background:')
    expect(source).toContain('context {')
    expect(source).toContain('place(left,')
    expect(source).toContain('width: 6.4cm,')
    expect(source).toContain('height: 100%,')
    expect(source).toContain('fill: dark-bg,')
    // 确认不再有整页 fill hack
    expect(source).not.toContain('fill: dark-bg,\n  background:')
  })

  it('主内容 margin 左侧留出边栏宽度', () => {
    // left margin = 6.4cm(边栏) + 1.4cm(间距) = 7.8cm
    expect(source).toContain('left: 7.8cm')
  })

  it('边栏内容通过 place() 绝对定位，而非 grid 单元格', () => {
    expect(source).toContain('place(left + top')
  })

  it('不再使用 grid+rect(height: 100%) 锁死高度的旧布局', () => {
    // 旧布局特征：grid(columns: (6.4cm, 1fr)) 外层 + rect(height: 100%)
    // 新布局中 grid 仍用于行内日期对齐，但不作为页面主布局容器
    // 验证：不存在以 grid( 开头、columns 包含 6.4cm 的页面布局模式
    const hasOldLayout = /^#grid\(\s*\n\s*columns:\s*\(6\.4cm/m.test(source)
    expect(hasOldLayout).toBe(false)
  })

  it('主内容区域为流式排版（无外层高度锁定的 rect 包裹）', () => {
    // 验证旧的右侧主内容 rect(width:100%, height:100%) 不存在
    const hasLockedRightRect = /rect\(\s*\n?\s*width:\s*100%,\s*\n?\s*height:\s*100%,\s*\n?\s*inset:/.test(source)
    expect(hasLockedRightRect).toBe(false)
  })

  it('保留所有颜色变量定义', () => {
    expect(source).toContain('#let accent = rgb("#2563EB")')
    expect(source).toContain('#let dark-bg = rgb("#1E293B")')
    expect(source).toContain('#let light-text = rgb("#F1F5F9")')
    expect(source).toContain('#let muted-text = rgb("#94A3B8")')
  })

  it('保留辅助函数：section-heading、sidebar-heading、date-range、render-md', () => {
    expect(source).toContain('#let section-heading(label)')
    expect(source).toContain('#let sidebar-heading(label)')
    expect(source).toContain('#let date-range(start, end)')
    expect(source).toContain('#let render-md(s)')
  })

  it('保留主内容区域的工作经历和项目经验渲染逻辑', () => {
    expect(source).toContain('工作经历')
    expect(source).toContain('项目经验')
    expect(source).toContain('section-order')
  })
})
