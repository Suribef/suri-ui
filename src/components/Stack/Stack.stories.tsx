import type { Meta, StoryObj } from '@storybook/react'
import { Stack } from './Stack'
import { Button } from '../Button'

const meta: Meta<typeof Stack> = {
  title: 'Components/Stack',
  component: Stack,
  tags: ['autodocs'],
  parameters: { layout: 'centered' }
}

export default meta
type Story = StoryObj<typeof Stack>

export const Vertical: Story = {
  render: () => (
    <Stack gap={3} style={{ width: 200 }}>
      <Button>Primero</Button>
      <Button variant="secondary">Segundo</Button>
      <Button variant="ghost">Tercero</Button>
    </Stack>
  )
}

export const Horizontal: Story = {
  render: () => (
    <Stack direction="row" gap={2} align="center">
      <Button size="sm">Uno</Button>
      <Button size="sm" variant="secondary">Dos</Button>
      <Button size="sm" variant="ghost">Tres</Button>
    </Stack>
  )
}

export const SpaceBetween: Story = {
  render: () => (
    <Stack direction="row" justify="between" fullWidth style={{ width: 400 }}>
      <Button variant="ghost">Cancelar</Button>
      <Button>Confirmar</Button>
    </Stack>
  )
}
