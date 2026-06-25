import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import styles from './Badge.module.css'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
  dot?: boolean
}

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  className,
  ...props
}: BadgeProps) {
  if (process.env.NODE_ENV !== 'production') {
    if (dot && !props['aria-label']) {
      console.warn(
        '[SuriUI Badge] El modo dot requiere aria-label para accesibilidad. ' +
        'Ejemplo: <Badge dot aria-label="3 notificaciones" />'
      )
    }
  }

  return (
    <span
      className={cn(
        styles.badge,
        styles[variant],
        styles[size],
        dot && styles.dot,
        className
      )}
      data-dot={dot || undefined}
      {...props}
    >
      {!dot && children}
    </span>
  )
}

Badge.displayName = 'Badge'
