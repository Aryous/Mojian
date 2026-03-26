/**
 * 墨简分层依赖规则（硬约束）
 *
 * 架构层级：Types → Config → Repo → Service → Runtime → UI
 * 允许向下依赖，禁止向上依赖，禁止跨层依赖。
 *
 * 违反此规则会导致构建失败——这是不可绕过的硬约束。
 */

const LAYERS = ['types', 'config', 'repo', 'service', 'runtime', 'ui']

/** 每层允许引用的层（含自身） */
const ALLOWED_DEPS = {
  types: ['types'],
  config: ['config', 'types'],
  repo: ['repo', 'config', 'types'],
  service: ['service', 'repo', 'config', 'types'],
  runtime: ['runtime', 'service', 'config', 'types'],
  ui: ['ui', 'runtime', 'config', 'types'],
}

function getLayer(filePath) {
  const match = filePath.match(/src\/(types|config|repo|service|runtime|ui)\//)
  return match ? match[1] : null
}

function getImportLayer(importPath) {
  // Handle @/ alias
  const normalized = importPath.replace(/^@\//, 'src/')
  const match = normalized.match(/^src\/(types|config|repo|service|runtime|ui)(?:\/|$)/)
  return match ? match[1] : null
}

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: '禁止违反墨简分层架构的导入。层级：Types → Config → Repo → Service → Runtime → UI',
    },
    messages: {
      forbidden:
        '禁止从 {{fromLayer}} 层引用 {{toLayer}} 层。\n' +
        '允许的依赖方向：Types → Config → Repo → Service → Runtime → UI\n' +
        '修复方法：如需跨层通信，通过 Runtime 层中转，或将共享逻辑下沉到 Types/Config 层。',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename()
    const fromLayer = getLayer(filename)

    if (!fromLayer) return {}

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value
        const toLayer = getImportLayer(importPath)

        if (!toLayer) return
        if (ALLOWED_DEPS[fromLayer].includes(toLayer)) return

        context.report({
          node: node.source,
          messageId: 'forbidden',
          data: { fromLayer, toLayer },
        })
      },
    }
  },
}

const plugin = {
  rules: {
    'layer-dependency': rule,
  },
}

export default plugin
