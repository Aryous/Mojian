// Dashboard 工作台：简历卡片网格 + 腰封信息层
import { useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { TEMPLATES } from '@/config/templates'
import { useResumeStore } from '@/runtime/store'
import type { ResumeProgress } from '@/service/resume/progress'
import type { ResumeSummary } from '@/types'
import styles from './DashboardPage.module.css'

/** Read cached SVG preview from localStorage */
function getCachedSvg(resumeId: string): string | null {
  try {
    return localStorage.getItem(`mojian:preview:${resumeId}`)
  } catch {
    return null
  }
}

/** Read cached progress from localStorage */
function getCachedProgress(resumeId: string): ResumeProgress | null {
  try {
    const raw = localStorage.getItem(`mojian:progress:${resumeId}`)
    if (!raw) return null
    return JSON.parse(raw) as ResumeProgress
  } catch {
    return null
  }
}

/** Get template display name by id */
function getTemplateName(templateId: string): string {
  return TEMPLATES.find((t) => t.id === templateId)?.name ?? templateId
}

/** Format date for display */
function formatDate(ts: number): string {
  const now = new Date()
  const date = new Date(ts)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'

  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }) + '日'
}

/** Get progress bar color class based on fill ratio */
function getProgressColor(filled: number, total: number): string {
  const ratio = filled / total
  if (ratio >= 1) return styles.progressDone ?? ''
  if (ratio > 0.4) return styles.progressMid ?? ''
  return styles.progressLow ?? ''
}

/** Single resume card with obi */
function ResumeCard({
  resume,
  index,
  onClick,
  onDelete,
}: {
  resume: ResumeSummary
  index: number
  onClick: () => void
  onDelete: () => void
}) {
  const cachedSvg = useMemo(() => getCachedSvg(resume.id), [resume.id])
  const progress = useMemo(() => getCachedProgress(resume.id), [resume.id])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 0.61, 0.36, 1],
        delay: index * 0.05,
      }}
      layout
    >
      <div
        className={styles.card}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-label={`编辑简历：${resume.title}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick()
          }
        }}
      >
        {/* Preview area */}
        {cachedSvg ? (
          <div
            className={styles.cardPreview}
            dangerouslySetInnerHTML={{ __html: cachedSvg }}
          />
        ) : (
          <div className={styles.cardFallback}>
            <svg viewBox="0 0 24 32" width="48" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="22" height="30" rx="1" stroke="currentColor" strokeWidth="0.8" />
              <line x1="4" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
              <line x1="4" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
              <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
              <line x1="4" y1="15" x2="18" y2="15" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
            </svg>
          </div>
        )}

        {/* Delete button */}
        <button
          type="button"
          className={styles.cardDelete}
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          aria-label={`删除 ${resume.title}`}
        >
          ×
        </button>

        {/* Obi (book band) */}
        <div className={styles.obi}>
          <div className={styles.obiTitle}>{resume.title}</div>
          <div className={styles.obiMeta}>
            <span>{getTemplateName(resume.templateId)}</span>
            {progress && (
              <>
                <span className={styles.obiDot} />
                <span>{progress.filled}/{progress.total} 已填写</span>
              </>
            )}
            <span className={styles.obiDot} />
            <span>{formatDate(resume.updatedAt)}</span>
          </div>
          {progress && (
            <div className={styles.obiProgress}>
              <div
                className={`${styles.obiProgressFill} ${getProgressColor(progress.filled, progress.total)}`}
                style={{ width: `${(progress.filled / progress.total) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { resumes, loading, loadResumes, deleteResume } = useResumeStore()

  useEffect(() => {
    loadResumes()
  }, [loadResumes])

  const handleCreate = useCallback(() => {
    navigate('/new')
  }, [navigate])

  const handleOpen = useCallback(
    (id: string) => {
      navigate(`/editor/${id}`)
    },
    [navigate],
  )

  const handleDelete = useCallback(
    (id: string) => {
      deleteResume(id)
    },
    [deleteResume],
  )

  // Sort by updatedAt descending
  const sortedResumes = useMemo(
    () => [...resumes].sort((a, b) => b.updatedAt - a.updatedAt),
    [resumes],
  )

  return (
    <div className={styles.root}>
      <div className={styles.topbar}>
        <h1 className={styles.title}>我的简历</h1>
        {!loading && resumes.length > 0 && (
          <span className={styles.count}>{resumes.length} 份</span>
        )}
      </div>

      <div className={styles.grid}>
        {/* New card — always first */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div
            className={styles.cardNew}
            onClick={handleCreate}
            role="button"
            tabIndex={0}
            aria-label="新建简历"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleCreate()
              }
            }}
          >
            <div className={styles.cardNewIcon}>+</div>
            <span className={styles.cardNewLabel}>新建简历</span>
          </div>
        </motion.div>

        {loading ? (
          <div className={styles.loading}>
            <span>载入中...</span>
          </div>
        ) : sortedResumes.length === 0 ? (
          <div className={styles.emptyHint}>
            案头空空，不如落笔。
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {sortedResumes.map((resume, i) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                index={i}
                onClick={() => handleOpen(resume.id)}
                onDelete={() => handleDelete(resume.id)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
