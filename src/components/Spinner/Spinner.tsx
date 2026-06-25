import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import styles from './Spinner.module.css'

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  'aria-live'?: 'polite' | 'assertive'
}

export function Spinner({
  size = 'md',
  label = 'Cargando...',
  'aria-live': ariaLive = 'polite',
  className,
  ...props
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-live={ariaLive}
      className={cn(styles.spinner, styles[size], className)}
      {...props}
    >
      <svg
        className={styles.svg}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          className={styles.track}
          cx="12"
          cy="12"
          r="10"
          strokeWidth="3"
        />
        <path
          className={styles.head}
          d="M12 2a10 10 0 0 1 10 10"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span className="sui-sr-only">{label}</span>
    </span>
  )
}

Spinner.displayName = 'Spinner'
