import type { ReactNode } from 'react'
import { SealButton } from '../SealButton'
import styles from './CloudEmpty.module.css'

interface CloudEmptyProps {
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  children?: ReactNode
}

export function CloudEmpty({ message, action, children }: CloudEmptyProps) {
  return (
    <div className={styles.root}>
      {/* 简化祥云 SVG */}
      <svg
        className={styles.cloud}
        viewBox="0 0 120 60"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M20 45 Q10 45 10 35 Q10 25 20 25 Q20 15 35 15 Q45 5 60 15 Q70 5 80 15 Q95 10 100 25 Q110 25 110 35 Q110 45 100 45 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* 第二层祥云 — 更浅 */}
        <path
          d="M35 50 Q28 50 28 43 Q28 37 38 37 Q42 32 55 37 Q60 33 68 37 Q78 35 80 43 Q85 43 85 48 Q85 50 80 50 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>
      <p className={styles.message}>{message}</p>
      {action && (
        <SealButton variant="secondary" onClick={action.onClick}>
          {action.label}
        </SealButton>
      )}
      {children}
    </div>
  )
}
