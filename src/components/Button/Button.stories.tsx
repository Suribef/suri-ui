import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
      description: 'Variante visual del botón'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Tamaño del botón'
    },
    loading: {
      control: 'boolean',
      description:
        'Estado de carga. Usa aria-disabled (no disabled nativo) ' +
        'para mantener el botón en el tab order.'
    },
    disabled: {
      control: 'boolean',
      description:
        'Deshabilita el botón nativamente. ' +
        'A diferencia de loading, lo saca del tab order.'
    },
    fullWidth: {
      control: 'boolean',
      description: 'Ocupa el 100% del ancho del contenedor'
    }
  }
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: 'Botón primario',
    variant: 'primary',
    size: 'md'
  }
}

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
  parameters: { controls: { disable: true } }
}

export const Loading: Story = {
  args: {
    children: 'Guardando...',
    loading: true
  },
  parameters: {
    docs: {
      description: {
        story:
          'En estado `loading`, el botón usa `aria-disabled` en lugar de ' +
          '`disabled` nativo. Permanece en el tab order para que usuarios ' +
          'de teclado puedan navegar hasta él y leer el estado.'
      }
    }
  }
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
  parameters: { controls: { disable: true } }
}

export const Disabled: Story = {
  args: {
    children: 'No disponible',
    disabled: true
  }
}
