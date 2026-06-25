import { forwardRef, useEffect, useId, useRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import { useCombinedRef } from '../../utils/useCombinedRef'
import styles from './Textarea.module.css'

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  error?: string
  fullWidth?: boolean
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  autoResize?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      fullWidth = false,
      resize = 'vertical',
      autoResize = false,
      disabled,
      required,
      id,
      rows = 3,
      value,
      className,
      onChange,
      ...props
    },
    forwardedRef
  ) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const descriptionId = `${inputId}-description`

    const description = error || helperText || undefined

    // Ref interno para autoResize
    const internalRef = useRef<HTMLTextAreaElement>(null)
    const combinedRef = useCombinedRef(internalRef, forwardedRef)

    // AutoResize: recalcula altura en cada cambio de value
    useEffect(() => {
      if (!autoResize || !internalRef.current) return
      const el = internalRef.current
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }, [autoResize, value])

    return (
      <div
        className={cn(
          styles.wrapper,
          fullWidth && styles.fullWidth,
          disabled && styles.disabled
        )}
        data-fullwidth={fullWidth || undefined}
        data-error={!!error || undefined}
        data-disabled={disabled || undefined}
      >
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && (
              <span aria-hidden="true" className={styles.required}>
                {' '}*
              </span>
            )}
          </label>
        )}

        <textarea
          ref={combinedRef}
          id={inputId}
          rows={rows}
          value={value}
          className={cn(
            styles.textarea,
            styles[`resize-${resize}`],
            autoResize && styles.autoResize,
            error && styles.textareaError,
            className
          )}
          disabled={disabled}
          required={required}
          aria-required={required || undefined}
          aria-invalid={!!error || undefined}
          aria-describedby={descriptionId}
          onChange={onChange}
          {...props}
        />

        <span id={descriptionId} className={cn(styles.description, error ? styles.descriptionError : styles.descriptionHelper)} aria-live="polite" aria-atomic="true">{description}</span>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
