// 首页：拟物化中古风 Hero 页面 -- 惊艳版
import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useResumeStore } from '@/runtime/store'
import {
  PaperCard,
  SealButton,
  InkDivider,
  CloudEmpty,
  InkTag,
  HeroSection,
  FeatureShowcase,
  LatticePattern,
} from '@/ui/components'
import styles from './HomePage.module.css'

/* ---- Feature icons: bolder strokes, more personality ---- */

function BrushIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Brush body -- single decisive stroke */}
      <path
        d="M36 5 C33 9, 27 17, 24 23 C21 28, 19 33, 20 37 Q21 42, 25 42 Q29 42, 28 36 C27 32, 25 28, 23 26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Ink splash at tip */}
      <circle cx="21" cy="40" r="2" fill="currentColor" opacity="0.3" />
      <circle cx="17" cy="38" r="1" fill="currentColor" opacity="0.2" />
    </svg>
  )
}

function SealIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Seal square -- bold, slightly rotated */}
      <rect
        x="8" y="8" width="32" height="32"
        stroke="currentColor" strokeWidth="2.5"
        rx="1" fill="none"
        transform="rotate(-2 24 24)"
      />
      {/* Cross-hatch inside seal */}
      <line x1="18" y1="20" x2="30" y2="20" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="18" y1="28" x2="30" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="24" y1="14" x2="24" y2="34" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    </svg>
  )
}

function ScrollIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Scroll body */}
      <path
        d="M14 7 L34 7 Q37 7, 37 10 L37 38 Q37 43, 32 43 L16 43 Q11 43, 11 38 L11 10 Q11 7, 14 7 Z"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Scroll roller */}
      <path d="M11 10 Q11 7, 14 7" stroke="currentColor" strokeWidth="2" opacity="0.5" fill="none" />
      {/* Text lines */}
      <line x1="18" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <line x1="18" y1="22" x2="27" y2="22" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <line x1="18" y1="28" x2="29" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <line x1="18" y1="34" x2="24" y2="34" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
    </svg>
  )
}

/* ---- Features data ---- */

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

/* ---- Utility ---- */

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/* ---- Page ---- */

export function HomePage() {
  const navigate = useNavigate()
  const { resumes, loading, loadResumes, deleteResume } = useResumeStore()

  useEffect(() => {
    loadResumes()
  }, [loadResumes])

  const handleCreate = useCallback(() => {
    navigate('/new')
  }, [navigate])

  return (
    <div className={styles.root}>
      {/* ===== Hero ===== */}
      <HeroSection
        title="墨简"
        subtitle="以古人之笔意，书今人之履历。AI 驱动的中古风简历编辑器。"
        action={
          <SealButton onClick={handleCreate}>
            开始创作
          </SealButton>
        }
      />

      {/* ===== Transition: ink wash divider between hero and features ===== */}
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

      {/* ===== Features ===== */}
      <FeatureShowcase features={FEATURES} />

      {/* ===== Resume Gallery ===== */}
      <section className={styles.gallery}>
        <div className={styles.galleryDecoration} aria-hidden="true">
          <LatticePattern size={16} />
        </div>

        <motion.div
          className={styles.galleryHeader}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div className={styles.galleryTitleGroup}>
            <h2 className={styles.galleryTitle}>我的简历</h2>
            <span className={styles.galleryCount}>
              {!loading && resumes.length > 0 ? `${resumes.length} 份` : ''}
            </span>
          </div>
          <SealButton variant="secondary" onClick={handleCreate}>
            新建简历
          </SealButton>
        </motion.div>

        <InkDivider />

        <div className={styles.galleryList}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.inkDots} aria-hidden="true">
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
              <span>载入中...</span>
            </div>
          ) : resumes.length === 0 ? (
            <CloudEmpty message="案头空空，不如落笔。点击上方按钮创建第一份简历。" />
          ) : (
            <AnimatePresence mode="popLayout">
              {resumes.map((resume, i) => (
                <motion.div
                  key={resume.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.22, 0.61, 0.36, 1],
                    delay: i * 0.05,
                  }}
                  layout
                >
                  <PaperCard className={styles.resumeCard} liftable>
                    <div
                      className={styles.cardContent}
                      onClick={() => navigate(`/editor/${resume.id}`)}
                      role="button"
                      tabIndex={0}
                      aria-label={`编辑简历：${resume.title}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          navigate(`/editor/${resume.id}`)
                        }
                      }}
                    >
                      {/* Vermillion accent stripe */}
                      <div className={styles.cardAccent} aria-hidden="true" />

                      <div className={styles.cardInfo}>
                        <h3 className={styles.cardTitle}>{resume.title}</h3>
                        <div className={styles.cardMeta}>
                          <InkTag>{resume.templateId}</InkTag>
                          <span className={styles.date}>
                            {formatDate(resume.updatedAt)}
                          </span>
                        </div>
                      </div>

                      <div
                        className={styles.cardActions}
                        onClick={(e) => e.stopPropagation()}
                        role="presentation"
                      >
                        <SealButton
                          variant="ghost"
                          onClick={() => deleteResume(resume.id)}
                        >
                          删除
                        </SealButton>
                      </div>
                    </div>
                  </PaperCard>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className={styles.footer}>
        <InkDivider variant="ornamental" className={styles.footerDivider} />
        <p className={styles.footerText}>
          <span className={styles.footerBrand}>墨简 Mojian</span>
        </p>
      </footer>
    </div>
  )
}
