// src/ui/pages/EditorPage/EditorPage.tsx
// Resume editor page — 42/58 split, AI drawer, template popover
import { useEffect, useCallback, useMemo, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router'
import { Reorder, useDragControls } from 'motion/react'
import { useResumeStore, useAiStore } from '@/runtime/store'
import { TEMPLATES } from '@/config'
import { CloudEmpty, PaperToast } from '@/ui/components'
import { TopToolbar } from './TopToolbar'
import { TemplatePopover } from './TemplatePopover'
import { SectionEditor } from './SectionEditor'
import { ResumePreview } from './ResumePreview'
import { AiDrawer } from './AiDrawer'
import { AiFab } from './AiFab'
import type { Resume, ResumeSection } from '@/types'
import styles from './EditorPage.module.css'

// ─── Draggable section card (needs its own component for useDragControls hook) ───
function DraggableSectionCard({
  section,
  resume,
  onUpdate,
  onAi,
}: {
  section: ResumeSection
  resume: Resume
  onUpdate: (changes: Partial<Resume>) => void
  onAi: (title: string) => void
}) {
  const controls = useDragControls()

  return (
    <Reorder.Item
      value={section}
      as="div"
      dragListener={false}
      dragControls={controls}
      whileDrag={{ scale: 1.015, boxShadow: '0 4px 16px rgba(28,18,8,0.14)' }}
      style={{ position: 'relative' }}
    >
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div
            className={styles.dragHandle}
            onPointerDown={(e) => controls.start(e)}
          >
            <svg width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden="true">
              <circle cx="3" cy="2" r="1.2" fill="currentColor" />
              <circle cx="7" cy="2" r="1.2" fill="currentColor" />
              <circle cx="3" cy="7" r="1.2" fill="currentColor" />
              <circle cx="7" cy="7" r="1.2" fill="currentColor" />
              <circle cx="3" cy="12" r="1.2" fill="currentColor" />
              <circle cx="7" cy="12" r="1.2" fill="currentColor" />
            </svg>
          </div>
          <h2 className={styles.sectionTitle}>{section.title}</h2>
          {section.type !== 'skills' && (
            <button
              type="button"
              className={styles.sectionAiBtn}
              onClick={() => onAi(section.title)}
              aria-label={`AI 润色${section.title}`}
            >
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.2" />
                <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
              AI 润色
            </button>
          )}
        </div>
        <SectionEditor
          type={section.type}
          resume={resume}
          onUpdate={onUpdate}
        />
      </div>
    </Reorder.Item>
  )
}

export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { currentResume, loading, openResume, updateCurrentResume, closeResume } = useResumeStore()
  const { error: aiError, clearResult: clearAiError } = useAiStore()
  const [aiOpen, setAiOpen] = useState(false)
  const [tplOpen, setTplOpen] = useState(false)

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
      window.history.replaceState({}, '')
    }
  }, [location.state, currentResume, updateCurrentResume])

  const handleUpdate = useCallback(
    (changes: Partial<Resume>) => {
      updateCurrentResume(changes)
    },
    [updateCurrentResume],
  )

  const handleTitleChange = useCallback(
    (title: string) => {
      updateCurrentResume({ title })
    },
    [updateCurrentResume],
  )

  const handleTemplateChange = useCallback(
    (templateId: string) => {
      handleUpdate({ templateId })
    },
    [handleUpdate],
  )

  // Collect resume text content for AI optimization
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

  const handleToggleAi = useCallback(() => {
    setAiOpen((prev) => !prev)
  }, [])

  const handleCloseAi = useCallback(() => {
    setAiOpen(false)
  }, [])

  // Escape closes AI drawer
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

  // Resolve current template name
  const currentTemplateName = useMemo(() => {
    if (!currentResume) return ''
    return TEMPLATES.find((t) => t.id === currentResume.templateId)?.name ?? currentResume.templateId
  }, [currentResume])

  // Section AI button handler
  const handleSectionAi = useCallback(
    (_sectionTitle: string) => { // eslint-disable-line @typescript-eslint/no-unused-vars
      setAiOpen(true)
    },
    [],
  )

  // Visible sections — memoized for Reorder stability
  const visibleSections = useMemo(
    () =>
      currentResume
        ? currentResume.sections.filter((s) => s.visible).sort((a, b) => a.sortOrder - b.sortOrder)
        : [],
    [currentResume],
  )

  // Drag-reorder sections
  const handleSectionReorder = useCallback(
    (reordered: ResumeSection[]) => {
      if (!currentResume) return
      const updatedSections = currentResume.sections.map((s) => {
        const newIndex = reordered.findIndex((r) => r.id === s.id)
        return newIndex >= 0 ? { ...s, sortOrder: newIndex } : s
      })
      updateCurrentResume({ sections: updatedSections })
    },
    [currentResume, updateCurrentResume],
  )

  // Loading state
  if (loading || (id && !currentResume)) {
    return (
      <div className={styles.loading}>
        <div className={styles.inkLoader}>
          <span className={styles.inkDot} />
        </div>
        <p>加载中...</p>
      </div>
    )
  }

  if (!currentResume) {
    return (
      <div className={styles.empty}>
        <CloudEmpty
          message="未找到该简历"
          action={{ label: '返回工作台', onClick: () => navigate('/dashboard') }}
        />
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <TopToolbar
        title={currentResume.title}
        templateId={currentResume.templateId}
        templateName={currentTemplateName}
        resume={currentResume}
        onTitleChange={handleTitleChange}
        onOpenTemplatePopover={() => setTplOpen(true)}
      />

      <TemplatePopover
        open={tplOpen}
        currentTemplateId={currentResume.templateId}
        onSelect={handleTemplateChange}
        onClose={() => setTplOpen(false)}
      />

      <div className={styles.workspace}>
        {/* Left: Editor (42%) */}
        <main className={styles.editor} role="region" aria-label="简历编辑区">
          <Reorder.Group
            axis="y"
            values={visibleSections}
            onReorder={handleSectionReorder}
            as="div"
          >
            {visibleSections.map((section) => (
              <DraggableSectionCard
                key={section.id}
                section={section}
                resume={currentResume}
                onUpdate={handleUpdate}
                onAi={handleSectionAi}
              />
            ))}
          </Reorder.Group>
        </main>

        {/* Right: Preview (58%) */}
        <aside className={styles.preview} role="region" aria-label="简历预览区">
          <ResumePreview resume={currentResume} shifted={aiOpen} />
          <AiFab visible={!aiOpen} onClick={handleToggleAi} />
          <AiDrawer
            open={aiOpen}
            onClose={handleCloseAi}
            content={resumeTextContent}
            onAccept={handleAiAccept}
          />
        </aside>
      </div>

      <PaperToast
        message={aiError}
        variant="error"
        onDismiss={clearAiError}
      />
    </div>
  )
}
