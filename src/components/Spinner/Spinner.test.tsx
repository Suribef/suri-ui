import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('has role="status"', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders default label text for screen readers', () => {
    render(<Spinner />)
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('renders custom label for screen readers', () => {
    render(<Spinner label="Procesando pago..." />)
    expect(screen.getByText('Procesando pago...')).toBeInTheDocument()
  })

  it('renders an SVG marked as aria-hidden', () => {
    const { container } = render(<Spinner />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('focusable', 'false')
  })

  it('uses aria-live="polite" by default', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })

  it('accepts aria-live="assertive" for critical operations', () => {
    render(<Spinner aria-live="assertive" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'assertive')
  })

  it('passes additional props to the container', () => {
    render(<Spinner data-testid="my-spinner" />)
    expect(screen.getByTestId('my-spinner')).toBeInTheDocument()
  })

  it('accepts custom className', () => {
    render(<Spinner data-testid="sp" className="custom" />)
    expect(screen.getByTestId('sp')).toHaveClass('custom')
  })
})
