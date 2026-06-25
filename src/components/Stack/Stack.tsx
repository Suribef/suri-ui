import { forwardRef } from 'react'
import type { ElementType, HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import styles from './Stack.module.css'

type StackElement = 'div' | 'ul' | 'ol' | 'nav' | 'section' | 'main'
type GapScale = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12

export interface StackProps extends HTMLAttributes<HTMLElement> {
  as?: StackElement
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  gap?: GapScale
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
  fullWidth?: boolean
  fullHeight?: boolean
}

export const Stack = forwardRef<HTMLElement, StackProps>(
  (
    {
      as: Element = 'div',
      direction = 'column',
      gap = 4,
      align,
      justify,
      wrap = false,
      fullWidth = false,
      fullHeight = false,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const AnyElement = Element as ElementType

    // Gap via CSS custom property inline — evita generar una clase por valor
    const gapValue = `var(--sui-space-${gap})`

    return (
      <AnyElement
        ref={ref}
        className={cn(
          styles.stack,
          styles[`direction-${direction}`],
          align && styles[`align-${align}`],
          justify && styles[`justify-${justify}`],
          wrap && styles.wrap,
          fullWidth && styles.fullWidth,
          fullHeight && styles.fullHeight,
          className
        )}
        style={{ '--sui-stack-gap': gapValue, ...style } as React.CSSProperties}
        data-direction={direction}
        data-fullwidth={fullWidth || undefined}
        data-fullheight={fullHeight || undefined}
        {...props}
      >
        {children}
      </AnyElement>
    )
  }
)

Stack.displayName = 'Stack'
