// @req R1.1 — Markdown 语法支持：markdown → Typst 标记转换
//
// 简历 description/summary 字段支持基础 markdown 语法：
//   **bold**, *italic*, ***bold italic***, - 列表, 1. 编号列表
// 转换后的字符串由 Typst 模板中的 eval(text, mode: "markup") 解释执行。

/** Unicode Private Use Area 字符，用作转换中间标记 */
const BOLD_MARKER = '\uE000'

/**
 * 将 Markdown 文本转换为 Typst markup 字符串。
 *
 * 支持的 Markdown 语法：
 * - `**bold**` → Typst `*bold*`
 * - `*italic*` → Typst `_italic_`
 * - `***bold italic***` → Typst `*_bold italic_*`
 * - `- item` → Typst `- item`（语法一致，无需转换）
 * - `1. item` → Typst `+ item`（Typst 枚举语法）
 *
 * 同时转义 Typst 特殊字符（#, $, @）防止 eval 意外解释。
 */
export function markdownToTypst(md: string): string {
  if (!md) return md

  let result = md

  // ── Phase 0: 转义 Typst 特殊字符 ──────────────────────────────────
  // 必须在 markdown 转换之前执行，否则转换产生的 Typst 语法也会被转义
  result = result.replace(/\\/g, '\\\\') // \ → \\ （必须最先）
  result = result.replace(/#/g, '\\#')
  result = result.replace(/\$/g, '\\$')
  result = result.replace(/@/g, '\\@')

  // ── Phase 1: bold+italic（***text***）→ 中间标记 ──────────────────
  result = result.replace(/\*{3}(.+?)\*{3}/g, `${BOLD_MARKER}_$1_${BOLD_MARKER}`)

  // ── Phase 2: bold（**text**）→ 中间标记 ───────────────────────────
  result = result.replace(/\*{2}(.+?)\*{2}/g, `${BOLD_MARKER}$1${BOLD_MARKER}`)

  // ── Phase 3: italic（*text*）→ Typst _text_ ──────────────────────
  // 此时 ** 和 *** 已消耗，剩余的单 * 对是 italic
  result = result.replace(/\*(.+?)\*/g, '_$1_')

  // ── Phase 4: 还原 bold 标记 → Typst * ────────────────────────────
  result = result.split(BOLD_MARKER).join('*')

  // ── Phase 5: 编号列表 ────────────────────────────────────────────
  // markdown "1. " → Typst "+ "（Typst 枚举语法）
  result = result.replace(/^\d+\.\s/gm, '+ ')

  return result
}
