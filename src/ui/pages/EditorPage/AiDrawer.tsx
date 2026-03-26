// src/ui/pages/EditorPage/AiDrawer.tsx
// AI drawer: quick actions + chat + input bar — obi indigo color scheme
import { useState, useCallback, useRef, useEffect, type KeyboardEvent, type ChangeEvent } from 'react'
import { useAiStore } from '@/runtime/store'
import styles from './AiDrawer.module.css'

interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  text: string
}

interface AiDrawerProps {
  open: boolean
  onClose: () => void
  /** Current resume text content for AI optimization */
  content: string
  /** Called when user accepts an AI suggestion */
  onAccept: (optimized: string) => void
}

const QUICK_ACTIONS = [
  { key: 'polish', icon: '润', name: '润色全文', desc: '优化表述，更专业有力', prompt: '帮我润色全文，让表述更专业' },
  { key: 'quantify', icon: '量', name: '量化成果', desc: '模糊描述变可量化指标', prompt: '帮我量化工作成果，添加数据指标' },
  { key: 'concise', icon: '简', name: '精简内容', desc: '去除冗余，控制篇幅', prompt: '帮我精简内容，控制在一页以内' },
  { key: 'match', icon: '适', name: '岗位匹配', desc: '根据目标岗位调整', prompt: '帮我针对目标岗位优化简历' },
] as const

const SUGGESTION_CHIPS = [
  { label: '改写简介', prompt: '帮我改写个人简介' },
  { label: 'STAR 法则', prompt: '用 STAR 法则重写工作经历' },
  { label: '翻译英文', prompt: '翻译为英文' },
]

export function AiDrawer({ open, onClose, content, onAccept }: AiDrawerProps) {
  const { apiKeySet, optimizing, optimize, result, clearResult, loadApiKey, setApiKey, removeApiKey } = useAiStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [keyInput, setKeyInput] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)

  // Load API key status on mount
  useEffect(() => {
    loadApiKey()
  }, [loadApiKey])

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  // When AI result arrives, add it as a chat message
  useEffect(() => {
    if (result) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'ai', text: result.optimized },
      ])
      onAccept(result.optimized)
      clearResult()
    }
  }, [result, onAccept, clearResult])

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || optimizing) return

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', text },
    ])
    setInputValue('')

    // Map to closest optimize option or default to 'polish'
    const optionMap: Record<string, string> = {
      '润色': 'polish',
      '量化': 'quantify',
      '精简': 'concise',
      '岗位': 'match-job',
    }
    let optionId = 'polish'
    for (const [keyword, id] of Object.entries(optionMap)) {
      if (text.includes(keyword)) {
        optionId = id
        break
      }
    }
    optimize(content, optionId)
  }, [content, optimizing, optimize])

  const handleInputKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      sendMessage(inputValue)
    }
  }, [inputValue, sendMessage])

  const handleSaveKey = useCallback(() => {
    const trimmed = keyInput.trim()
    if (trimmed) {
      setApiKey(trimmed)
      setKeyInput('')
    }
  }, [keyInput, setApiKey])

  const handleKeyInputKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveKey()
    }
  }, [handleSaveKey])

  return (
    <div className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`} role="region" aria-label="AI 智能优化">
      <div className={styles.header}>
        <span className={styles.headerTitle}>AI 智能优化</span>
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
          {/* API Key status */}
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
                onClick={() => sendMessage(a.prompt)}
                disabled={optimizing}
              >
                <span className={styles.actionIcon}>{a.icon}</span>
                <span className={styles.actionName}>{a.name}</span>
                <span className={styles.actionDesc}>{a.desc}</span>
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className={styles.chat} ref={chatRef}>
            {messages.length === 0 ? (
              <div className={styles.chatHint}>点击快捷操作或输入你的需求</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`${styles.msg} ${msg.role === 'user' ? styles.msgUser : styles.msgAi}`}>
                  {msg.text}
                </div>
              ))
            )}
            {optimizing && (
              <div className={`${styles.msg} ${styles.msgAi}`}>
                <span className={styles.spinner} /> 正在优化...
              </div>
            )}
          </div>

          {/* Suggestion Chips */}
          <div className={styles.chips}>
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                className={styles.chip}
                onClick={() => sendMessage(chip.prompt)}
                disabled={optimizing}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className={styles.inputBar}>
            <input
              className={styles.input}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="告诉 AI 你想怎么优化..."
              disabled={optimizing}
            />
            <button
              type="button"
              className={styles.sendBtn}
              onClick={() => sendMessage(inputValue)}
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
    </div>
  )
}
