// Patch: @myriaddreamin/typst.react 发布时缺少 typst.css
// TypstDocument.js 引用 './typst.css?inline' 但文件不存在
// 创建空 CSS 文件使 Vite 的 ?inline 导入正常工作

import { writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const cssPath = resolve(__dirname, '../node_modules/@myriaddreamin/typst.react/dist/typst.css')

if (!existsSync(cssPath)) {
  writeFileSync(cssPath, '/* auto-generated placeholder for missing typst.css */\n')
  console.log('[patch] Created missing typst.css for @myriaddreamin/typst.react')
}
