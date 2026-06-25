import type { Meta, StoryObj } from '@storybook/react'
import { Divider } from './Divider'

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
}

export default meta
type Story = StoryObj<typeof Divider>

export const Semantic: Story = {
  render: () => (
    <div style={{ width: 300 }}>
      <p>Sección A</p>
      <Divider />
      <p>Sección B</p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Usa `<hr>` semántico. Screen readers anuncian "separador".'
      }
    }
  }
}

export const Decorative: Story = {
  render: () => (
    <div style={{ width: 300 }}>
      <p>Elemento visual</p>
      <Divider decorative />
      <p>Otro elemento</p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Modo decorativo: `aria-hidden="true"`. ' +
          'Invisible para lectores de pantalla.'
      }
    }
  }
}

export const Vertical: Story = {
  render: () => (
    <div style={{ display: 'flex', height: 40, alignItems: 'center', gap: 12 }}>
      <span>Inicio</span>
      <Divider orientation="vertical" />
      <span>Acerca de</span>
      <Divider orientation="vertical" />
      <span>Contacto</span>
    </div>
  )
}
