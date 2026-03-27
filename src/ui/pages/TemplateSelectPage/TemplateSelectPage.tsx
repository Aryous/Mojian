// 模板选择页：左列表 + 右宣纸预览
// 用户选择模板后创建简历并跳转编辑器
import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { TEMPLATES } from '@/config/templates'
import type { TemplateMeta } from '@/config/templates'
import type { Resume } from '@/types'
import { useResumeStore, usePreviewStore } from '@/runtime/store'
import { SealButton } from '@/ui/components'
import styles from './TemplateSelectPage.module.css'

/** Demo resume data for preview -- pre-filled with realistic sample content */
function createDemoResume(templateId: string): Resume {
  return {
    id: '__preview__',
    title: '张墨简的简历',
    templateId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    personal: {
      name: '张墨简',
      title: '高级前端工程师',
      email: 'zhang@mojian.dev',
      phone: '138-0013-8000',
      location: '北京',
      website: 'mojian.dev',
      summary:
        '六年前端开发经验，专注于复杂交互系统与设计工程。主导过多个大型 SPA 项目的架构设计与性能优化，擅长将设计语言转化为可维护的组件体系。',
    },
    sections: [
      { id: 's1', type: 'personal', title: '个人信息', visible: true, sortOrder: 0 },
      { id: 's2', type: 'work', title: '工作经历', visible: true, sortOrder: 1 },
      { id: 's3', type: 'education', title: '教育经历', visible: true, sortOrder: 2 },
      { id: 's4', type: 'skills', title: '技能', visible: true, sortOrder: 3 },
    ],
    education: [
      {
        id: 'e1',
        school: '北京大学',
        degree: '硕士',
        field: '计算机科学与技术',
        startDate: '2016-09',
        endDate: '2018-06',
        description: '研究方向：人机交互与信息可视化',
      },
    ],
    work: [
      {
        id: 'w1',
        company: '字节跳动',
        position: '高级前端工程师',
        startDate: '2021-03',
        endDate: '至今',
        description:
          '主导设计系统建设，产出 80+ 组件，覆盖 12 条业务线。组件库月活跃开发者 200+，减少重复开发工时 40%。',
      },
      {
        id: 'w2',
        company: '蚂蚁集团',
        position: '前端工程师',
        startDate: '2018-07',
        endDate: '2021-02',
        description:
          '负责支付宝财富管理频道前端架构，日均 PV 300 万。优化首屏加载时间从 2.8s 降至 1.2s。',
      },
    ],
    skills: [
      { id: 'sk1', name: 'React / TypeScript', level: 'expert' },
      { id: 'sk2', name: 'CSS Architecture', level: 'expert' },
      { id: 'sk3', name: 'Node.js', level: 'advanced' },
      { id: 'sk4', name: 'Figma / Design Systems', level: 'advanced' },
    ],
    projects: [],
    custom: {},
  }
}

/** Mini SVG layout thumbnails for each template style */
function TemplateThumbnail({ templateId }: { templateId: string }) {
  if (templateId === 'twocolumn') {
    return (
      <svg className={styles.thumbIcon} viewBox="0 0 24 32" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="22" height="30" rx="1" stroke="currentColor" strokeWidth="0.8" />
        <line x1="10" y1="5" x2="10" y2="27" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        <line x1="3" y1="5" x2="8" y2="5" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <line x1="3" y1="8" x2="8" y2="8" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="3" y1="10" x2="7" y2="10" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="12" y1="5" x2="21" y2="5" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <line x1="12" y1="8" x2="20" y2="8" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="12" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="12" y1="14" x2="21" y2="14" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <line x1="12" y1="17" x2="19" y2="17" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      </svg>
    )
  }

  if (templateId === 'academic') {
    return (
      <svg className={styles.thumbIcon} viewBox="0 0 24 32" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="22" height="30" rx="1" stroke="currentColor" strokeWidth="0.8" />
        <line x1="6" y1="4" x2="18" y2="4" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
        <line x1="8" y1="7" x2="16" y2="7" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="4" y1="10" x2="20" y2="10" stroke="currentColor" strokeWidth="0.4" opacity="0.2" />
        <line x1="4" y1="13" x2="20" y2="13" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        <line x1="4" y1="15.5" x2="19" y2="15.5" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="4" y1="18" x2="17" y2="18" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="4" y1="22" x2="20" y2="22" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        <line x1="4" y1="24.5" x2="18" y2="24.5" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="4" y1="27" x2="15" y2="27" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      </svg>
    )
  }

  if (templateId === 'modern') {
    return (
      <svg className={styles.thumbIcon} viewBox="0 0 24 32" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="22" height="30" rx="1" stroke="currentColor" strokeWidth="0.8" />
        {/* Dark sidebar */}
        <rect x="1" y="1" width="8" height="30" rx="1" fill="currentColor" opacity="0.15" />
        <line x1="3" y1="5" x2="7" y2="5" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        <line x1="3" y1="8" x2="6.5" y2="8" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        <line x1="3" y1="10" x2="7.5" y2="10" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        <rect x="3" y="13" width="5.5" height="1.5" rx="0.5" fill="currentColor" opacity="0.15" />
        <rect x="3" y="16" width="4" height="1.5" rx="0.5" fill="currentColor" opacity="0.15" />
        {/* Right content */}
        <line x1="11" y1="5" x2="21" y2="5" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <rect x="11" y="6.5" width="3" height="1.5" rx="0.5" fill="currentColor" opacity="0.2" />
        <line x1="11" y1="10" x2="20" y2="10" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="11" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="11" y1="16" x2="21" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <rect x="11" y="17.5" width="3" height="1.5" rx="0.5" fill="currentColor" opacity="0.2" />
        <line x1="11" y1="21" x2="19" y2="21" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="11" y1="23" x2="17" y2="23" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      </svg>
    )
  }

  if (templateId === 'minimal') {
    return (
      <svg className={styles.thumbIcon} viewBox="0 0 24 32" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="22" height="30" rx="1" stroke="currentColor" strokeWidth="0.8" />
        {/* Large name, lots of whitespace */}
        <line x1="4" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <line x1="4" y1="10" x2="10" y2="10" stroke="currentColor" strokeWidth="0.4" opacity="0.2" />
        {/* Section label - small caps style */}
        <line x1="4" y1="15" x2="8" y2="15" stroke="currentColor" strokeWidth="0.4" opacity="0.25" />
        <line x1="4" y1="17.5" x2="18" y2="17.5" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="4" y1="19.5" x2="15" y2="19.5" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
        {/* Another section */}
        <line x1="4" y1="24" x2="7" y2="24" stroke="currentColor" strokeWidth="0.4" opacity="0.25" />
        <line x1="4" y1="26.5" x2="17" y2="26.5" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      </svg>
    )
  }

  // classic (default)
  return (
    <svg className={styles.thumbIcon} viewBox="0 0 24 32" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="22" height="30" rx="1" stroke="currentColor" strokeWidth="0.8" />
      <line x1="4" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      <line x1="4" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
      <line x1="4" y1="14.5" x2="19" y2="14.5" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <line x1="4" y1="17" x2="17" y2="17" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <line x1="4" y1="21" x2="20" y2="21" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
      <line x1="4" y1="23.5" x2="18" y2="23.5" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <line x1="4" y1="26" x2="15" y2="26" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </svg>
  )
}

