// 顶部工具栏 — 窗棂风格全局导航
// design-spec §5.4: TopToolbar
import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { TEMPLATES, type TemplateMeta } from '@/config'
import { SealButton, LatticePattern } from '@/ui/components'
import styles from './TopToolbar.module.css'

interface TopToolbarProps {
  title: string
  templateId: string
  onTemplateChange: (templateId: string) => void
  onToggleAi: () => void
  aiOpen: boolean
}

export function TopToolbar({
  title,
  templateId,
  onTemplateChange,
  onToggleAi,
  aiOpen,
}: TopToolbarProps) {
  const navigate = useNavigate()

  const handleBack = useCallback(() => {
    navigate('/')
  }, [navigate])

  return (
    <header className={styles.root}>
      <div className={styles.content}>
        {/* 左侧：品牌 + 返回 */}
        <div className={styles.left}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={handleBack}
            aria-label="返回首页"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className={styles.brand}>墨简</span>
          <span className={styles.separator}>|</span>
          <span className={styles.docTitle}>{title}</span>
        </div>

        {/* 中间：模板切换 + AI 入口 */}
        <div className={styles.center}>
          {TEMPLATES.map((t: TemplateMeta) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.templateBtn} ${templateId === t.id ? styles.templateBtnActive : ''}`}
              onClick={() => onTemplateChange(t.id)}
              title={t.description}
            >
              {t.name}
            </button>
          ))}
          <button
            type="button"
            className={`${styles.aiBtn} ${aiOpen ? styles.aiBtnActive : ''}`}
            onClick={onToggleAi}
            aria-label="AI 智能优化"
            aria-expanded={aiOpen}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.2" />
              <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
            <span>AI 优化</span>
          </button>
        </div>

        {/* 右侧：导出 */}
        <div className={styles.right}>
          <SealButton>导出</SealButton>
        </div>
      </div>

      {/* 底部窗棂纹装饰线 */}
      <div className={styles.lattice}>
        <LatticePattern size={16} />
      </div>
    </header>
  )
}
