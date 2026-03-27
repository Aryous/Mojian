// Service/AI 层：AI JSON → Resume 合并
// 依赖：Types
// @req R3.3 — AI 上下文工程：AI 结果 → Resume 合并 (id 回填 + 类型安全转换)

import type {
  Resume,
  SectionType,
  PersonalInfo,
  EducationItem,
  WorkItem,
  SkillItem,
  ProjectItem,
} from '@/types'

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * 从 AI 返回的原始对象中安全读取字符串字段。
 * 若字段不存在或不是字符串，返回空字符串。
 */
function str(obj: Record<string, unknown>, key: string): string {
  const v = obj[key]
  return typeof v === 'string' ? v : ''
}

/**
 * 将 AI 返回的数组类型值转换为对象数组，过滤掉非对象元素。
 */
function toObjectArray(data: unknown): Record<string, unknown>[] {
  if (!Array.isArray(data)) return []
  return data.filter((item): item is Record<string, unknown> => {
    return typeof item === 'object' && item !== null && !Array.isArray(item)
  })
}

// ── section mergers ───────────────────────────────────────────────────────────

function mergePersonal(aiData: unknown): Partial<Resume> {
  if (typeof aiData !== 'object' || aiData === null || Array.isArray(aiData)) {
    return {}
  }
  const src = aiData as Record<string, unknown>
  const personal: PersonalInfo = {
    name: str(src, 'name'),
    title: str(src, 'title'),
    email: str(src, 'email'),
    phone: str(src, 'phone'),
    location: str(src, 'location'),
    website: str(src, 'website'),
    summary: str(src, 'summary'),
  }
  return { personal }
}

function mergeEducation(resume: Resume, aiData: unknown): Partial<Resume> {
  const items = toObjectArray(aiData)
  const education: EducationItem[] = items.map((item) => {
    const school = str(item, 'school')
    const startDate = str(item, 'startDate')
    // 用 school + startDate 匹配原条目，回填 id
    const existing = resume.education.find(
      (e) => e.school === school && e.startDate === startDate,
    )
    return {
      id: existing?.id ?? crypto.randomUUID(),
      school,
      degree: str(item, 'degree'),
      field: str(item, 'field'),
      startDate,
      endDate: str(item, 'endDate'),
      description: str(item, 'description'),
    }
  })
  return { education }
}

function mergeWork(resume: Resume, aiData: unknown): Partial<Resume> {
  const items = toObjectArray(aiData)
  const work: WorkItem[] = items.map((item) => {
    const company = str(item, 'company')
    const startDate = str(item, 'startDate')
    // 用 company + startDate 匹配原条目，回填 id
    const existing = resume.work.find(
      (w) => w.company === company && w.startDate === startDate,
    )
    return {
      id: existing?.id ?? crypto.randomUUID(),
      company,
      position: str(item, 'position'),
      startDate,
      endDate: str(item, 'endDate'),
      description: str(item, 'description'),
    }
  })
  return { work }
}

function mergeSkills(resume: Resume, aiData: unknown): Partial<Resume> {
  const items = toObjectArray(aiData)
  const skills: SkillItem[] = items.map((item) => {
    const name = str(item, 'name')
    // 用 name 匹配原条目，回填 id
    const existing = resume.skills.find((s) => s.name === name)
    const rawLevel = str(item, 'level')
    const level: SkillItem['level'] =
      rawLevel === 'beginner' ||
      rawLevel === 'intermediate' ||
      rawLevel === 'advanced' ||
      rawLevel === 'expert'
        ? rawLevel
        : 'intermediate'
    return {
      id: existing?.id ?? crypto.randomUUID(),
      name,
      level,
    }
  })
  return { skills }
}

function mergeProjects(resume: Resume, aiData: unknown): Partial<Resume> {
  const items = toObjectArray(aiData)
  const projects: ProjectItem[] = items.map((item) => {
    const name = str(item, 'name')
    const startDate = str(item, 'startDate')
    // 用 name + startDate 匹配原条目，回填 id
    const existing = resume.projects.find(
      (p) => p.name === name && p.startDate === startDate,
    )
    return {
      id: existing?.id ?? crypto.randomUUID(),
      name,
      role: str(item, 'role'),
      startDate,
      endDate: str(item, 'endDate'),
      description: str(item, 'description'),
      url: str(item, 'url'),
    }
  })
  return { projects }
}

// ── public API ────────────────────────────────────────────────────────────────

/**
 * 将 AI 返回的单个 section 数据合并回 Resume。
 */
export function mergeAiResult(
  resume: Resume,
  sectionType: SectionType,
  aiData: unknown,
): Partial<Resume> {
  switch (sectionType) {
    case 'personal':
      return mergePersonal(aiData)
    case 'education':
      return mergeEducation(resume, aiData)
    case 'work':
      return mergeWork(resume, aiData)
    case 'skills':
      return mergeSkills(resume, aiData)
    case 'projects':
      return mergeProjects(resume, aiData)
    case 'custom':
      return {}
  }
}

/**
 * 将 AI 返回的多个 section 一次性合并回 Resume。
 * sections 是 { personal?: ..., work?: [...], education?: [...], ... } 形式的对象。
 */
export function mergeAllSections(
  resume: Resume,
  sections: Record<string, unknown>,
): Partial<Resume> {
  let changes: Partial<Resume> = {}
  const sectionKeys: SectionType[] = ['personal', 'education', 'work', 'skills', 'projects']
  for (const key of sectionKeys) {
    if (sections[key] !== undefined) {
      changes = { ...changes, ...mergeAiResult(resume, key, sections[key]) }
    }
  }
  return changes
}
