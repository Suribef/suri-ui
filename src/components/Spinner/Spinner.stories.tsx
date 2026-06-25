import type { Meta, StoryObj } from '@storybook/react'
import { Spinner } from './Spinner'

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: { layout: 'centered' }
}

export default meta
type Story = StoryObj<typeof Spinner>

export const Default: Story = {
  args: { size: 'md', label: 'Cargando...' }
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <Spinner size="sm" label="Cargando" />
      <Spinner size="md" label="Cargando" />
      <Spinner size="lg" label="Cargando" />
    </div>
  ),
  parameters: { controls: { disable: true } }
}

export const CriticalOperation: Story = {
  args: {
    size: 'md',
    label: 'Procesando pago...',
    'aria-live': 'assertive'
  },
  parameters: {
    docs: {
      description: {
        story:
          '`aria-live="assertive"` interrumpe al lector de pantalla ' +
          'inmediatamente. Reservar para operaciones críticas e irreversibles ' +
          '(pagos, eliminaciones). Para carga en background usar `polite`.'
      }
    }
  }
}
