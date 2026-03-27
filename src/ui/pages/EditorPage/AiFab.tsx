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
      aria-label="墨灵"
    >
      {/* 毛笔图标：笔杆 + 铁箍 + 渐细笔毫 */}
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="19.5" cy="3" r="1.5" fill="currentColor" />
        <path d="M18.5 4.5 L12.5 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 10.5 L11 11.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M11 12 C9.5 14.5 7.5 17.5 5 21 C7.5 19 10.5 16 13 13 Z" fill="currentColor" />
      </svg>
      <span className={styles.tooltip}>墨灵</span>
    </button>
  )
}
