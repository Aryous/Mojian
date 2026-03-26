// 简历预览面板：通过 previewStore 获取编译结果
import { useEffect, useState } from 'react'
import type { Resume } from '@/types'
import { usePreviewStore } from '@/runtime/store'
import styles from './ResumePreview.module.css'

interface ResumePreviewProps {
  resume: Resume
}

/** 防抖编译延迟（ms） */
const COMPILE_DELAY = 600

export function ResumePreview({ resume }: ResumePreviewProps) {
  const { artifact, error, compiling, exporting, compile, exportPdf } = usePreviewStore()

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
        <button
          type="button"
          className={styles.exportBtn}
          disabled={exporting || compiling}
          onClick={() => exportPdf(resume)}
        >
          {exporting ? '导出中…' : '导出 PDF'}
        </button>
      </div>
      <div className={styles.canvas}>
        {error ? (
          <div className={styles.error}>
            <p>渲染失败</p>
            <pre className={styles.errorDetail}>{error}</pre>
          </div>
        ) : artifact ? (
          <TypstPreviewCanvas artifact={artifact} />
        ) : (
          <div className={styles.placeholder}>
            {compiling ? '正在编译…' : '编辑简历内容以预览'}
          </div>
        )}
      </div>
    </div>
  )
}

/** 使用 typst.react TypstDocument 渲染 artifact */
function TypstPreviewCanvas({ artifact }: { artifact: Uint8Array }) {
  const [DocComponent, setDocComponent] = useState<React.ComponentType<{
    artifact: Uint8Array
    fill?: string
  }> | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    import('@myriaddreamin/typst.react')
      .then((mod) => {
        if (!cancelled) {
          setDocComponent(() => mod.TypstDocument)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load renderer')
        }
      })
    return () => { cancelled = true }
  }, [])

  if (loadError) {
    return <div className={styles.error}>{loadError}</div>
  }

  if (!DocComponent) {
    return <div className={styles.placeholder}>加载渲染器…</div>
  }

  return <DocComponent artifact={artifact} fill="#ffffff" />
}
