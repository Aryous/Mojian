import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import styles from './SealButton.module.css'

type SealButtonVariant = 'primary' | 'secondary' | 'ghost'

interface SealButtonProps {
  variant?: SealButtonVariant
  children: ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export function SealButton({
  variant = 'primary',
  children,
  className,
  disabled,
  onClick,
  type = 'button',
}: SealButtonProps) {
  return (
    <motion.button
      className={`${styles.root} ${styles[variant]} ${className ?? ''}`}
      disabled={disabled}
      type={type}
      onClick={onClick}
      whileHover={
        disabled
          ? undefined
          : {
              scale: [1, 1.06, 0.98],
              rotate: [null, -2, 0],
              transition: {
                duration: 0.35,
                ease: [0.22, 0.61, 0.36, 1],
                times: [0, 0.4, 1],
              },
            }
      }
      whileTap={disabled ? undefined : { scale: 0.94 }}
      transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.15 }}
    >
      {children}
    </motion.button>
  )
}
