// Repo 层：Dexie 数据库定义
// 依赖：Types

import Dexie, { type Table } from 'dexie'
import type { Resume } from '@/types'

export class MojianDB extends Dexie {
  resumes!: Table<Resume, string>

  constructor() {
    super('mojian')

    this.version(1).stores({
      // 索引字段：id 为主键，updatedAt 和 createdAt 用于排序
      resumes: 'id, updatedAt, createdAt',
    })
  }
}

export const db = new MojianDB()
