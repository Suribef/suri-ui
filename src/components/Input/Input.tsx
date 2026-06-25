import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import styles from './Input.module.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      fullWidth = false,
      disabled,
      required,
      id,
      className,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const descriptionId = `${inputId}-description`

    const description = error ?? helperText

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

        <input
          ref={ref}
          id={inputId}
          className={cn(
            styles.input,
            error && styles.inputError,
            className
          )}
          disabled={disabled}
          required={required}
          aria-required={required || undefined}
          aria-invalid={!!error || undefined}
          aria-describedby={descriptionId}
          {...props}
        />

        <span id={descriptionId} className={cn(styles.description, error ? styles.descriptionError : styles.descriptionHelper)} aria-live="polite" aria-atomic="true">{description}</span>
      </div>
    )
  }
)

Input.displayName = 'Input'
