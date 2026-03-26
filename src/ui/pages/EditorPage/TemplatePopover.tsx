// src/ui/pages/EditorPage/TemplatePopover.tsx
// Template selection popover with thumbnail cards
import { useCallback } from 'react'
import { TEMPLATES, type TemplateMeta } from '@/config'
import styles from './TemplatePopover.module.css'

interface TemplatePopoverProps {
  open: boolean
  currentTemplateId: string
  onSelect: (templateId: string) => void
  onClose: () => void
}

export function TemplatePopover({ open, currentTemplateId, onSelect, onClose }: TemplatePopoverProps) {
  const handleSelect = useCallback((t: TemplateMeta) => {
    onSelect(t.id)
    onClose()
  }, [onSelect, onClose])

  return (
    <>
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`${styles.popover} ${open ? styles.popoverOpen : ''}`}
        role="dialog"
        aria-label="选择模板"
      >
        <div className={styles.title}>选择模板</div>
        <div className={styles.grid}>
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.card} ${currentTemplateId === t.id ? styles.cardActive : ''}`}
              onClick={() => handleSelect(t)}
              title={t.description}
            >
              <div className={`${styles.thumb} ${styles[`thumb_${t.id}`] ?? ''}`}>
                <TemplateThumb templateId={t.id} />
              </div>
              <span className={styles.name}>{t.name}</span>
            </button>
          ))}
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
