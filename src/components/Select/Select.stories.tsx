import type { Meta, StoryObj } from '@storybook/react'
import { Select } from './Select'
import type { SelectItem } from './Select'

const countries: SelectItem[] = [
  { value: 'mx', label: 'México' },
  { value: 'us', label: 'Estados Unidos' },
  { value: 'ca', label: 'Canadá' }
]

const grouped: SelectItem[] = [
  {
    group: 'América',
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

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: { layout: 'centered' }
}

export default meta
type Story = StoryObj<typeof Select>

export const Default: Story = {
  args: {
    label: 'País',
    options: countries,
    placeholder: 'Selecciona un país'
  }
}

export const Grouped: Story = {
  args: {
    label: 'País',
    options: grouped,
    placeholder: 'Selecciona un país'
  }
}

export const WithError: Story = {
  args: {
    label: 'País',
    options: countries,
    placeholder: 'Selecciona un país',
    error: 'Selecciona un país para continuar'
  }
}
