import { render, screen, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('renders a textarea element', () => {
    render(<Textarea label="Mensaje" />)
    expect(screen.getByRole('textbox')).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('renders 3 rows by default', () => {
    render(<Textarea />)
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '3')
  })

  it('associates label with textarea via htmlFor', () => {
    render(<Textarea label="Mensaje" />)
    expect(screen.getByLabelText('Mensaje')).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('renders required asterisk as aria-hidden', () => {
    render(<Textarea label="Mensaje" required />)
    const asterisk = screen.getByText('*', { exact: false })
    expect(asterisk.closest('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('always renders description container for aria-live', () => {
    render(<Textarea label="Mensaje" />)
    const textarea = screen.getByRole('textbox')
    const descId = textarea.getAttribute('aria-describedby')
    expect(descId).toBeTruthy()
    expect(document.getElementById(descId!)).toBeInTheDocument()
    expect(document.getElementById(descId!)).toBeEmptyDOMElement()
  })

  it('renders helper text in description container', () => {
    render(<Textarea helperText="Máximo 500 caracteres" />)
    expect(screen.getByText('Máximo 500 caracteres')).toBeInTheDocument()
  })

  it('renders error over helper text', () => {
    render(
      <Textarea
        helperText="Máximo 500 caracteres"
        error="Texto requerido"
      />
    )
    expect(screen.getByText('Texto requerido')).toBeInTheDocument()
    expect(screen.queryByText('Máximo 500 caracteres')).not.toBeInTheDocument()
  })

  it('sets aria-invalid when error is present', () => {
    render(<Textarea error="Error" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not set aria-invalid when no error', () => {
    render(<Textarea />)
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid')
  })

  it('disables the textarea natively', () => {
    render(<Textarea disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('sets data-disabled on wrapper', () => {
    const { container } = render(<Textarea disabled />)
    expect(container.firstChild).toHaveAttribute('data-disabled')
  })

  it('sets data-fullwidth when fullWidth is true', () => {
    const { container } = render(<Textarea fullWidth />)
    expect(container.firstChild).toHaveAttribute('data-fullwidth')
  })

  it('does not set data-fullwidth by default', () => {
    const { container } = render(<Textarea />)
    expect(container.firstChild).not.toHaveAttribute('data-fullwidth')
  })

  it('fires onChange when typing', () => {
    const onChange = vi.fn()
    render(<Textarea onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Hola' }
    })
    expect(onChange).toHaveBeenCalledOnce()
  })

  it('forwards ref to the textarea element', () => {
    const ref = createRef<HTMLTextAreaElement>()
    render(<Textarea ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('ref external works alongside autoResize internal ref', () => {
    const ref = createRef<HTMLTextAreaElement>()
    render(<Textarea ref={ref} autoResize value="" onChange={() => {}} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })
})
