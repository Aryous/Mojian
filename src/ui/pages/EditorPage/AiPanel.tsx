// UI 层：AI 优化面板
// 依赖：Types, Config, Runtime（通过 store）
// 禁止引用：Repo, Service

import { useState, useEffect, useCallback, type ChangeEvent } from 'react'
import { useAiStore } from '@/runtime/store'
import { AI_OPTIMIZE_OPTIONS } from '@/config'
import type { AiOptimizeOption } from '@/types'
import { PaperCard, SealButton, InkInput, InkDivider } from '@/ui/components'
import styles from './AiPanel.module.css'

interface AiPanelProps {
  /** 当前正在编辑的文本内容（供 AI 优化） */
  content: string
  /** 用户接受优化结果后的回调 */
  onAccept: (optimized: string) => void
}

export function AiPanel({ content, onAccept }: AiPanelProps) {
  const {
    apiKeySet,
    optimizing,
    result,
    error,
    loadApiKey,
    setApiKey,
    removeApiKey,
    optimize,
    clearResult,
  } = useAiStore()

  const [keyInput, setKeyInput] = useState('')

  // 初始化时检查 API Key 状态
  useEffect(() => {
    loadApiKey()
  }, [loadApiKey])

  const handleSaveKey = useCallback(() => {
    const trimmed = keyInput.trim()
    if (trimmed) {
      setApiKey(trimmed)
      setKeyInput('')
    }
  }, [keyInput, setApiKey])

  const handleOptimize = useCallback(
    (option: AiOptimizeOption) => {
      if (!content.trim()) return
      optimize(content, option.id)
    },
    [content, optimize],
  )

  const handleAccept = useCallback(() => {
    if (result) {
      onAccept(result.optimized)
      clearResult()
    }
  }, [result, onAccept, clearResult])

  const handleReject = useCallback(() => {
    clearResult()
  }, [clearResult])

  return (
    <PaperCard>
      <div className={styles.root}>
        <h2 className={styles.title}>AI 智能优化</h2>

        {/* API Key 配置 */}
        {!apiKeySet ? (
          <div className={styles.keySection}>
            <p className={styles.keyHint}>
              请输入 OpenRouter API Key 以启用 AI 功能。
              可在 openrouter.ai 免费注册获取。
            </p>
            <div className={styles.keyRow}>
              <div className={styles.keyInput}>
                <InkInput
                  label="OpenRouter API Key"
                  type="password"
                  value={keyInput}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setKeyInput(e.target.value)}
                />
              </div>
              <SealButton
                onClick={handleSaveKey}
                disabled={!keyInput.trim()}
              >
                保存
              </SealButton>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.keyStatus}>
              <span className={styles.keyStatusText}>API Key 已配置</span>
              <SealButton variant="ghost" onClick={removeApiKey}>
                清除
              </SealButton>
            </div>

            <InkDivider variant="thin" />

            {/* 优化结果展示 */}
            {result ? (
              <div className={styles.resultSection}>
                <p className={styles.subtitle}>优化对比</p>
                <div className={styles.diffContainer}>
                  <div className={styles.diffColumn}>
                    <p className={styles.diffLabel}>原文</p>
                    <div className={styles.diffText}>{result.original}</div>
                  </div>
                  <div className={styles.diffColumn}>
                    <p className={styles.diffLabel}>优化后</p>
                    <div className={`${styles.diffText} ${styles.diffTextNew}`}>
                      {result.optimized}
                    </div>
                  </div>
                </div>
                <div className={styles.resultActions}>
                  <SealButton onClick={handleAccept}>
                    采纳
                  </SealButton>
                  <SealButton variant="secondary" onClick={handleReject}>
                    放弃
                  </SealButton>
                </div>
              </div>
            ) : optimizing ? (
              <div className={styles.optimizing}>
                <span className={styles.spinner} />
                <span>AI 正在优化中…</span>
              </div>
            ) : (
              <>
                {/* 优化选项 */}
                <p className={styles.subtitle}>选择优化方向</p>
                {!content.trim() ? (
                  <p className={styles.emptyHint}>请先在编辑器中输入内容，再使用 AI 优化</p>
                ) : (
                  <div className={styles.optionsGrid}>
                    {AI_OPTIMIZE_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={styles.optionCard}
                        onClick={() => handleOptimize(option)}
                        disabled={optimizing}
                      >
                        <p className={styles.optionName}>{option.name}</p>
                        <p className={styles.optionDesc}>{option.description}</p>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* 错误提示 */}
            {error && <div className={styles.error}>{error}</div>}
          </>
        )}
      </div>
    </PaperCard>
  )
}
