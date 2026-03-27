// src/ui/pages/EditorPage/AiDrawer.tsx
// AI drawer: quick actions + diff view — obi indigo color scheme
import { useState, useCallback, useRef, useEffect, type KeyboardEvent, type ChangeEvent } from 'react'
import { useAiStore } from '@/runtime/store'
import type { Resume, SectionType, AiDiffEntry } from '@/types'
import styles from './AiDrawer.module.css'

interface AiDrawerProps {
  open: boolean
  onClose: () => void
  resume: Resume | null
  onAccept: (changes: Partial<Resume>) => void
  /** 从 section "墨灵"按钮触发时传入目标 section */
  targetSection?: SectionType
}

// Quick actions — 不绑定 section，AI 自行判断该改什么
const QUICK_ACTIONS = [
  { key: 'polish', icon: '润', name: '润色全文', desc: '优化表述，更专业有力', prompt: '润色全文，让每句话更专业有力' },
  { key: 'quantify', icon: '量', name: '量化成果', desc: '模糊描述变可量化指标', prompt: '量化工作成果，把主观评价变成客观数据' },
  { key: 'concise', icon: '简', name: '精简内容', desc: '去除冗余，控制篇幅', prompt: '精简全文，删除一切不增加说服力的内容' },
  { key: 'match-job', icon: '适', name: '岗位匹配', desc: '根据目标岗位调整', prompt: '根据目标岗位方向优化简历' },
] as const

const SUGGESTION_CHIPS = [
  { label: '改写简介', prompt: '帮我改写个人简介，更有吸引力' },
  { label: 'STAR 法则', prompt: '用 STAR 法则重写工作经历' },
  { label: '翻译英文', prompt: '将简历翻译为英文' },
]

function DiffEntryRow({ entry }: { entry: AiDiffEntry }) {
  return (
    <div className={styles.diffEntry}>
      <div className={styles.diffPath}>
        <span
          className={`${styles.diffBadge} ${
            entry.type === 'added'
              ? styles.diffBadgeAdded
              : entry.type === 'removed'
                ? styles.diffBadgeRemoved
                : styles.diffBadgeModified
          }`}
        >
          {entry.type === 'added' ? '+' : entry.type === 'removed' ? '-' : '~'}
        </span>
        {entry.path}
      </div>
      {(entry.type === 'modified' || entry.type === 'removed') && entry.oldValue && (
        <div className={styles.diffOld}>{entry.oldValue}</div>
      )}
      {(entry.type === 'modified' || entry.type === 'added') && entry.newValue && (
        <div className={styles.diffNew}>{entry.newValue}</div>
      )}
    </div>
  )
}

