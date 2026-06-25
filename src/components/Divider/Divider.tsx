import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import styles from './Divider.module.css'

export interface DividerProps extends HTMLAttributes<HTMLElement> {
  decorative?: boolean
  orientation?: 'horizontal' | 'vertical'
  label?: string
}

export function Divider({
  decorative = false,
  orientation = 'horizontal',
  label,
  className,
  ...props
}: DividerProps) {
  const isVertical = orientation === 'vertical'

  if (decorative) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          styles.divider,
          isVertical ? styles.vertical : styles.horizontal,
          className
        )}
        data-orientation={orientation}
        data-decorative="true"
        {...props}
      />
    )
  }

  return (
    <hr
      role={isVertical ? 'separator' : undefined}
      aria-orientation={isVertical ? 'vertical' : undefined}
      aria-label={label}
      className={cn(
        styles.divider,
        isVertical ? styles.vertical : styles.horizontal,
        className
      )}
      data-orientation={orientation}
      {...props}
    />
  )
}

Divider.displayName = 'Divider'
