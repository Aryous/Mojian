// Service 层：Typst WASM 编译器封装
// 依赖：Types, @myriaddreamin/typst.ts
// 渲染路径：compiler(vector) → renderer(SVG string) → dangerouslySetInnerHTML
// @req R2.1 — 简历渲染：Typst WASM 编译, SVG/PDF 生成

import {
  createTypstCompiler,
  createTypstRenderer,
  type TypstCompiler,
  type TypstRenderer,
  preloadRemoteFonts,
} from '@myriaddreamin/typst.ts'
import type { Resume } from '@/types'
import { markdownToTypst } from './markdown'

let compiler: TypstCompiler | null = null
let initPromise: Promise<void> | null = null

let renderer: TypstRenderer | null = null
let rendererInitPromise: Promise<void> | null = null

// 模板源码（构建时内联）
import classicTemplate from './templates/classic.typ?raw'
import twocolumnTemplate from './templates/twocolumn.typ?raw'
import academicTemplate from './templates/academic.typ?raw'
import modernTemplate from './templates/modern.typ?raw'
import minimalTemplate from './templates/minimal.typ?raw'

const TEMPLATES: Record<string, string> = {
  classic: classicTemplate,
  twocolumn: twocolumnTemplate,
  academic: academicTemplate,
  modern: modernTemplate,
  minimal: minimalTemplate,
}

/** 初始化编译器（单例，懒加载） */
async function ensureCompiler(): Promise<TypstCompiler> {
  if (compiler) return compiler

  if (!initPromise) {
    initPromise = (async () => {
      const c = createTypstCompiler()
      await c.init({
        getModule: () =>
          '/node_modules/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm',
        beforeBuild: [
          preloadRemoteFonts([], { assets: ['text', 'cjk'] }),
        ],
      })
      // 仅在 init 成功后赋值，避免未初始化实例被复用
      compiler = c
    })()
  }

  await initPromise
  return compiler!
}

/** 初始化渲染器（单例，懒加载） */
async function ensureRenderer(): Promise<TypstRenderer> {
  if (renderer) return renderer

  if (!rendererInitPromise) {
    rendererInitPromise = (async () => {
      const r = createTypstRenderer()
      await r.init({
        getModule: () =>
          '/node_modules/@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm',
      })
      renderer = r
    })()
  }

  await rendererInitPromise
  return renderer!
}

/** 将简历数据序列化为模板可消费的 JSON
 *  description/summary 字段经过 markdown → Typst 标记转换，
 *  模板中使用 eval(text, mode: "markup") 渲染。
 */
function serializeResumeData(resume: Resume): string {
  // Visible sections in sort order (excluding personal, always first)
  const sectionOrder = resume.sections
    .filter((s) => s.visible && s.type !== 'personal')
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((s) => s.type)

  const md = markdownToTypst

  return JSON.stringify({
    personal: { ...resume.personal, summary: md(resume.personal.summary) },
    education: resume.education.map((item) => ({ ...item, description: md(item.description) })),
    work: resume.work.map((item) => ({ ...item, description: md(item.description) })),
    skills: resume.skills,
    projects: resume.projects.map((item) => ({ ...item, description: md(item.description) })),
    sectionOrder,
  })
}

/** 编译简历为 vector 格式（用于预览） */
export async function compileToVector(resume: Resume): Promise<Uint8Array> {
  const c = await ensureCompiler()

  const templateId = resume.templateId || 'classic'
  const templateSource = TEMPLATES[templateId] ?? TEMPLATES['classic']!

  // 每个模板用独立路径，避免编译器缓存冲突导致切换模板时仍使用旧产物
  const mainPath = `/resume-${templateId}.typ`
  c.addSource(mainPath, templateSource)

  // 编译，传入简历数据
  const result = await c.compile({
    mainFilePath: mainPath,
    format: 0, // CompileFormatEnum.vector
    diagnostics: 'full',
    inputs: {
      'resume-data': serializeResumeData(resume),
    },
  })

  if (result.result) {
    return result.result
  }

  // 编译失败时输出诊断信息
  const errors = result.diagnostics?.map((d) =>
    typeof d === 'string' ? d : `${d.path}:${d.range}: ${d.severity}: ${d.message}`
  ).join('\n') ?? 'Unknown compilation error'

  throw new Error(`Typst compilation failed:\n${errors}`)
}

