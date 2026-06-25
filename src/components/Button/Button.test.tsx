import { render, screen, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not call onClick when natively disabled', () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('uses native disabled (not aria-disabled) for disabled state', () => {
    render(<Button disabled>Click</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn).not.toHaveAttribute('aria-disabled')
  })

  it('uses aria-disabled (not native disabled) for loading state', () => {
    render(<Button loading>Submit</Button>)
    const btn = screen.getByRole('button')
    expect(btn).not.toBeDisabled()
    expect(btn).toHaveAttribute('aria-disabled', 'true')
    expect(btn).toHaveAttribute('aria-busy', 'true')
  })

  it('blocks onClick in loading state', () => {
    const onClick = vi.fn()
    render(<Button loading onClick={onClick}>Submit</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('sets data-fullwidth attribute when fullWidth is true', () => {
    render(<Button fullWidth>Submit</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-fullwidth')
  })

  it('sets data-loading attribute when loading is true', () => {
    render(<Button loading>Submit</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-loading')
  })

  it('forwards ref to the underlying button element', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Ref test</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
})
