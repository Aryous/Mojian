// Service 层：Typst WASM 编译器封装
// 依赖：Types, @myriaddreamin/typst.ts

import { createTypstCompiler, type TypstCompiler } from '@myriaddreamin/typst.ts'
import type { Resume } from '@/types'

let compiler: TypstCompiler | null = null
let initPromise: Promise<void> | null = null

// 模板源码（构建时内联）
import classicTemplate from './templates/classic.typ?raw'

const TEMPLATES: Record<string, string> = {
  classic: classicTemplate,
}

/** 初始化编译器（单例，懒加载） */
async function ensureCompiler(): Promise<TypstCompiler> {
  if (compiler) return compiler

  if (!initPromise) {
    initPromise = (async () => {
      compiler = createTypstCompiler()
      await compiler.init()
    })()
  }

  await initPromise
  return compiler!
}

/** 将简历数据序列化为模板可消费的 JSON */
function serializeResumeData(resume: Resume): string {
  return JSON.stringify({
    personal: resume.personal,
    education: resume.education,
    work: resume.work,
    skills: resume.skills,
    projects: resume.projects,
  })
}

/** 编译简历为 vector 格式（用于预览） */
export async function compileToVector(resume: Resume): Promise<Uint8Array> {
  const c = await ensureCompiler()

  const templateId = resume.templateId || 'classic'
  const templateSource = TEMPLATES[templateId] ?? TEMPLATES['classic']!

  // 添加模板源码
  c.addSource('/main.typ', templateSource)

  // 编译，传入简历数据
  const result = await c.compile({
    mainFilePath: '/main.typ',
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

/** 编译简历为 PDF（用于导出） */
export async function compileToPdf(resume: Resume): Promise<Uint8Array> {
  const c = await ensureCompiler()

  const templateId = resume.templateId || 'classic'
  const templateSource = TEMPLATES[templateId] ?? TEMPLATES['classic']!

  c.addSource('/main.typ', templateSource)

  const result = await c.compile({
    mainFilePath: '/main.typ',
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
