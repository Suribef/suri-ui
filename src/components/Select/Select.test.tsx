import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { Select } from './Select'
import type { SelectItem } from './Select'

const flatOptions: SelectItem[] = [
  { value: 'mx', label: 'México' },
  { value: 'us', label: 'Estados Unidos' },
  { value: 'ca', label: 'Canadá', disabled: true }
]

const groupedOptions: SelectItem[] = [
  {
    group: 'América del Norte',
    options: [
      { value: 'mx', label: 'México' },
      { value: 'us', label: 'Estados Unidos' }
    ]
  },
  {
    group: 'Europa',
    options: [
      { value: 'es', label: 'España' },
      { value: 'de', label: 'Alemania' }
    ]
  }
]

describe('Select', () => {
  it('renders a select element', () => {
    render(<Select options={flatOptions} label="País" />)
    expect(screen.getByRole('combobox')).toBeInstanceOf(HTMLSelectElement)
  })

  it('renders flat options', () => {
    render(<Select options={flatOptions} />)
    expect(screen.getByRole('option', { name: 'México' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Estados Unidos' })).toBeInTheDocument()
  })

  it('renders disabled option', () => {
    render(<Select options={flatOptions} />)
    expect(screen.getByRole('option', { name: 'Canadá' })).toBeDisabled()
  })

  it('renders placeholder as first disabled hidden option', () => {
    const { container } = render(
      <Select options={flatOptions} placeholder="Selecciona un país" />
    )
    // hidden options are excluded from the ARIA tree — query via DOM
    const placeholder = container.querySelector('option[value=""]')
    expect(placeholder).toBeInTheDocument()
    expect(placeholder).toBeDisabled()
    expect(placeholder).toHaveAttribute('hidden')
    expect(placeholder).toHaveTextContent('Selecciona un país')
  })

  it('does not render placeholder option when not provided', () => {
    render(<Select options={flatOptions} />)
    expect(screen.queryByRole('option', { name: /selecciona/i })).not.toBeInTheDocument()
  })

  it('renders grouped options via optgroup', () => {
    const { container } = render(<Select options={groupedOptions} />)
    const groups = container.querySelectorAll('optgroup')
    expect(groups).toHaveLength(2)
    expect(groups[0]).toHaveAttribute('label', 'América del Norte')
    expect(groups[1]).toHaveAttribute('label', 'Europa')
  })

  it('renders options inside groups', () => {
    render(<Select options={groupedOptions} />)
    expect(screen.getByRole('option', { name: 'España' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Alemania' })).toBeInTheDocument()
  })

  it('associates label with select via htmlFor', () => {
    render(<Select options={flatOptions} label="País" />)
    expect(screen.getByLabelText('País')).toBeInstanceOf(HTMLSelectElement)
  })

  it('renders required asterisk as aria-hidden', () => {
    render(<Select options={flatOptions} label="País" required />)
    const asterisk = screen.getByText('*', { exact: false })
    expect(asterisk.closest('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('always renders description container for aria-live', () => {
    render(<Select options={flatOptions} label="País" />)
    const select = screen.getByRole('combobox')
    const descId = select.getAttribute('aria-describedby')
    expect(descId).toBeTruthy()
    expect(document.getElementById(descId!)).toBeEmptyDOMElement()
  })

  it('renders error message', () => {
    render(<Select options={flatOptions} error="Selecciona un país" />)
    expect(screen.getByText('Selecciona un país')).toBeInTheDocument()
  })

  it('sets aria-invalid when error is present', () => {
    render(<Select options={flatOptions} error="Error" />)
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not set aria-invalid when no error', () => {
    render(<Select options={flatOptions} />)
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid')
  })

  it('disables the select natively', () => {
    render(<Select options={flatOptions} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('sets data-disabled on wrapper', () => {
    const { container } = render(<Select options={flatOptions} disabled />)
    expect(container.firstChild).toHaveAttribute('data-disabled')
  })

  it('sets data-fullwidth when fullWidth is true', () => {
    const { container } = render(<Select options={flatOptions} fullWidth />)
    expect(container.firstChild).toHaveAttribute('data-fullwidth')
  })

  it('sets data-error when error is present', () => {
    const { container } = render(<Select options={flatOptions} error="Error" />)
    expect(container.firstChild).toHaveAttribute('data-error')
  })

  it('forwards ref to the select element', () => {
    const ref = createRef<HTMLSelectElement>()
    render(<Select options={flatOptions} ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLSelectElement)
  })
})
