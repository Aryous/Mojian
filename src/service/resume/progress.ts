// Service 层：简历填充进度计算
// 依赖：Types

import type { Resume } from '@/types'

export interface ResumeProgress {
  filled: number
  total: number
}

export function getResumeProgress(resume: Resume): ResumeProgress {
  const total = 5
  let filled = 0

  if (resume.personal.name.trim() !== '') filled++
  if (resume.education.length > 0) filled++
  if (resume.work.length > 0) filled++
  if (resume.skills.length > 0) filled++
  if (resume.projects.length > 0) filled++

  return { filled, total }
}
