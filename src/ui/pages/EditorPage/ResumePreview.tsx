// src/ui/pages/EditorPage/ResumePreview.tsx
// Resume preview panel — SVG from previewStore, crossfade on template switch
import { useEffect, useRef, useState } from 'react'
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
  const { svg, error, compiling, compile } = usePreviewStore()
  const [activeTemplateId, setActiveTemplateId] = useState(resume.templateId)
  const prevTemplateRef = useRef(resume.templateId)

  // Track template switches for animation key
  useEffect(() => {
    if (resume.templateId !== prevTemplateRef.current) {
      prevTemplateRef.current = resume.templateId
    }
  }, [resume.templateId])

  // Update activeTemplateId when new SVG arrives after a template switch
  useEffect(() => {
    if (svg && !compiling) {
      setActiveTemplateId(resume.templateId)
    }
  }, [svg, compiling, resume.templateId])

  // Debounced compile trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      compile(resume)
    }, COMPILE_DELAY)

    return () => clearTimeout(timer)
  }, [resume, compile])

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.label}>预览</span>
        {compiling && <span className={styles.status}>编译中...</span>}
      </div>
      <div className={`${styles.canvas} ${shifted ? styles.canvasShifted : ''}`}>
        {error ? (
          <div className={styles.error}>
            <p>渲染失败</p>
            <pre className={styles.errorDetail}>{error}</pre>
          </div>
        ) : svg ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTemplateId}
              className={styles.svgPreview}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
              // NOTE: This renders Typst-compiled SVG, NOT user/AI-generated content.
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </AnimatePresence>
        ) : (
          <div className={styles.placeholder}>
            {compiling ? '正在编译...' : '编辑简历内容以预览'}
          </div>
        )}
      </div>
    </div>
  )
}
