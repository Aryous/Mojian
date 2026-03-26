// 简历编辑器页面（双栏：左编辑 + 右预览）
import { useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useResumeStore } from '@/runtime/store'
import { TEMPLATES } from '@/config'
import { PaperCard, SealButton, InkDivider, CloudEmpty } from '@/ui/components'
import { SectionEditor } from './SectionEditor'
import { ResumePreview } from './ResumePreview'
import { AiPanel } from './AiPanel'
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

  // 收集简历文本内容供 AI 优化使用（所有 hooks 必须在 early return 之前）
  const resumeTextContent = useMemo(() => {
    if (!currentResume) return ''
    const parts: string[] = []
    const { personal, education, work, skills, projects } = currentResume
    if (personal.summary) parts.push(personal.summary)
    for (const edu of education) {
      if (edu.description) parts.push(edu.description)
    }
    for (const w of work) {
      if (w.description) parts.push(w.description)
    }
    for (const s of skills) {
      parts.push(`${s.name} (${s.level})`)
    }
    for (const p of projects) {
      if (p.description) parts.push(p.description)
    }
    return parts.join('\n\n')
  }, [currentResume])

  const handleAiAccept = useCallback(
    (optimized: string) => {
      if (!currentResume) return
      updateCurrentResume({
        personal: { ...currentResume.personal, summary: optimized },
      })
    },
    [currentResume, updateCurrentResume],
  )

  // loading 或 effect 尚未触发（有 id 但 currentResume 还没加载）
  if (loading || (id && !currentResume)) {
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
        <div className={styles.templatePicker}>
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.templateBtn} ${currentResume.templateId === t.id ? styles.templateBtnActive : ''}`}
              onClick={() => handleUpdate({ templateId: t.id })}
              title={t.description}
            >
              {t.name}
            </button>
          ))}
        </div>
      </header>

      <InkDivider />

      <div className={styles.columns}>
        {/* 左栏：编辑器 */}
        <div className={styles.editor}>
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

          {/* AI 优化面板 */}
          <AiPanel content={resumeTextContent} onAccept={handleAiAccept} />
        </div>

        {/* 右栏：预览 */}
        <div className={styles.preview}>
          <ResumePreview resume={currentResume} />
        </div>
      </div>
    </div>
  )
}
