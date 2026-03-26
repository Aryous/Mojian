import styles from './InkWash.module.css'

interface InkWashProps {
  /** Visual variant */
  variant?: 'hero' | 'divider'
  className?: string
}

/**
 * InkWash -- Decorative ink wash/splash element
 *
 * Pure CSS animated ink effect used as visual punctuation.
 * Uses radial gradients and opacity layers to simulate
 * ink diffusing through wet paper.
 */
export function InkWash({ variant = 'hero', className }: InkWashProps) {
  return (
    <div
      className={`${styles.root} ${styles[variant]} ${className ?? ''}`}
      aria-hidden="true"
    />
  )
}
