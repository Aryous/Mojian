import { type ReactNode, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import styles from './InkTooltip.module.css'

interface InkTooltipProps {
  content: string
  children: ReactNode
}

export function InkTooltip({ content, children }: InkTooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <span
      className={styles.root}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.span
            className={styles.tooltip}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.22, 0.61, 0.36, 1] }}
          >
            {content}
            <span className={styles.arrow} />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