/** 编译简历为 SVG 字符串（用于预览） */
export async function compileToSvg(resume: Resume): Promise<string> {
  const vectorData = await compileToVector(resume)
  const r = await ensureRenderer()
  const svg = await r.renderSvg({
    artifactContent: vectorData,
    format: 'vector',
  })
  return svg
}

/** 编译简历为多页 SVG 数组（用于分页预览，每页一个 SVG） */
export async function compileToSvgs(resume: Resume): Promise<string[]> {
  // 先渲染完整多页 SVG，再按页面拆分
  // Typst SVG 格式：每页是 <g class="typst-page" transform="translate(0,yOffset)"
  //   data-page-width="W" data-page-height="H">
  const fullSvg = await compileToSvg(resume)
  return splitSvgByPages(fullSvg)
}

/** 从 transform="translate(x, y)" 中提取 y 偏移量 */
function parseTranslateY(transform: string): number {
  const m = transform.match(/translate\(\s*([-\d.e]+)[\s,]+([-\d.e]+)\s*\)/)
  return m ? parseFloat(m[2]!) : 0
}

/**
 * 将 Typst 输出的多页 SVG 按页面拆分为数组
 * 用 viewBox 裁剪每页区域，保留完整 defs/style 保证字体和样式可用
 */
function splitSvgByPages(fullSvg: string): string[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(fullSvg, 'image/svg+xml')
  const root = doc.documentElement

  const pageGroups = Array.from(root.querySelectorAll('g.typst-page'))
  if (pageGroups.length <= 1) return [fullSvg]

  const defs = root.querySelector('defs')
  const styles = Array.from(root.querySelectorAll('style'))
  const xmlns = 'http://www.w3.org/2000/svg'

  return pageGroups.map((group) => {
    const w = group.getAttribute('data-page-width') ?? '595.28'
    const h = group.getAttribute('data-page-height') ?? '841.89'
    const yOff = parseTranslateY(group.getAttribute('transform') ?? '')

    // 创建独立 SVG，用 viewBox 裁剪到此页
    const svg = document.createElementNS(xmlns, 'svg')
    svg.setAttribute('xmlns', xmlns)
    svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
    svg.setAttribute('width', w)
    svg.setAttribute('height', h)
    svg.setAttribute('viewBox', `0 ${yOff} ${w} ${h}`)

    if (defs) svg.appendChild(defs.cloneNode(true))
    styles.forEach((s) => svg.appendChild(s.cloneNode(true)))
    svg.appendChild(group.cloneNode(true))

    return new XMLSerializer().serializeToString(svg)
  })
}

/** 编译简历为 PDF（用于导出） */
export async function compileToPdf(resume: Resume): Promise<Uint8Array> {
  const c = await ensureCompiler()

  const templateId = resume.templateId || 'classic'
  const templateSource = TEMPLATES[templateId] ?? TEMPLATES['classic']!

  const mainPath = `/resume-${templateId}.typ`
  c.addSource(mainPath, templateSource)

  const result = await c.compile({
    mainFilePath: mainPath,
    format: 1, // CompileFormatEnum.pdf
    diagnostics: 'full',
    inputs: {
      'resume-data': serializeResumeData(resume),
    },
  })

  if (result.result) {
    return result.result
  }

  const errors = result.diagnostics?.map((d) =>
    typeof d === 'string' ? d : `${d.path}:${d.range}: ${d.severity}: ${d.message}`
  ).join('\n') ?? 'Unknown compilation error'

  throw new Error(`Typst PDF compilation failed:\n${errors}`)
}

/** 获取可用模板列表 */
export function getTemplateIds(): string[] {
  return Object.keys(TEMPLATES)
}
