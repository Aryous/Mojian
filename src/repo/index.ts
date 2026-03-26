// Repo 层：数据持久化（Dexie.js / IndexedDB + localStorage）
// 依赖：Config, Types

export { db } from './db'
export {
  createResume,
  getResume,
  listResumes,
  updateResume,
  deleteResume,
} from './resume'
export {
  getApiKey,
  setApiKey,
  clearApiKey,
} from './settings'
