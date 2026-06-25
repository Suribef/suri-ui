import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  // — Label y asociación —
  it('renders label associated to input via htmlFor', () => {
    render(<Input label="Email" />)
    const label = screen.getByText('Email')
    const input = screen.getByRole('textbox')
    expect(screen.getByLabelText('Email')).toBe(input)
    expect(label.tagName).toBe('LABEL')
  })

  it('renders without label when label prop is omitted', () => {
    render(<Input placeholder="Email" />)
    expect(screen.queryByRole('label')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  // — ID: generado vs explícito —
  it('uses provided id for label association', () => {
    render(<Input id="email-field" label="Email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'email-field')
    expect(screen.getByText('Email')).toHaveAttribute('for', 'email-field')
  })

  it('generates stable id when none is provided', () => {
    render(<Input label="Email" />)
    const input = screen.getByRole('textbox')
    const label = screen.getByText('Email')
    const inputId = input.getAttribute('id')
    expect(inputId).toBeTruthy()
    expect(label).toHaveAttribute('for', inputId)
  })

  // — Helper text —
  it('renders helper text', () => {
    render(<Input label="Email" helperText="Usaremos tu email para..." />)
    expect(screen.getByText('Usaremos tu email para...')).toBeInTheDocument()
  })

  it('links input to helper text via aria-describedby', () => {
    render(<Input label="Email" helperText="Texto de ayuda" />)
    const input = screen.getByRole('textbox')
    const descId = input.getAttribute('aria-describedby')
    expect(descId).toBeTruthy()
    expect(document.getElementById(descId!)).toHaveTextContent('Texto de ayuda')
  })

  it('does not set aria-describedby when no helper or error', () => {
    render(<Input label="Email" />)
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby')
  })

  // — Estado error —
  it('renders error message over helper text', () => {
    render(
      <Input
        label="Email"
        helperText="Texto de ayuda"
        error="Email inválido"
      />
    )
    expect(screen.getByText('Email inválido')).toBeInTheDocument()
    expect(screen.queryByText('Texto de ayuda')).not.toBeInTheDocument()
  })

  it('sets aria-invalid when error is present', () => {
    render(<Input label="Email" error="Email inválido" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not set aria-invalid when no error', () => {
    render(<Input label="Email" />)
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid')
  })

  it('sets data-error on wrapper when error is present', () => {
    const { container } = render(<Input label="Email" error="Error" />)
    expect(container.firstChild).toHaveAttribute('data-error')
  })

  // — Required —
  it('shows asterisk and sets aria-required when required', () => {
    render(<Input label="Email" required />)
    expect(screen.getByText('*', { exact: false })).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true')
    expect(screen.getByRole('textbox')).toBeRequired()
  })

  it('asterisk is aria-hidden', () => {
    render(<Input label="Email" required />)
    const asterisk = screen.getByText('*', { exact: false })
    expect(asterisk.closest('[aria-hidden="true"]')).toBeInTheDocument()
  })

  // — Disabled —
  it('disables the input natively', () => {
    render(<Input label="Email" disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('sets data-disabled on wrapper when disabled', () => {
    const { container } = render(<Input label="Email" disabled />)
    expect(container.firstChild).toHaveAttribute('data-disabled')
  })

  // — forwardRef —
  it('forwards ref to the input element', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input ref={ref} label="Email" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  // — fullWidth —
  it('sets data on wrapper for fullWidth', () => {
    const { container } = render(<Input fullWidth />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
