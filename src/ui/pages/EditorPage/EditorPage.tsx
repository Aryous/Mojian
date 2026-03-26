// 简历编辑器页面
import { useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useResumeStore } from '@/runtime/store'
import { PaperCard, SealButton, InkDivider, CloudEmpty } from '@/ui/components'
import { SectionEditor } from './SectionEditor'
import type { Resume } from '@/types'
import styles from './EditorPage.module.css'

export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentResume, loading, openResume, updateCurrentResume, closeResume } = useResumeStore()

  useEffect(() => {
    if (id) {
      openResume(id)
    }
    return () => {
      closeResume()
    }
  }, [id, openResume, closeResume])

  const handleUpdate = useCallback(
    (changes: Partial<Resume>) => {
      updateCurrentResume(changes)
    },
    [updateCurrentResume],
  )

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>加载中…</p>
      </div>
    )
  }

  if (!currentResume) {
    return (
      <div className={styles.empty}>
        <CloudEmpty
          message="未找到该简历"
          action={{ label: '返回首页', onClick: () => navigate('/') }}
        />
      </div>
    )
  }

  const visibleSections = currentResume.sections
    .filter((s) => s.visible)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <SealButton variant="ghost" onClick={() => navigate('/')}>
          ← 返回
        </SealButton>
        <h1 className={styles.title}>{currentResume.title}</h1>
      </header>

      <InkDivider />

      <div className={styles.content}>
        <AnimatePresence mode="popLayout">
          {visibleSections.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <PaperCard>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
                <SectionEditor
                  type={section.type}
                  resume={currentResume}
                  onUpdate={handleUpdate}
                />
              </PaperCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
