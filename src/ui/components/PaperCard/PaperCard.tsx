import type { HTMLAttributes, ReactNode } from 'react'
import styles from './PaperCard.module.css'

type PaperCardVariant = 'default' | 'flat' | 'aged'

interface PaperCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: PaperCardVariant
  /** Enable 3D paper-lift effect on hover */
  liftable?: boolean
  children: ReactNode
}

/**
 * 宣纸卡片 — 内容承载容器
 *
 * 进入动画由父级 motion.div 控制（避免双重动画）。
 * PaperCard 本身只负责视觉样式和纹理。
 *
 * `liftable` adds a subtle 3D perspective rotation on hover,
 * as if the paper is curling up from a desk.
 */
export function PaperCard({
  variant = 'default',
  liftable = false,
  children,
  className,
  ...props
}: PaperCardProps) {
  const classNames = [
    styles.root,
    styles[variant],
    liftable ? styles.liftable : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  )
}
