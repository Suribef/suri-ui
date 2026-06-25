import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './Input'

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: { layout: 'centered' }
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'usuario@ejemplo.com'
  }
}

export const WithHelperText: Story = {
  args: {
    label: 'Contraseña',
    type: 'password',
    helperText: 'Mínimo 8 caracteres, una mayúscula y un número'
  }
}

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'usuario@ejemplo.com',
    value: 'no-es-un-email',
    error: 'Ingresa un email válido',
    onChange: () => {}
  },
  parameters: {
    docs: {
      description: {
        story:
          'El error reemplaza al helperText y activa `aria-invalid`. ' +
          'El contenedor de descripción siempre está montado para que ' +
          '`aria-live` anuncie el error al aparecer dinámicamente.'
      }
    }
  }
}

export const Required: Story = {
  args: {
    label: 'Nombre completo',
    required: true,
    placeholder: 'Tu nombre'
  }
}

export const Disabled: Story = {
  args: {
    label: 'Email verificado',
    value: 'sergio@ejemplo.com',
    disabled: true,
    onChange: () => {}
  }
}
