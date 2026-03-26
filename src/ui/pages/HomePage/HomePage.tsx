// 首页：简历列表
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useResumeStore } from '@/runtime/store'
import {
  PaperCard,
  SealButton,
  InkDivider,
  CloudEmpty,
  InkTag,
} from '@/ui/components'
import styles from './HomePage.module.css'

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function HomePage() {
  const navigate = useNavigate()
  const { resumes, loading, loadResumes, createResume, deleteResume } = useResumeStore()
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadResumes()
  }, [loadResumes])

  const handleCreate = useCallback(async () => {
    setCreating(true)
    const resume = await createResume({ title: '未命名简历' })
    navigate(`/editor/${resume.id}`)
  }, [createResume, navigate])

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>墨简</h1>
          <p className={styles.subtitle}>AI 驱动的中古风简历编辑器</p>
        </div>
        <SealButton onClick={handleCreate} disabled={creating}>
          {creating ? '创建中…' : '新建简历'}
        </SealButton>
      </header>

      <InkDivider />

      <div className={styles.list}>
        {loading ? (
          <div className={styles.loading}>加载中…</div>
        ) : resumes.length === 0 ? (
          <CloudEmpty
            message="还没有简历，点击上方按钮创建第一份"
          />
        ) : (
          <AnimatePresence mode="popLayout">
            {resumes.map((resume) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
                layout
              >
                <PaperCard className={styles.card}>
                  <div
                    className={styles.cardContent}
                    onClick={() => navigate(`/editor/${resume.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') navigate(`/editor/${resume.id}`)
                    }}
                  >
                    <div className={styles.cardInfo}>
                      <h2 className={styles.cardTitle}>{resume.title}</h2>
                      <div className={styles.cardMeta}>
                        <InkTag>{resume.templateId}</InkTag>
                        <span className={styles.date}>
                          更新于 {formatDate(resume.updatedAt)}
                        </span>
                      </div>
                    </div>
                    {/* stopPropagation 阻止点击冒泡到外层卡片导航 */}
                    <div
                      className={styles.cardActions}
                      onClick={(e) => e.stopPropagation()}
                      role="presentation"
                    >
                      <SealButton
                        variant="ghost"
                        onClick={() => deleteResume(resume.id)}
                      >
                        删除
                      </SealButton>
                    </div>
                  </div>
                </PaperCard>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
