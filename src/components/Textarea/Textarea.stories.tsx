import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from './Textarea'

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: { layout: 'centered' }
}

export default meta
type Story = StoryObj<typeof Textarea>

export const Default: Story = {
  args: {
    label: 'Mensaje',
    placeholder: 'Escribe tu mensaje aquí...',
    rows: 4
  }
}

export const WithError: Story = {
  args: {
    label: 'Descripción',
    error: 'La descripción es requerida',
    rows: 3
  }
}

export const AutoResize: Story = {
  args: {
    label: 'Notas',
    autoResize: true,
    placeholder: 'Escribe y el campo crece automáticamente...',
    rows: 2
  },
  parameters: {
    docs: {
      description: {
        story:
          '`autoResize` calcula la altura via `scrollHeight`. ' +
          'Desactiva `resize` manual automáticamente para evitar ' +
          'conflictos visuales.'
      }
    }
  }
}
