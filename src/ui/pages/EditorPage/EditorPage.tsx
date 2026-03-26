// 简历编辑器页面（双栏：左编辑 55% + 右预览 45%）
// AI 面板为右侧抽屉（design-spec §5.3）
import { useEffect, useCallback, useMemo, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useResumeStore } from '@/runtime/store'
import { PaperCard, CloudEmpty } from '@/ui/components'
import { TopToolbar } from './TopToolbar'
import { SectionEditor } from './SectionEditor'
import { ResumePreview } from './ResumePreview'
import { AiPanel } from './AiPanel'
import type { Resume } from '@/types'
import styles from './EditorPage.module.css'

export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { currentResume, loading, openResume, updateCurrentResume, closeResume } = useResumeStore()
  const [aiOpen, setAiOpen] = useState(false)

  useEffect(() => {
    if (id) {
      openResume(id)
    }
    return () => {
      closeResume()
    }
  }, [id, openResume, closeResume])

  // Apply template selection from TemplateSelectPage navigation state
  useEffect(() => {
    const state = location.state as { templateId?: string } | null
    if (state?.templateId && currentResume && currentResume.templateId !== state.templateId) {
      updateCurrentResume({ templateId: state.templateId })
      // Clear the navigation state to avoid re-applying on re-renders
      window.history.replaceState({}, '')
    }
  }, [location.state, currentResume, updateCurrentResume])

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

  const handleTemplateChange = useCallback(
    (templateId: string) => {
      handleUpdate({ templateId })
    },
    [handleUpdate],
  )

  const handleToggleAi = useCallback(() => {
    setAiOpen((prev) => !prev)
  }, [])

  // Escape 关闭 AI 抽屉 — design-spec §8.4
  useEffect(() => {
    if (!aiOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAiOpen(false)
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [aiOpen])

  // loading 或 effect 尚未触发（有 id 但 currentResume 还没加载）
  if (loading || (id && !currentResume)) {
    return (
      <div className={styles.loading}>
        <div className={styles.inkLoader}>
          <span className={styles.inkDot} />
        </div>
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
      <TopToolbar
        title={currentResume.title}
        templateId={currentResume.templateId}
        onTemplateChange={handleTemplateChange}
        onToggleAi={handleToggleAi}
        aiOpen={aiOpen}
      />

      <div className={styles.workspace}>
        {/* 左栏：编辑器 (~55%) */}
        <main className={styles.editor} role="region" aria-label="简历编辑区">
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
        </main>

        {/* 右栏：预览 (~45%) */}
        <aside className={styles.preview} role="region" aria-label="简历预览区">
          <ResumePreview resume={currentResume} />
        </aside>

        {/* AI 右侧抽屉 */}
        <AnimatePresence>
          {aiOpen && (
            <motion.aside
              className={styles.aiDrawer}
              role="region"
              aria-label="AI 智能优化"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{
                duration: 0.35,
                ease: [0.22, 0.61, 0.36, 1],
              }}
            >
              <div className={styles.aiDrawerHeader}>
                <h2 className={styles.aiDrawerTitle}>AI 智能优化</h2>
                <button
                  type="button"
                  className={styles.aiDrawerClose}
                  onClick={handleToggleAi}
                  aria-label="关闭 AI 面板"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className={styles.aiDrawerBody}>
                <AiPanel content={resumeTextContent} onAccept={handleAiAccept} />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