export function AiDrawer({ open, onClose, resume, onAccept, targetSection }: AiDrawerProps) {
  const {
    apiKeySet,
    optimizing,
    pendingResult,
    diffEntries,
    messages,
    loadApiKey,
    setApiKey,
    removeApiKey,
    optimize,
    acceptResult,
    rejectResult,
  } = useAiStore()

  const [inputValue, setInputValue] = useState('')
  const [keyInput, setKeyInput] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadApiKey()
  }, [loadApiKey])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  // 发送优化请求 — targetSection 可选
  const sendOptimize = useCallback(
    (userPrompt: string, optionId: string, section?: SectionType) => {
      if (!userPrompt.trim() || optimizing || !resume) return
      setInputValue('')
      void optimize(resume, optionId, userPrompt, section)
    },
    [optimizing, resume, optimize],
  )

  // Quick action — 不传 section，全文优化
  const handleQuickAction = useCallback(
    (action: typeof QUICK_ACTIONS[number]) => {
      sendOptimize(action.prompt, action.key)
    },
    [sendOptimize],
  )

  // Suggestion chip — 也不硬编码 section
  const handleChipClick = useCallback(
    (chip: typeof SUGGESTION_CHIPS[number]) => {
      sendOptimize(chip.prompt, 'polish')
    },
    [sendOptimize],
  )

  // 自由文本输入 — 如果有 targetSection prop（从 section "墨灵"按钮触发），传入 section
  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return
    sendOptimize(inputValue, 'polish', targetSection)
  }, [inputValue, sendOptimize, targetSection])

  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
        handleSend()
      }
    },
    [handleSend],
  )

  const handleSaveKey = useCallback(() => {
    const trimmed = keyInput.trim()
    if (trimmed) {
      setApiKey(trimmed)
      setKeyInput('')
    }
  }, [keyInput, setApiKey])

  const handleKeyInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSaveKey()
      }
    },
    [handleSaveKey],
  )

  const handleAccept = useCallback(() => {
    const changes = acceptResult()
    if (changes) {
      onAccept(changes)
    }
  }, [acceptResult, onAccept])

  const handleReject = useCallback(() => {
    rejectResult()
  }, [rejectResult])

  return (
    <div className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`} role="region" aria-label="墨灵">
      <div className={styles.header}>
        <span className={styles.headerTitle}>墨灵</span>
        <button type="button" className={styles.headerClose} onClick={onClose} aria-label="关闭 AI 面板">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {!apiKeySet ? (
        <div className={styles.keySection}>
          <p className={styles.keyHint}>
            请输入 OpenRouter API Key 以启用 AI 功能。
            可在 openrouter.ai 免费注册获取。
          </p>
          <div className={styles.keyRow}>
            <input
              type="password"
              className={styles.keyInput}
              value={keyInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setKeyInput(e.target.value)}
              onKeyDown={handleKeyInputKeyDown}
              placeholder="sk-or-..."
              aria-label="OpenRouter API Key"
              maxLength={200}
              autoComplete="off"
            />
            <button
              type="button"
              className={styles.keySaveBtn}
              onClick={handleSaveKey}
              disabled={!keyInput.trim()}
            >
              保存
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.keyStatus}>
            <span className={styles.keyStatusDot} />
            <span className={styles.keyStatusText}>API Key 已配置</span>
            <button type="button" className={styles.keyRemoveBtn} onClick={removeApiKey}>
              清除
            </button>
          </div>

          {/* Quick Actions */}
          <div className={styles.actions}>
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.key}
                type="button"
                className={styles.actionCard}
                onClick={() => handleQuickAction(a)}
                disabled={optimizing || !!pendingResult}
              >
                <span className={styles.actionIcon}>{a.icon}</span>
                <span className={styles.actionName}>{a.name}</span>
                <span className={styles.actionDesc}>{a.desc}</span>
              </button>
            ))}
          </div>

          {pendingResult ? (
            <>
              <div className={styles.diffSection} ref={chatRef}>
                <div className={styles.diffHeader}>AI 建议的修改（共 {diffEntries.length} 处）</div>
                {diffEntries.length === 0 ? (
                  <div className={styles.chatHint}>暂无可展示的差异</div>
                ) : (
                  diffEntries.map((entry, idx) => (
                    <DiffEntryRow key={`${entry.path}-${idx}`} entry={entry} />
                  ))
                )}
              </div>
              <div className={styles.diffActions}>
                <button type="button" className={styles.acceptBtn} onClick={handleAccept}>
                  采纳修改
                </button>
                <button type="button" className={styles.rejectBtn} onClick={handleReject}>
                  放弃
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.chat} ref={chatRef}>
                {messages.length === 0 ? (
                  <div className={styles.chatHint}>点击快捷操作或输入你的需求</div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`${styles.msg} ${msg.role === 'user' ? styles.msgUser : styles.msgAi}`}>
                      {msg.content}
                    </div>
                  ))
                )}
                {optimizing && (
                  <div className={`${styles.msg} ${styles.msgAi}`}>
                    <span className={styles.spinner} /> 正在优化...
                  </div>
                )}
              </div>

              <div className={styles.chips}>
                {SUGGESTION_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    className={styles.chip}
                    onClick={() => handleChipClick(chip)}
                    disabled={optimizing}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <div className={styles.inputBar}>
                <input
                  className={styles.input}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="告诉墨灵你想怎么优化..."
                  disabled={optimizing}
                />
                <button
                  type="button"
                  className={styles.sendBtn}
                  onClick={handleSend}
                  disabled={optimizing || !inputValue.trim()}
                  aria-label="发送"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M2 8h12M10 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
