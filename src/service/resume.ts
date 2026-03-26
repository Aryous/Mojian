// Service 层：简历业务服务
// 依赖：Types, Repo
// 作为 Runtime 层和 Repo 层之间的桥梁

import type { Resume, ResumeCreateInput, ResumeSummary } from '@/types'
import * as resumeRepo from '@/repo/resume'

export async function createResume(input: ResumeCreateInput): Promise<Resume> {
  return resumeRepo.createResume(input)
}

export async function getResume(id: string): Promise<Resume | undefined> {
  return resumeRepo.getResume(id)
}

export async function listResumes(): Promise<ResumeSummary[]> {
  return resumeRepo.listResumes()
}

export async function updateResume(
  id: string,
  changes: Partial<Omit<Resume, 'id' | 'createdAt'>>,
): Promise<void> {
  return resumeRepo.updateResume(id, changes)
}

export async function deleteResume(id: string): Promise<void> {
  return resumeRepo.deleteResume(id)
}
