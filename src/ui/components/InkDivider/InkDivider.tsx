import type { HTMLAttributes } from 'react'
import styles from './InkDivider.module.css'

type InkDividerVariant = 'default' | 'thin' | 'ornamental'

interface InkDividerProps extends HTMLAttributes<HTMLDivElement> {
  variant?: InkDividerVariant
}

export function InkDivider({
  variant = 'default',
  className,
  ...props
}: InkDividerProps) {
  return (
    <div
      className={`${styles.root} ${className ?? ''}`}
      aria-hidden="true"
      {...props}
    >
      <svg
        className={`${styles.line} ${styles[variant]}`}
        viewBox="0 0 800 4"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {variant === 'ornamental' ? (
          <>
            <path
              d="M0 2 C200 1.2, 300 2.8, 370 2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            {/* 小祥云装饰 — 呼应 CloudEmpty 的云纹语汇 */}
            <g transform="translate(388, -1)" opacity="0.5">
              <path
                d="M0 5 Q0 2 3 2 Q4 0 7 0 Q10 0 11 2 Q14 1 15 3 Q17 3 17 5 Q17 7 14 7 L3 7 Q0 7 0 5 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeLinecap="round"
              />
            </g>
            <path
              d="M418 2 C500 1.2, 600 2.8, 800 2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </>
        ) : (
          <path
            d="M0 2 C100 1.2, 200 2.8, 300 1.6 C400 2.4, 500 1.4, 600 2.2 C700 1.8, 750 2.6, 800 2"
            fill="none"
            stroke="currentColor"
            strokeWidth={variant === 'thin' ? '0.5' : '1.2'}
          />
        )}
      </svg>
    </div>
  )
}
