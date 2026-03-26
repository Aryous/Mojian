// Repo 层：简历 CRUD 操作
// 依赖：Types, db.ts

import { db } from './db'
import type { Resume, ResumeCreateInput, ResumeSummary } from '@/types'

function generateId(): string {
  return crypto.randomUUID()
}

function createDefaultResume(input: ResumeCreateInput): Resume {
  const now = Date.now()
  return {
    id: generateId(),
    title: input.title,
    templateId: 'classic',
    createdAt: now,
    updatedAt: now,
    personal: {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      summary: '',
    },
    sections: [
      { id: generateId(), type: 'personal', title: '个人信息', visible: true, sortOrder: 0 },
      { id: generateId(), type: 'education', title: '教育经历', visible: true, sortOrder: 1 },
      { id: generateId(), type: 'work', title: '工作经历', visible: true, sortOrder: 2 },
      { id: generateId(), type: 'skills', title: '技能', visible: true, sortOrder: 3 },
      { id: generateId(), type: 'projects', title: '项目经验', visible: true, sortOrder: 4 },
    ],
    education: [],
    work: [],
    skills: [],
    projects: [],
    custom: {},
  }
}

/** 创建一份新简历 */
export async function createResume(input: ResumeCreateInput): Promise<Resume> {
  const resume = createDefaultResume(input)
  await db.resumes.add(resume)
  return resume
}

/** 获取单份简历 */
export async function getResume(id: string): Promise<Resume | undefined> {
  return db.resumes.get(id)
}

/** 获取简历列表（按更新时间倒序） */
export async function listResumes(): Promise<ResumeSummary[]> {
  const resumes = await db.resumes
    .orderBy('updatedAt')
    .reverse()
    .toArray()

  return resumes.map(({ id, title, templateId, createdAt, updatedAt }) => ({
    id,
    title,
    templateId,
    createdAt,
    updatedAt,
  }))
}

/** 更新简历（局部更新） */
export async function updateResume(
  id: string,
  changes: Partial<Omit<Resume, 'id' | 'createdAt'>>,
): Promise<void> {
  await db.resumes.update(id, {
    ...changes,
    updatedAt: Date.now(),
  })
}

/** 删除简历 */
export async function deleteResume(id: string): Promise<void> {
  await db.resumes.delete(id)
}
