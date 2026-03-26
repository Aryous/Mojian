import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import styles from './PaperCard.module.css'

type PaperCardVariant = 'default' | 'flat' | 'aged'

interface PaperCardProps {
  variant?: PaperCardVariant
  children: ReactNode
  className?: string
}

export function PaperCard({
  variant = 'default',
  children,
  className,
}: PaperCardProps) {
  return (
    <motion.div
      className={`${styles.root} ${styles[variant]} ${className ?? ''}`}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
