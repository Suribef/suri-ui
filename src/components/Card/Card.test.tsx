import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { Card, CardHeader, CardBody, CardFooter } from './Card'

describe('Card', () => {
  // — Elemento base —
  it('renders as div by default', () => {
    const { container } = render(<Card>Contenido</Card>)
    expect(container.firstChild?.nodeName).toBe('DIV')
  })

  it('renders as article when as="article"', () => {
    const { container } = render(<Card as="article">Contenido</Card>)
    expect(container.firstChild?.nodeName).toBe('ARTICLE')
  })

  it('renders as section when as="section"', () => {
    const { container } = render(<Card as="section">Contenido</Card>)
    expect(container.firstChild?.nodeName).toBe('SECTION')
  })

  // — Data attributes (no clases hasheadas) —
  it('sets data-shadow attribute', () => {
    const { container } = render(<Card shadow="md">Contenido</Card>)
    expect(container.firstChild).toHaveAttribute('data-shadow', 'md')
  })

  it('sets data-bordered when bordered is true', () => {
    const { container } = render(<Card bordered>Contenido</Card>)
    expect(container.firstChild).toHaveAttribute('data-bordered')
  })

  it('does not set data-bordered when bordered is false', () => {
    const { container } = render(<Card bordered={false}>Contenido</Card>)
    expect(container.firstChild).not.toHaveAttribute('data-bordered')
  })

  it('sets data-fullwidth when fullWidth is true', () => {
    const { container } = render(<Card fullWidth>Contenido</Card>)
    expect(container.firstChild).toHaveAttribute('data-fullwidth')
  })

  it('does not set data-fullwidth when fullWidth is false', () => {
    const { container } = render(<Card>Contenido</Card>)
    expect(container.firstChild).not.toHaveAttribute('data-fullwidth')
  })

  // — forwardRef —
  it('forwards ref to the underlying element', () => {
    const ref = createRef<HTMLElement>()
    render(<Card ref={ref}>Contenido</Card>)
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })

  // — Composición con subcomponentes —
  it('renders children correctly', () => {
    render(
      <Card>
        <CardHeader>Título</CardHeader>
        <CardBody>Cuerpo</CardBody>
        <CardFooter>Footer</CardFooter>
      </Card>
    )
    expect(screen.getByText('Título')).toBeInTheDocument()
    expect(screen.getByText('Cuerpo')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })
})

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader>Título</CardHeader>)
    expect(screen.getByText('Título')).toBeInTheDocument()
  })

  it('sets data-divided when divided is true', () => {
    const { container } = render(<CardHeader divided>Título</CardHeader>)
    expect(container.firstChild).toHaveAttribute('data-divided')
  })

  it('does not set data-divided by default', () => {
    const { container } = render(<CardHeader>Título</CardHeader>)
    expect(container.firstChild).not.toHaveAttribute('data-divided')
  })
})

describe('CardBody', () => {
  it('renders children', () => {
    render(<CardBody>Contenido del cuerpo</CardBody>)
    expect(screen.getByText('Contenido del cuerpo')).toBeInTheDocument()
  })
})

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter>Footer</CardFooter>)
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('sets data-divided when divided is true', () => {
    const { container } = render(<CardFooter divided>Footer</CardFooter>)
    expect(container.firstChild).toHaveAttribute('data-divided')
  })
})
