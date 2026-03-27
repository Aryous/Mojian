// src/ui/pages/EditorPage/ResumePreview.tsx
// Resume preview panel — per-page SVG from previewStore, pagination nav
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { Resume } from '@/types'
import { usePreviewStore } from '@/runtime/store'
import styles from './ResumePreview.module.css'

interface ResumePreviewProps {
  resume: Resume
  /** Whether the AI drawer is open — shifts canvas left */
  shifted: boolean
}

/** Debounce compile delay (ms) */
const COMPILE_DELAY = 600

export function ResumePreview({ resume, shifted }: ResumePreviewProps) {
  const { svgs, currentPage, pageCount, error, compiling, compile, setCurrentPage } =
    usePreviewStore()
  const [activeTemplateId, setActiveTemplateId] = useState(resume.templateId)
  const prevTemplateRef = useRef(resume.templateId)

  const currentSvg = svgs[currentPage] ?? null

  // Track template switches for animation key
  useEffect(() => {
    if (resume.templateId !== prevTemplateRef.current) {
      prevTemplateRef.current = resume.templateId
    }
  }, [resume.templateId])

  // Update activeTemplateId when new SVG arrives after a template switch
  useEffect(() => {
    if (svgs.length > 0 && !compiling) {
      setActiveTemplateId(resume.templateId)
    }
  }, [svgs, compiling, resume.templateId])

  // Debounced compile trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      compile(resume)
    }, COMPILE_DELAY)

    return () => clearTimeout(timer)
  }, [resume, compile])

  // Keyboard navigation (← →) when multi-page
  const handlePrev = useCallback(() => setCurrentPage(currentPage - 1), [currentPage, setCurrentPage])
  const handleNext = useCallback(() => setCurrentPage(currentPage + 1), [currentPage, setCurrentPage])

  useEffect(() => {
    if (pageCount <= 1) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev()
      else if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pageCount, handlePrev, handleNext])

  return (
    <div className={styles.root}>
      <div className={`${styles.canvas} ${shifted ? styles.canvasShifted : ''}`}>
        {compiling && <span className={styles.compilingBadge}>编译中...</span>}
        {error ? (
          <div className={styles.error}>
            <p>渲染失败</p>
            <pre className={styles.errorDetail}>{error}</pre>
          </div>
        ) : currentSvg ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTemplateId}-${currentPage}`}
              className={styles.svgPreview}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
              // NOTE: This renders Typst-compiled SVG, NOT user/AI-generated content.
              dangerouslySetInnerHTML={{ __html: currentSvg }}
            />
          </AnimatePresence>
        ) : (
          <div className={styles.placeholder}>
            {compiling ? '正在编译...' : '编辑简历内容以预览'}
          </div>
        )}
      </div>

      {pageCount > 1 && (
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={handlePrev}
            disabled={currentPage === 0}
            aria-label="上一页"
          >
            ‹
          </button>
          <span className={styles.pageIndicator}>
            第 {currentPage + 1} 页 / 共 {pageCount} 页
          </span>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={handleNext}
            disabled={currentPage === pageCount - 1}
            aria-label="下一页"
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}
