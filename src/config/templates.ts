// Config 层：模板元数据定义
// 依赖：Types

export interface TemplateMeta {
  id: string
  name: string
  description: string
}

/** 所有可用模板（顺序即为 UI 展示顺序） */
export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'classic',
    name: '经典',
    description: '单栏布局，简洁大方',
  },
  {
    id: 'twocolumn',
    name: '双栏',
    description: '左右分栏，信息密度更高',
  },
  {
    id: 'academic',
    name: '学术',
    description: '衬线字体，适合学术/研究背景',
  },
]
