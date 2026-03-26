import type { SVGAttributes } from 'react'
import styles from './LatticePattern.module.css'

interface LatticePatternProps extends SVGAttributes<SVGSVGElement> {
  /** 图案重复单元的尺寸（px） */
  size?: number
}

/**
 * 窗棂纹样 — 万字纹（卍）SVG pattern
 * 已裁决选用万字纹，传统辨识度最高
 */
export function LatticePattern({
  size = 24,
  className,
  ...props
}: LatticePatternProps) {
  const patternId = 'mojian-lattice-swastika'

  return (
    <svg
      className={`${styles.root} ${className ?? ''}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <pattern
          id={patternId}
          x="0"
          y="0"
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          {/* 简化万字纹：正交线段组合 */}
          <path
            d={`
              M${size * 0.25} 0 V${size * 0.25} H0
              M${size * 0.75} 0 V${size * 0.25} H${size}
              M0 ${size * 0.75} H${size * 0.25} V${size}
              M${size} ${size * 0.75} H${size * 0.75} V${size}
              M${size * 0.25} ${size * 0.25} H${size * 0.75} V${size * 0.75} H${size * 0.25} Z
            `}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}
