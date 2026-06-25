import { forwardRef } from 'react'
import type { ElementType, HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import styles from './Card.module.css'

type CardElement = 'div' | 'article' | 'section' | 'main'

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: CardElement
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  bordered?: boolean
  fullWidth?: boolean
}

// Tipo extendido para incluir subcomponentes en la firma pública
type CardType = ReturnType<typeof forwardRef<HTMLElement, CardProps>> & {
  Header: typeof CardHeader
  Body: typeof CardBody
  Footer: typeof CardFooter
}

const CardBase = forwardRef<HTMLElement, CardProps>(
  (
    {
      as: Element = 'div',
      shadow = 'sm',
      bordered = true,
      fullWidth = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // ElementType resuelve el conflicto de tipos para elementos dinámicos
    // sin mentirle al compilador sobre el tipo concreto del nodo DOM.
    // Casting Element (no ref) es el patrón correcto para uniones acotadas.
    const AnyElement = Element as ElementType

    return (
      <AnyElement
        ref={ref}
        className={cn(
          styles.card,
          shadow !== 'none' && styles[`shadow-${shadow}`],
          bordered && styles.bordered,
          fullWidth && styles.fullWidth,
          className
        )}
        data-shadow={shadow}
        data-bordered={bordered || undefined}
        data-fullwidth={fullWidth || undefined}
        {...props}
      >
        {children}
      </AnyElement>
    )
  }
)

CardBase.displayName = 'Card'

// ─── Subcomponentes ────────────────────────────────────────────

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  divided?: boolean
}

export function CardHeader({
  divided = false,
  className,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn(styles.header, divided && styles.headerDivided, className)}
      data-divided={divided || undefined}
      {...props}
    >
      {children}
    </div>
  )
}

CardHeader.displayName = 'Card.Header'

// Type alias en lugar de interface vacía — evita no-empty-interface lint error
export type CardBodyProps = HTMLAttributes<HTMLDivElement>

export function CardBody({ className, children, ...props }: CardBodyProps) {
  return (
    <div className={cn(styles.body, className)} {...props}>
      {children}
    </div>
  )
}

CardBody.displayName = 'Card.Body'

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  divided?: boolean
}

export function CardFooter({
  divided = false,
  className,
  children,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={cn(styles.footer, divided && styles.footerDivided, className)}
      data-divided={divided || undefined}
      {...props}
    >
      {children}
    </div>
  )
}

CardFooter.displayName = 'Card.Footer'

// Adjuntar subcomponentes y exportar con el tipo correcto
export const Card = CardBase as CardType
Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter
