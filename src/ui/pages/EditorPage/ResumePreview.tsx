// 简历预览面板：通过 previewStore 获取 SVG 编译结果
import { useEffect } from 'react'
import type { Resume } from '@/types'
import { usePreviewStore } from '@/runtime/store'
import { SealButton } from '@/ui/components'
import styles from './ResumePreview.module.css'

interface ResumePreviewProps {
  resume: Resume
}

/** 防抖编译延迟（ms） */
const COMPILE_DELAY = 600

export function ResumePreview({ resume }: ResumePreviewProps) {
  const { svg, error, compiling, exporting, compile, exportPdf } = usePreviewStore()

  // 防抖触发编译
  useEffect(() => {
    const timer = setTimeout(() => {
      compile(resume)
    }, COMPILE_DELAY)

    return () => clearTimeout(timer)
  }, [resume, compile])

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.label}>预览</span>
        {compiling && <span className={styles.status}>编译中…</span>}
        <SealButton
          variant="secondary"
          disabled={exporting || compiling}
          onClick={() => exportPdf(resume)}
        >
          {exporting ? '导出中…' : '导出 PDF'}
        </SealButton>
      </div>
      <div className={styles.canvas}>
        {error ? (
          <div className={styles.error}>
            <p>渲染失败</p>
            <pre className={styles.errorDetail}>{error}</pre>
          </div>
        ) : svg ? (
          <div
            className={styles.svgPreview}
            // NOTE: This renders Typst-compiled SVG, NOT user/AI-generated content.
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className={styles.placeholder}>
            {compiling ? '正在编译…' : '编辑简历内容以预览'}
          </div>
        )}
      </div>
    </div>
  )
}
