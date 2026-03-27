// Service/AI 层：Resume → AI JSON 序列化
// 依赖：Types
// @req R3.3 — AI 上下文工程：Resume → JSON 序列化 (剥离系统字段, 保留结构化内容)

import type { Resume, SectionType } from '@/types'

/**
 * 将 Resume 序列化为 AI 可理解的 JSON 对象
 * 剥离系统字段（id、createdAt、updatedAt、templateId），保留结构化内容
 */
export function serializeResumeForAi(resume: Resume): Record<string, unknown> {
  return {
    personal: {
      name: resume.personal.name,
      title: resume.personal.title,
      email: resume.personal.email,
      phone: resume.personal.phone,
      location: resume.personal.location,
      website: resume.personal.website,
      summary: resume.personal.summary,
    },
    sections: resume.sections
      .filter((s) => s.visible)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => ({ type: s.type, title: s.title })),
    education: resume.education.map((e) => ({
      school: e.school,
      degree: e.degree,
      field: e.field,
      startDate: e.startDate,
      endDate: e.endDate,
      description: e.description,
    })),
    work: resume.work.map((w) => ({
      company: w.company,
      position: w.position,
      startDate: w.startDate,
      endDate: w.endDate,
      description: w.description,
    })),
    skills: resume.skills.map((s) => ({
      name: s.name,
      level: s.level,
    })),
    projects: resume.projects.map((p) => ({
      name: p.name,
      role: p.role,
      startDate: p.startDate,
      endDate: p.endDate,
      description: p.description,
      url: p.url,
    })),
    custom: Object.fromEntries(
      Object.entries(resume.custom).map(([key, items]) => [
        key,
        items.map((c) => ({
          title: c.title,
          subtitle: c.subtitle,
          date: c.date,
          description: c.description,
        })),
      ]),
    ),
  }
}

/**
 * 提取指定 section 的数据（用于构建 AI prompt 中的 target 指示）
 */
export function extractSectionData(
  resume: Resume,
  sectionType: SectionType,
): unknown {
  switch (sectionType) {
    case 'personal':
      return serializeResumeForAi(resume).personal
    case 'education':
      return serializeResumeForAi(resume).education
    case 'work':
      return serializeResumeForAi(resume).work
    case 'skills':
      return serializeResumeForAi(resume).skills
    case 'projects':
      return serializeResumeForAi(resume).projects
    case 'custom':
      return serializeResumeForAi(resume).custom
  }
}
