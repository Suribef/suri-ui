import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Divider } from './Divider'

describe('Divider', () => {
  it('renders as hr by default (semantic separator)', () => {
    render(<Divider />)
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('renders as div with aria-hidden when decorative', () => {
    const { container } = render(<Divider decorative />)
    const el = container.firstChild as HTMLElement
    expect(el.tagName).toBe('DIV')
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el).not.toHaveAttribute('role')
  })

  it('decorative divider is not in the accessibility tree', () => {
    render(<Divider decorative />)
    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
  })

  it('sets data-orientation="horizontal" by default', () => {
    const { container } = render(<Divider />)
    expect(container.firstChild).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('sets data-orientation="vertical" when vertical', () => {
    const { container } = render(<Divider orientation="vertical" />)
    expect(container.firstChild).toHaveAttribute('data-orientation', 'vertical')
  })

  it('adds aria-orientation when vertical and semantic', () => {
    render(<Divider orientation="vertical" />)
    const el = screen.getByRole('separator')
    expect(el).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('renders with aria-label when label is provided', () => {
    render(<Divider label="O continúa con" />)
    expect(screen.getByRole('separator')).toHaveAttribute('aria-label', 'O continúa con')
  })

  it('sets data-decorative on decorative dividers', () => {
    const { container } = render(<Divider decorative />)
    expect(container.firstChild).toHaveAttribute('data-decorative', 'true')
  })
})
