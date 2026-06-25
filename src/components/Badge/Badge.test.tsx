import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders children in text mode', () => {
    render(<Badge>Activo</Badge>)
    expect(screen.getByText('Activo')).toBeInTheDocument()
  })

  it('renders as a span element', () => {
    render(<Badge>Activo</Badge>)
    expect(screen.getByText('Activo').tagName).toBe('SPAN')
  })

  it('renders dot mode without visible text', () => {
    render(<Badge dot aria-label="3 notificaciones" />)
    expect(screen.queryByText('3 notificaciones')).not.toBeInTheDocument()
    expect(screen.getByLabelText('3 notificaciones')).toHaveAttribute('data-dot')
  })

  it('ignores children in dot mode', () => {
    render(<Badge dot aria-label="status">texto ignorado</Badge>)
    expect(screen.queryByText('texto ignorado')).not.toBeInTheDocument()
  })

  it('warns when dot mode is used without aria-label', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Badge dot />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('aria-label'))
    warn.mockRestore()
  })

  it('does not warn when dot mode has aria-label', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Badge dot aria-label="Online" />)
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('sets data-dot when dot is true', () => {
    render(<Badge dot aria-label="status" />)
    expect(screen.getByLabelText('status')).toHaveAttribute('data-dot')
  })

  it('does not set data-dot when dot is false', () => {
    render(<Badge>Texto</Badge>)
    expect(screen.getByText('Texto')).not.toHaveAttribute('data-dot')
  })

  const variants = ['default', 'success', 'warning', 'danger', 'info'] as const
  variants.forEach((variant) => {
    it(`renders variant "${variant}" without errors`, () => {
      render(<Badge variant={variant}>{variant}</Badge>)
      expect(screen.getByText(variant)).toBeInTheDocument()
    })
  })
})