/** SVG preview -- rendered by dangerouslySetInnerHTML (same as reference project) */
function SvgPreview({ svg }: { svg: string }) {
  return (
    <div
      className={styles.svgPreview}
      // NOTE: This renders Typst-compiled SVG, NOT user/AI-generated content.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

/* ============================================================
 *  Page component
 * ============================================================ */

export function TemplateSelectPage() {
  const navigate = useNavigate()
  const { createResume } = useResumeStore()
  const { svgs, error, compiling, compile, clear } = usePreviewStore()
  const svg = svgs[0] ?? null
  const [selectedId, setSelectedId] = useState<string>(TEMPLATES[0]?.id ?? 'classic')
  const [creating, setCreating] = useState(false)
  const compileTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Build a demo resume for the selected template
  const demoResume = useMemo(() => createDemoResume(selectedId), [selectedId])

  // Compile preview when template changes (debounced)
  useEffect(() => {
    if (compileTimerRef.current) {
      clearTimeout(compileTimerRef.current)
    }
    compileTimerRef.current = setTimeout(() => {
      compile(demoResume)
    }, 200)

    return () => {
      if (compileTimerRef.current) {
        clearTimeout(compileTimerRef.current)
      }
    }
  }, [demoResume, compile])

  // Clean up preview store on unmount
  useEffect(() => {
    return () => {
      clear()
    }
  }, [clear])

  const handleSelectTemplate = useCallback((template: TemplateMeta) => {
    setSelectedId(template.id)
  }, [])

  const handleConfirm = useCallback(async () => {
    setCreating(true)
    try {
      const resume = await createResume({ title: '未命名简历' })
      // The repo defaults templateId to 'classic'; if the user picked something else,
      // update it immediately via the store before navigating.
      if (selectedId !== 'classic') {
        // We have access to updateResume through the store, but the store's
        // updateCurrentResume requires openResume first. Instead, use the service
        // layer indirectly: navigate with a query param and let EditorPage handle it.
        // Simpler: use the repo directly? No -- that violates layer rules.
        // Best: navigate to editor, and pass the templateId as state.
        navigate(`/editor/${resume.id}`, { state: { templateId: selectedId } })
      } else {
        navigate(`/editor/${resume.id}`)
      }
    } catch {
      setCreating(false)
    }
  }, [createResume, navigate, selectedId])

  const handleBack = useCallback(() => {
    navigate('/')
  }, [navigate])

  // Keyboard navigation for template list
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'ArrowDown' && index < TEMPLATES.length - 1) {
        e.preventDefault()
        const next = TEMPLATES[index + 1]
        if (next) setSelectedId(next.id)
      } else if (e.key === 'ArrowUp' && index > 0) {
        e.preventDefault()
        const prev = TEMPLATES[index - 1]
        if (prev) setSelectedId(prev.id)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        handleConfirm()
      }
    },
    [handleConfirm],
  )

  return (
    <div className={styles.root}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <button
            type="button"
            className={styles.backButton}
            onClick={handleBack}
            aria-label="返回首页"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className={styles.pageTitle}>选择模板</h1>
        </div>
        <SealButton onClick={handleConfirm} disabled={creating}>
          {creating ? '创建中...' : '确认选择'}
        </SealButton>
      </div>

      {/* Body: sidebar + preview */}
      <div className={styles.body}>
        {/* Left sidebar: template list */}
        <nav className={styles.sidebar} aria-label="模板列表">
          <div className={styles.sidebarHeader}>
            <p className={styles.sidebarLabel}>可选模板</p>
          </div>

          <div className={styles.templateList} role="listbox" aria-label="简历模板">
            {TEMPLATES.map((template, index) => {
              const isActive = template.id === selectedId
              return (
                <motion.button
                  key={template.id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`${styles.templateCard} ${isActive ? styles.templateCardActive : ''}`}
                  onClick={() => handleSelectTemplate(template)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.35,
                    ease: [0.22, 0.61, 0.36, 1],
                    delay: index * 0.06,
                  }}
                >
                  <div
                    className={`${styles.templateThumb} ${isActive ? styles.templateThumbActive : ''}`}
                  >
                    <TemplateThumbnail templateId={template.id} />
                  </div>
                  <div className={styles.templateInfo}>
                    <h3 className={styles.templateName}>{template.name}</h3>
                    <p className={styles.templateDesc}>{template.description}</p>
                  </div>
                </motion.button>
              )
            })}
          </div>

        </nav>

        {/* Right: preview area with paper */}
        <div className={styles.previewArea} role="region" aria-label="模板预览">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedId}
              className={styles.paperWrapper}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                duration: 0.4,
                ease: [0.22, 0.61, 0.36, 1],
              }}
            >
              <div className={styles.paper}>
                <div className={styles.paperContent}>
                  {error ? (
                    <div className={styles.previewError}>
                      <p>预览生成失败</p>
                      <pre className={styles.previewErrorDetail}>{error}</pre>
                    </div>
                  ) : compiling ? (
                    <div className={styles.previewCompiling}>
                      <div className={styles.inkLoader}>
                        <span className={styles.inkDot} />
                      </div>
                      <span>编译预览中...</span>
                    </div>
                  ) : svg ? (
                    <SvgPreview svg={svg} />
                  ) : (
                    <div className={styles.previewPlaceholder}>
                      <span>选择模板以预览效果</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
