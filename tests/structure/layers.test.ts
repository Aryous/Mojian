import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const SRC = path.resolve(__dirname, '../../src')

const REQUIRED_LAYERS = ['types', 'config', 'repo', 'service', 'runtime', 'ui']

const REQUIRED_SERVICE_SUBDIRS = ['ai', 'typst', 'export']
const REQUIRED_UI_SUBDIRS = ['tokens', 'components', 'patterns', 'layouts']

describe('目录结构完整性', () => {
  it.each(REQUIRED_LAYERS)('src/%s/ 目录存在', (layer) => {
    expect(fs.existsSync(path.join(SRC, layer))).toBe(true)
  })

  it.each(REQUIRED_SERVICE_SUBDIRS)('src/service/%s/ 目录存在', (sub) => {
    expect(fs.existsSync(path.join(SRC, 'service', sub))).toBe(true)
  })

  it.each(REQUIRED_UI_SUBDIRS)('src/ui/%s/ 目录存在', (sub) => {
    expect(fs.existsSync(path.join(SRC, 'ui', sub))).toBe(true)
  })
})

/** 递归获取目录下所有 .ts/.tsx 文件 */
function getFiles(dir: string, ext: string[] = ['.ts', '.tsx']): string[] {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...getFiles(full, ext))
    } else if (ext.some((e) => entry.name.endsWith(e))) {
      files.push(full)
    }
  }
  return files
}

const LAYERS = ['types', 'config', 'repo', 'service', 'runtime', 'ui'] as const

const ALLOWED_DEPS: Record<string, string[]> = {
  types: ['types'],
  config: ['config', 'types'],
  repo: ['repo', 'config', 'types'],
  service: ['service', 'repo', 'config', 'types'],
  runtime: ['runtime', 'service', 'config', 'types'],
  ui: ['ui', 'runtime', 'config', 'types'],
}

function getLayer(filePath: string): string | null {
  const match = filePath.match(/src\/(types|config|repo|service|runtime|ui)\//)
  return match ? match[1]! : null
}

function getImportLayer(importPath: string): string | null {
  const normalized = importPath.replace(/^@\//, 'src/')
  const match = normalized.match(/^src\/(types|config|repo|service|runtime|ui)(?:\/|$)/)
  return match ? match[1]! : null
}

describe('分层依赖规则', () => {
  const allFiles = LAYERS.flatMap((layer) => getFiles(path.join(SRC, layer)))

  // Skip if no source files yet
  if (allFiles.length === 0) {
    it('尚无源文件，跳过依赖检查', () => {
      expect(true).toBe(true)
    })
    return
  }

  for (const file of allFiles) {
    const fromLayer = getLayer(file)
    if (!fromLayer) continue

    const content = fs.readFileSync(file, 'utf-8')
    const importRegex = /import\s+.*?from\s+['"](@\/[^'"]+|\.\.?\/[^'"]+)['"]/g
    let match: RegExpExecArray | null

    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1]!
      const toLayer = getImportLayer(importPath)
      if (!toLayer) continue

      if (!ALLOWED_DEPS[fromLayer]!.includes(toLayer)) {
        const rel = path.relative(SRC, file)
        it(`${rel} 不应引用 ${toLayer} 层`, () => {
          expect.fail(
            `${rel} (${fromLayer} 层) 引用了 ${importPath} (${toLayer} 层)，违反分层规则`
          )
        })
      }
    }
  }

  it('所有文件通过分层依赖检查', () => {
    expect(true).toBe(true)
  })
})
