// src/ui/pages/EditorPage/TopToolbar.tsx
// Slim toolbar: back + brand + editable title | template trigger + export PDF
import { useCallback, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { usePreviewStore } from '@/runtime/store'
import { SealButton } from '@/ui/components'
import type { Resume } from '@/types'
import styles from './TopToolbar.module.css'

interface TopToolbarProps {
  title: string
  templateName: string
  resume: Resume
  onTitleChange: (title: string) => void
  onOpenTemplateDrawer: () => void
}

export function TopToolbar({
  title,
  templateName,
  resume,
  onTitleChange,
  onOpenTemplateDrawer,
}: TopToolbarProps) {
  const navigate = useNavigate()
  const { exporting, compiling, exportPdf } = usePreviewStore()
  const [localTitle, setLocalTitle] = useState(title)

  const handleBack = useCallback(() => {
    navigate('/dashboard')
  }, [navigate])

  const handleTitleBlur = useCallback(() => {
    const trimmed = localTitle.trim()
    if (trimmed && trimmed !== title) {
      onTitleChange(trimmed)
    } else {
      setLocalTitle(title)
    }
  }, [localTitle, title, onTitleChange])

  const handleTitleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }, [])

  const handleExport = useCallback(() => {
    exportPdf(resume)
  }, [exportPdf, resume])

  return (
    <header className={styles.root}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={handleBack}
          aria-label="返回工作台"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className={styles.brand}>墨简</span>
        <span className={styles.separator}>|</span>
        <input
          className={styles.titleInput}
          value={localTitle}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setLocalTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          onFocus={(e) => e.target.select()}
          aria-label="简历标题"
        />
      </div>
      <div className={styles.right}>
        <button
          type="button"
          className={styles.templateTrigger}
          onClick={onOpenTemplateDrawer}
          aria-label={`当前模板：${templateName}，点击切换`}
        >
          <span className={styles.triggerSpine} aria-hidden="true" />
          <span className={styles.triggerCover}>
            <span className={styles.triggerName}>{templateName}</span>
          </span>
        </button>
        <SealButton
          size="sm"
          onClick={handleExport}
          disabled={exporting || compiling}
        >
          {exporting ? '导出中...' : '导出 PDF'}
        </SealButton>
      </div>
    </header>
  )
}
