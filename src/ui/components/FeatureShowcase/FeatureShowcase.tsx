import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import styles from './FeatureShowcase.module.css'

interface Feature {
  icon: ReactNode
  title: string
  description: string
  /** Accent color token override for the left border */
  accentColor?: string
}

interface FeatureShowcaseProps {
  features: Feature[]
}

/**
 * FeatureShowcase -- Editorial feature list with numbered accents
 *
 * NOT a card grid. Each feature is a horizontal row with:
 * - Large background ordinal number (壹、贰、叁) -- dramatic watermark
 * - Colored left accent border (vermillion, gold, glaze -- rotating)
 * - Icon with ink-splash hover effect
 * - Scroll-triggered ink-reveal entrance
 *
 * Layout is left-aligned, asymmetric, with generous vertical rhythm.
 */

const ORDINALS = ['壹', '贰', '叁', '肆', '伍', '陆']

const ACCENT_COLORS = [
  'var(--sem-action-primary)',   // vermillion
  'var(--sem-status-warning)',   // gold
  'var(--sem-action-ai)',        // glaze
]

export function FeatureShowcase({ features }: FeatureShowcaseProps) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.22,
        delayChildren: 0.1,
      },
    },
  }

  /* Ink-reveal entrance: items slide in with a widening accent bar */
  const itemVariants = {
    hidden: { opacity: 0, x: -24 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 0.61, 0.36, 1],
      },
    },
  }

  return (
    <section className={styles.root} aria-label="Features">
      <motion.div
        className={styles.list}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        {features.map((feature, i) => (
          <motion.article
            key={i}
            className={styles.item}
            variants={itemVariants}
            style={{
              '--accent-color': feature.accentColor ?? ACCENT_COLORS[i % ACCENT_COLORS.length],
            } as React.CSSProperties}
          >
            {/* Background ordinal number -- dramatic watermark */}
            <span className={styles.ordinal} aria-hidden="true">
              {ORDINALS[i] ?? String(i + 1)}
            </span>

            {/* Ink accent bar that widens on scroll reveal */}
            <div className={styles.accentBar} aria-hidden="true" />

            <div className={styles.iconCol}>
              {feature.icon}
              {/* Ink splash dots -- visible on hover */}
              <div className={styles.inkSplash} aria-hidden="true">
                <span className={styles.splashDot} />
                <span className={styles.splashDot} />
                <span className={styles.splashDot} />
              </div>
            </div>

            <div className={styles.textCol}>
              <h3 className={styles.title}>{feature.title}</h3>
              <p className={styles.desc}>{feature.description}</p>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  )
}
