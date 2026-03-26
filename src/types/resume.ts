// 简历数据模型
// Types 层：最底层，不依赖任何其他层

/** 简历模块类型标识 */
export type SectionType =
  | 'personal'
  | 'education'
  | 'work'
  | 'skills'
  | 'projects'
  | 'custom'

/** 个人信息 */
export interface PersonalInfo {
  name: string
  title: string
  email: string
  phone: string
  location: string
  website: string
  summary: string
}

/** 教育经历 */
export interface EducationItem {
  id: string
  school: string
  degree: string
  field: string
  startDate: string
  endDate: string
  description: string
}

/** 工作经历 */
export interface WorkItem {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
}

/** 技能 */
export interface SkillItem {
  id: string
  name: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

/** 项目经验 */
export interface ProjectItem {
  id: string
  name: string
  role: string
  startDate: string
  endDate: string
  description: string
  url: string
}

/** 自定义模块条目 */
export interface CustomItem {
  id: string
  title: string
  subtitle: string
  date: string
  description: string
}

/** 简历模块（可排序） */
export interface ResumeSection {
  id: string
  type: SectionType
  title: string
  visible: boolean
  sortOrder: number
}

/** 完整简历数据 */
export interface Resume {
  id: string
  title: string
  templateId: string
  createdAt: number
  updatedAt: number
  personal: PersonalInfo
  sections: ResumeSection[]
  education: EducationItem[]
  work: WorkItem[]
  skills: SkillItem[]
  projects: ProjectItem[]
  custom: Record<string, CustomItem[]>
}

/** 创建简历时的输入（省略自动生成的字段） */
export type ResumeCreateInput = Pick<Resume, 'title'>

/** 简历列表项（不含完整内容） */
export interface ResumeSummary {
  id: string
  title: string
  templateId: string
  createdAt: number
  updatedAt: number
}
