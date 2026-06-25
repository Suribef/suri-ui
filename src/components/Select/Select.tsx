import { forwardRef, useId } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import styles from './Select.module.css'

export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export type SelectOptionGroup = {
  group: string
  options: SelectOption[]
}

export type SelectItem = SelectOption | SelectOptionGroup

function isGroup(item: SelectItem): item is SelectOptionGroup {
  return 'group' in item
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectItem[]
  label?: string
  placeholder?: string
  helperText?: string
  error?: string
  fullWidth?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      label,
      placeholder,
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
    const selectId = id ?? generatedId
    const descriptionId = `${selectId}-description`

    const description = error || helperText || undefined

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
          <label htmlFor={selectId} className={styles.label}>
            {label}
            {required && (
              <span aria-hidden="true" className={styles.required}>
                {' '}*
              </span>
            )}
          </label>
        )}

        <div className={styles.selectWrapper}>
          <select
            ref={ref}
            id={selectId}
            className={cn(
              styles.select,
              error && styles.selectError,
              className
            )}
            disabled={disabled}
            required={required}
            aria-required={required || undefined}
            aria-invalid={!!error || undefined}
            aria-describedby={descriptionId}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}

            {options.map((item) =>
              isGroup(item) ? (
                <optgroup key={item.group} label={item.group}>
                  {item.options.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      disabled={opt.disabled}
                    >
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              ) : (
                <option
                  key={item.value}
                  value={item.value}
                  disabled={item.disabled}
                >
                  {item.label}
                </option>
              )
            )}
          </select>
        </div>

        <span id={descriptionId} className={cn(styles.description, error ? styles.descriptionError : styles.descriptionHelper)} aria-live="polite" aria-atomic="true">{description}</span>
      </div>
    )
  }
)

Select.displayName = 'Select'
