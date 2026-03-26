// src/ui/pages/EditorPage/AiFab.tsx
// Floating action button for AI — obi indigo gradient
import styles from './AiFab.module.css'

interface AiFabProps {
  visible: boolean
  onClick: () => void
}

export function AiFab({ visible, onClick }: AiFabProps) {
  return (
    <button
      type="button"
      className={`${styles.fab} ${visible ? '' : styles.fabHidden}`}
      onClick={onClick}
      aria-label="AI 智能优化"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.58 4.58l2.12 2.12M17.3 17.3l2.12 2.12M4.58 19.42l2.12-2.12M17.3 6.7l2.12-2.12"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
      <span className={styles.tooltip}>AI 智能优化</span>
    </button>
  )
}
