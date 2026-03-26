// src/ui/pages/EditorPage/TemplateDrawer.tsx
// Template drawer — drops down from toolbar like a desk drawer (书案抽屉)
import { useCallback, useEffect } from 'react'
import { TEMPLATES, type TemplateMeta } from '@/config'
import styles from './TemplateDrawer.module.css'

interface TemplateDrawerProps {
  open: boolean
  currentTemplateId: string
  onSelect: (templateId: string) => void
  onClose: () => void
}

export function TemplateDrawer({ open, currentTemplateId, onSelect, onClose }: TemplateDrawerProps) {
  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  const handleSelect = useCallback(
    (t: TemplateMeta) => {
      onSelect(t.id)
      onClose()
    },
    [onSelect, onClose],
  )

  return (
    <>
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-label="选择模板"
      >
        {/* 木框 — 三面厚壁 + 顶部翻边 */}
        <div className={styles.frame}>
          {/* 内凹纸面 */}
          <div className={styles.inner}>
            <div className={styles.header}>
              <h3 className={styles.title}>选帖</h3>
              <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="关闭">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className={styles.list}>
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`${styles.card} ${currentTemplateId === t.id ? styles.cardActive : ''}`}
                  onClick={() => handleSelect(t)}
                >
                  <div className={styles.thumb}>
                    <TemplateThumb templateId={t.id} />
                    {currentTemplateId === t.id && <span className={styles.activeSeal} aria-label="当前选中" />}
                  </div>
                  <span className={styles.cardName}>{t.name}</span>
                </button>
              ))}
            </div>

            {/* 拉手 */}
            <div className={styles.handle} aria-hidden="true">
              <div className={styles.handleBar} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/** CSS wireframe thumbnails for each template */
function TemplateThumb({ templateId }: { templateId: string }) {
  switch (templateId) {
    case 'classic':
      return (
        <>
          <div className={styles.thTitle} />
          <div className={styles.thSub} />
          <div className={styles.thLine} />
          <div className={`${styles.thLine} ${styles.thLine60}`} />
          <div className={styles.thGap} />
          <div className={styles.thHead} />
          <div className={styles.thLine} />
          <div className={`${styles.thLine} ${styles.thLine60}`} />
        </>
      )
    case 'twocolumn':
      return (
        <div className={styles.thTwocol}>
          <div className={styles.thTcLeft}>
            <div className={styles.thTcBold} />
            <div className={styles.thGap} style={{ height: 4 }} />
            <div className={styles.thTcLight} />
            <div className={styles.thTcLight} />
            <div className={styles.thGap} style={{ height: 4 }} />
            <div className={styles.thTcLight} />
            <div className={styles.thTcLight} />
          </div>
          <div className={styles.thTcRight}>
            <div className={styles.thTcBold} />
            <div className={styles.thTcLight} />
            <div className={`${styles.thTcLight} ${styles.thLine80}`} />
            <div className={styles.thGap} style={{ height: 3 }} />
            <div className={styles.thTcBold} style={{ width: '50%' }} />
            <div className={styles.thTcLight} />
          </div>
        </div>
      )
    case 'modern':
      return (
        <div className={styles.thModern}>
          <div className={styles.thModSide}>
            <div className={styles.thModDot} />
            <div className={styles.thModSideLine} />
            <div className={styles.thModSideLine} />
            <div className={styles.thGap} style={{ height: 4 }} />
            <div className={styles.thModSideLine} />
            <div className={styles.thModSideLine} />
          </div>
          <div className={styles.thModBody}>
            <div className={styles.thTitle} style={{ width: '60%' }} />
            <div className={`${styles.thLine} ${styles.thLine80}`} style={{ height: 1.5 }} />
            <div className={styles.thLine} style={{ height: 1.5 }} />
            <div className={styles.thGap} />
            <div className={styles.thHead} style={{ width: '45%' }} />
            <div className={styles.thLine} style={{ height: 1.5 }} />
          </div>
        </div>
      )
    case 'minimal':
      return (
        <div className={styles.thMinimal}>
          <div className={styles.thTitle} style={{ width: '30%' }} />
          <div className={styles.thGap} style={{ height: 6 }} />
          <div className={styles.thLine} style={{ width: '70%', opacity: 0.4 }} />
          <div className={styles.thLine} style={{ width: '55%', opacity: 0.3 }} />
          <div className={styles.thGap} style={{ height: 8 }} />
          <div className={styles.thLine} style={{ width: '40%', height: 2, opacity: 0.4 }} />
          <div className={styles.thLine} style={{ width: '65%', opacity: 0.3 }} />
        </div>
      )
    case 'academic':
      return (
        <div className={styles.thAcademic}>
          <div className={styles.thTitle} style={{ width: '50%', alignSelf: 'center' }} />
          <div className={styles.thSub} style={{ width: '65%', alignSelf: 'center' }} />
          <div className={styles.thSep} />
          <div className={styles.thLine} style={{ height: 1.5 }} />
          <div className={styles.thLine} style={{ height: 1.5, width: '75%' }} />
          <div className={styles.thGap} />
          <div className={styles.thHead} style={{ width: '40%' }} />
          <div className={styles.thSep} />
          <div className={styles.thLine} style={{ height: 1.5 }} />
        </div>
      )
    default:
      return null
  }
}
