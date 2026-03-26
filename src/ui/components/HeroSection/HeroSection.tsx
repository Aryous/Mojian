import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { LatticePattern } from '../LatticePattern'
import styles from './HeroSection.module.css'

interface HeroSectionProps {
  title: string
  subtitle: string
  action: ReactNode
}

/**
 * HeroSection -- Dramatic skeuomorphic hero with ink-drop entrance
 *
 * The signature moment: an ink drop expands from center on load,
 * then a vermillion seal stamp drops from above and lands beside the title.
 *
 * Layout is left-aligned with asymmetric composition --
 * content sits in the left 60%, decorative elements breathe on the right.
 */
export function HeroSection({ title, subtitle, action }: HeroSectionProps) {
  const prefersReduced = useReducedMotion()

  const stagger = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.18,
        delayChildren: prefersReduced ? 0 : 0.4,
      },
    },
  }

  const titleReveal = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.9,
        ease: [0.22, 0.61, 0.36, 1],
      },
    },
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 0.61, 0.36, 1],
      },
    },
  }

  const brushDraw = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 0.61, 0.36, 1],
      },
    },
  }

  /* Signature moment: seal stamp drops from above and lands with a thump */
  const sealStampDrop = {
    hidden: { opacity: 0, y: -60, scale: 1.3, rotate: -8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotate: -3,
      transition: {
        duration: 0.5,
        ease: [0.22, 0.61, 0.36, 1],
        delay: prefersReduced ? 0 : 1.6,
      },
    },
  }

  /* Ink impression left behind by the stamp -- appears after stamp lands */
  const sealImpression = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 0.12,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.22, 0.61, 0.36, 1],
        delay: prefersReduced ? 0 : 2.0,
      },
    },
  }

  return (
    <section className={styles.root} aria-label="Hero">
      {/* Paper fiber texture */}
      <div className={styles.paperTexture} aria-hidden="true" />

      {/* Large-scale ink wash background -- dramatic sumi-e feel */}
      <div className={styles.inkWashBackground} aria-hidden="true" />

      {/* Lattice corner accents -- larger, bolder */}
      <div className={styles.latticeTopLeft} aria-hidden="true">
        <LatticePattern size={20} />
      </div>
      <div className={styles.latticeBottomRight} aria-hidden="true">
        <LatticePattern size={20} />
      </div>

      {/* Ink wash blobs -- more visible, with color */}
      <div className={styles.inkBlob1} aria-hidden="true" />
      <div className={styles.inkBlob2} aria-hidden="true" />
      <div className={styles.inkBlob3} aria-hidden="true" />

      {/* Ink drop entrance -- the signature animation */}
      <motion.div
        className={styles.inkDrop}
        initial={prefersReduced ? false : { scale: 0, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 0.61, 0.36, 1] }}
        aria-hidden="true"
      />

      {/* Floating cloud wisps -- slow drift */}
      <svg
        className={styles.cloudWisp}
        viewBox="0 0 200 80"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M30 55 Q15 55 15 42 Q15 28 30 28 Q32 15 50 15 Q62 3 80 15 Q92 5 105 18 Q120 10 130 28 Q145 25 145 40 Q145 55 130 55 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        <path
          d="M55 68 Q45 68 45 58 Q45 50 55 50 Q58 42 72 50 Q80 44 90 50 Q100 48 102 58 Q108 58 108 63 Q108 68 102 68 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>

      {/* Second cloud wisp -- lower left, slower drift */}
      <svg
        className={styles.cloudWisp2}
        viewBox="0 0 160 60"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M20 42 Q8 42 8 32 Q8 20 22 20 Q25 10 42 10 Q52 2 65 12 Q75 6 85 16 Q98 12 100 26 Q110 26 110 35 Q110 42 100 42 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          strokeLinecap="round"
        />
      </svg>

      {/* Vertical seal stamp -- decorative right-side element */}
      <div className={styles.decorativeSeal} aria-hidden="true">
        <svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
          <rect
            x="4" y="4" width="32" height="72"
            fill="currentColor" opacity="0.08"
            rx="1"
            transform="rotate(-2 20 40)"
          />
          <text
            x="20" y="36"
            textAnchor="middle"
            fontFamily="var(--font-family-display)"
            fontSize="16"
            fontWeight="700"
            fill="currentColor"
            opacity="0.12"
          >
            墨
          </text>
          <text
            x="20" y="58"
            textAnchor="middle"
            fontFamily="var(--font-family-display)"
            fontSize="16"
            fontWeight="700"
            fill="currentColor"
            opacity="0.12"
          >
            简
          </text>
        </svg>
      </div>

      {/* Content -- left-aligned for asymmetry */}
      <motion.div
        className={styles.content}
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* Seal stamp impression -- faint mark on paper where stamp lands */}
        <motion.div
          className={styles.sealImpression}
          variants={sealImpression}
          aria-hidden="true"
        >
          <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
            <rect
              x="3" y="3" width="50" height="50"
              fill="currentColor"
              rx="1"
              transform="rotate(-3 28 28)"
            />
            <text
              x="28" y="34"
              textAnchor="middle"
              fontFamily="var(--font-family-display)"
              fontSize="20"
              fontWeight="700"
              fill="var(--sem-bg-primary)"
              transform="rotate(-3 28 28)"
            >
              印
            </text>
          </svg>
        </motion.div>

        {/* Seal stamp dropping from above -- signature moment */}
        <motion.div
          className={styles.sealStamp}
          variants={sealStampDrop}
          aria-hidden="true"
        >
          <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
            <rect
              x="3" y="3" width="50" height="50"
              fill="currentColor"
              rx="1"
              transform="rotate(-3 28 28)"
            />
            <text
              x="28" y="34"
              textAnchor="middle"
              fontFamily="var(--font-family-display)"
              fontSize="20"
              fontWeight="700"
              fill="var(--sem-bg-primary)"
              transform="rotate(-3 28 28)"
            >
              印
            </text>
          </svg>
        </motion.div>

        <motion.h1 className={styles.title} variants={titleReveal}>
          {title}
        </motion.h1>

        {/* Brush stroke -- bold, vermillion, hand-drawn feel */}
        <motion.div className={styles.brushStroke} variants={brushDraw} aria-hidden="true">
          <svg
            className={styles.brushSvg}
            viewBox="0 0 220 12"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0 6 C10 3, 25 8, 50 5 C75 2, 90 9, 120 4 C150 7, 180 3, 200 6 C210 8, 218 5, 220 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Ink splatter at start of stroke */}
            <circle cx="3" cy="6" r="2.5" fill="currentColor" opacity="0.4" />
            <circle cx="8" cy="3" r="1" fill="currentColor" opacity="0.25" />
          </svg>
        </motion.div>

        <motion.p className={styles.subtitle} variants={fadeUp}>
          {subtitle}
        </motion.p>

        <motion.div className={styles.cta} variants={fadeUp}>
          {action}
        </motion.div>
      </motion.div>

      {/* Paper edge shadow */}
      <div className={styles.paperEdge} aria-hidden="true" />
    </section>
  )
}
