import { type InputHTMLAttributes, type TextareaHTMLAttributes, useId } from 'react'
import styles from './InkInput.module.css'

type BaseProps = {
  label: string
  error?: string
  /** 聚焦后显示的占位提示文字 */
  hint?: string
  /** 渲染为多行 textarea */
  multiline?: boolean
  /** textarea 可见行数 (默认 3) */
  rows?: number
}

type InkInputProps =
  | (BaseProps & { multiline?: false } & InputHTMLAttributes<HTMLInputElement>)
  | (BaseProps & { multiline: true } & TextareaHTMLAttributes<HTMLTextAreaElement>)

export function InkInput(props: InkInputProps) {
  const {
    label,
    error,
    hint,
    multiline,
    className,
    id: externalId,
    rows,
    ...rest
  } = props

  const generatedId = useId()
  const id = externalId ?? generatedId
  const rootClass = `${styles.root} ${multiline ? styles.multiline : ''} ${error ? styles.error : ''} ${className ?? ''}`

  return (
    <div className={rootClass}>
      {multiline ? (
        <textarea
          id={id}
          className={`${styles.input} ${styles.textarea}`}
          placeholder={hint ?? ' '}
          rows={rows ?? 3}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={id}
          className={styles.input}
          placeholder={hint ?? ' '}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {error && (
        <span id={`${id}-error`} className={styles.errorText} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
