// 落地页：纯品牌展示 + 功能介绍 + CTA
// 不加载任何简历数据
import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'motion/react'
import {
  SealButton,
  InkDivider,
  HeroSection,
  FeatureShowcase,
} from '@/ui/components'
import styles from './LandingPage.module.css'

/* ---- Feature icons ---- */

function BrushIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M36 5 C33 9, 27 17, 24 23 C21 28, 19 33, 20 37 Q21 42, 25 42 Q29 42, 28 36 C27 32, 25 28, 23 26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="21" cy="40" r="2" fill="currentColor" opacity="0.3" />
      <circle cx="17" cy="38" r="1" fill="currentColor" opacity="0.2" />
    </svg>
  )
}

function SealIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect
        x="8" y="8" width="32" height="32"
        stroke="currentColor" strokeWidth="2.5"
        rx="1" fill="none"
        transform="rotate(-2 24 24)"
      />
      <line x1="18" y1="20" x2="30" y2="20" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="18" y1="28" x2="30" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="24" y1="14" x2="24" y2="34" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    </svg>
  )
}

function ScrollIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M14 7 L34 7 Q37 7, 37 10 L37 38 Q37 43, 32 43 L16 43 Q11 43, 11 38 L11 10 Q11 7, 14 7 Z"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M11 10 Q11 7, 14 7" stroke="currentColor" strokeWidth="2" opacity="0.5" fill="none" />
      <line x1="18" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <line x1="18" y1="22" x2="27" y2="22" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <line x1="18" y1="28" x2="29" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <line x1="18" y1="34" x2="24" y2="34" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
    </svg>
  )
}

const FEATURES = [
  {
    icon: <BrushIcon />,
    title: 'AI 润笔',
    description: '以 AI 为墨，润色表述、量化成果、精简内容。一键让每段经历掷地有声。',
  },
  {
    icon: <SealIcon />,
    title: '多款模板',
    description: '经典单栏、双栏、学术风。Typst 排版引擎渲染，如刻版印刷般精准。',
  },
  {
    icon: <ScrollIcon />,
    title: '一键导出',
    description: '所见即所得的实时预览，一键导出 PDF。如同从案头取走一纸文书。',
  },
]

export function LandingPage() {
  const navigate = useNavigate()

  const handleCreate = useCallback(() => {
    navigate('/new')
  }, [navigate])

  const handleDashboard = useCallback(() => {
    navigate('/dashboard')
  }, [navigate])

  return (
    <div className={styles.root}>
      <HeroSection
        title="墨简"
        subtitle="以古人之笔意，书今人之履历。AI 驱动的中古风简历编辑器。"
        action={
          <div className={styles.heroActions}>
            <SealButton onClick={handleCreate}>
              开始创作
            </SealButton>
            <SealButton variant="secondary" onClick={handleDashboard}>
              我的简历
            </SealButton>
          </div>
        }
      />

      <motion.div
        className={styles.sectionBreak}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <motion.div
          className={styles.inkWashLine}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1.0, ease: [0.22, 0.61, 0.36, 1], delay: 0.2 }}
        />
      </motion.div>

      <FeatureShowcase features={FEATURES} />

      <footer className={styles.footer}>
        <InkDivider variant="ornamental" className={styles.footerDivider} />
        <p className={styles.footerText}>
          <span className={styles.footerBrand}>墨简 Mojian</span>
        </p>
      </footer>
    </div>
  )
}
