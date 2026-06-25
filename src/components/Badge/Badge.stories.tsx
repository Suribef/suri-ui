import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: { layout: 'centered' }
}

export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: { children: 'Activo', variant: 'default' }
}

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Badge variant="default">Default</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
  parameters: { controls: { disable: true } }
}

export const DotMode: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Badge dot variant="success" aria-label="Usuario activo" />
      <Badge dot variant="warning" aria-label="Atención requerida" />
      <Badge dot variant="danger" aria-label="Error crítico" />
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Modo dot para indicadores de estado. ' +
          'Requiere `aria-label` obligatorio — sin él, ' +
          'el indicador es invisible para lectores de pantalla.'
      }
    }
  }
}
