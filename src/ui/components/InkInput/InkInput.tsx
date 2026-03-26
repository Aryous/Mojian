import { type InputHTMLAttributes, useId } from 'react'
import styles from './InkInput.module.css'

interface InkInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  /** 聚焦后显示的占位提示文字 */
  hint?: string
}

export function InkInput({
  label,
  error,
  hint,
  className,
  id: externalId,
  ...props
}: InkInputProps) {
  const generatedId = useId()
  const id = externalId ?? generatedId

  return (
    <div className={`${styles.root} ${error ? styles.error : ''} ${className ?? ''}`}>
      <input
        id={id}
        className={styles.input}
        placeholder={hint ?? ' '}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
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
