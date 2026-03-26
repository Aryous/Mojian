import type { HTMLAttributes, ReactNode } from 'react'
import styles from './InkTag.module.css'

interface InkTagProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
}

export function InkTag({ children, className, ...props }: InkTagProps) {
  return (
    <span className={`${styles.root} ${className ?? ''}`} {...props}>
      {children}
    </span>
  )
}
