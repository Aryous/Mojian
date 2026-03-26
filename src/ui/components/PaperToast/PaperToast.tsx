// src/ui/components/PaperToast/PaperToast.tsx
// Paper-slip toast notification — flies in from bottom-right
import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import styles from './PaperToast.module.css'

type ToastVariant = 'error' | 'info' | 'success'

interface PaperToastProps {
  /** Message to display */
  message: string | null
  /** Visual variant */
  variant?: ToastVariant
  /** Auto-dismiss duration in ms (0 = no auto-dismiss) */
  duration?: number
  /** Called when toast is dismissed */
  onDismiss: () => void
}

const VARIANT_ICONS: Record<ToastVariant, string> = {
  error: '!',
  info: '?',
  success: '~',
}

export function PaperToast({
  message,
  variant = 'error',
  duration = 6000,
  onDismiss,
}: PaperToastProps) {
  const handleDismiss = useCallback(() => {
    onDismiss()
  }, [onDismiss])

  // Auto-dismiss
  useEffect(() => {
    if (!message || duration <= 0) return
    const timer = setTimeout(handleDismiss, duration)
    return () => clearTimeout(timer)
  }, [message, duration, handleDismiss])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className={`${styles.toast} ${styles[variant]}`}
          role="alert"
          initial={{ opacity: 0, y: 40, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, x: 40, scale: 0.95 }}
          transition={{
            duration: 0.4,
            ease: [0.22, 0.61, 0.36, 1],
          }}
        >
          {/* Torn edge decoration */}
          <div className={styles.tornEdge} aria-hidden="true" />

          <div className={styles.body}>
            <span className={`${styles.icon} ${styles[`icon_${variant}`]}`}>
              {VARIANT_ICONS[variant]}
            </span>
            <p className={styles.message}>{message}</p>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={handleDismiss}
              aria-label="关闭通知"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Auto-dismiss progress bar */}
          {duration > 0 && (
            <motion.div
              className={styles.progress}
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
