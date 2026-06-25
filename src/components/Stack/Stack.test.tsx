import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { Stack } from './Stack'

describe('Stack', () => {
  it('renders as div by default', () => {
    const { container } = render(<Stack>Contenido</Stack>)
    expect(container.firstChild?.nodeName).toBe('DIV')
  })

  it('renders as ul when as="ul"', () => {
    const { container } = render(<Stack as="ul"><li>Item</li></Stack>)
    expect(container.firstChild?.nodeName).toBe('UL')
  })

  it('renders as nav when as="nav"', () => {
    render(<Stack as="nav" aria-label="Navegación">Links</Stack>)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('applies gap as CSS custom property', () => {
    const { container } = render(<Stack gap={6}>Contenido</Stack>)
    const el = container.firstChild as HTMLElement
    expect(el.style.getPropertyValue('--sui-stack-gap')).toBe('var(--sui-space-6)')
  })

  it('uses gap=4 by default', () => {
    const { container } = render(<Stack>Contenido</Stack>)
    const el = container.firstChild as HTMLElement
    expect(el.style.getPropertyValue('--sui-stack-gap')).toBe('var(--sui-space-4)')
  })

  it('sets data-direction attribute', () => {
    const { container } = render(<Stack direction="row">Contenido</Stack>)
    expect(container.firstChild).toHaveAttribute('data-direction', 'row')
  })

  it('sets data-fullwidth when fullWidth is true', () => {
    const { container } = render(<Stack fullWidth>Contenido</Stack>)
    expect(container.firstChild).toHaveAttribute('data-fullwidth')
  })

  it('does not set data-fullwidth by default', () => {
    const { container } = render(<Stack>Contenido</Stack>)
    expect(container.firstChild).not.toHaveAttribute('data-fullwidth')
  })

  it('sets data-fullheight when fullHeight is true', () => {
    const { container } = render(<Stack fullHeight>Contenido</Stack>)
    expect(container.firstChild).toHaveAttribute('data-fullheight')
  })

  it('renders children', () => {
    render(
      <Stack>
        <span>Hijo 1</span>
        <span>Hijo 2</span>
      </Stack>
    )
    expect(screen.getByText('Hijo 1')).toBeInTheDocument()
    expect(screen.getByText('Hijo 2')).toBeInTheDocument()
  })

  it('forwards ref to the underlying element', () => {
    const ref = createRef<HTMLElement>()
    render(<Stack ref={ref}>Contenido</Stack>)
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })

  it('merges custom style with gap property', () => {
    const { container } = render(
      <Stack gap={2} style={{ color: 'red' }}>Contenido</Stack>
    )
    const el = container.firstChild as HTMLElement
    expect(el.style.color).toBe('red')
    expect(el.style.getPropertyValue('--sui-stack-gap')).toBe('var(--sui-space-2)')
  })
})
