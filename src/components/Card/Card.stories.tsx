import type { Meta, StoryObj } from '@storybook/react'
import { Card } from './Card'
import { Button } from '../Button'
import { Badge } from '../Badge'

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: { layout: 'centered' }
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  render: () => (
    <Card style={{ width: 320 }}>
      <Card.Header>
        <strong>Título de la tarjeta</strong>
      </Card.Header>
      <Card.Body>
        Contenido principal de la tarjeta. Puede incluir texto,
        imágenes u otros componentes.
      </Card.Body>
      <Card.Footer>
        <Button size="sm">Acción</Button>
      </Card.Footer>
    </Card>
  )
}

export const Elevations: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      {(['none', 'sm', 'md', 'lg'] as const).map((shadow) => (
        <Card key={shadow} shadow={shadow} style={{ width: 160, padding: 16 }}>
          shadow="{shadow}"
        </Card>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } }
}

export const WithDividers: Story = {
  render: () => (
    <Card style={{ width: 320 }}>
      <Card.Header divided>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <strong>Perfil</strong>
          <Badge variant="success">Activo</Badge>
        </div>
      </Card.Header>
      <Card.Body>Información del perfil de usuario.</Card.Body>
      <Card.Footer divided>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button size="sm" variant="ghost">Cancelar</Button>
          <Button size="sm">Guardar</Button>
        </div>
      </Card.Footer>
    </Card>
  ),
  parameters: { controls: { disable: true } }
}

export const AsArticle: Story = {
  render: () => (
    <Card as="article" style={{ width: 320 }}>
      <Card.Header>
        <strong>Post del blog</strong>
      </Card.Header>
      <Card.Body>
        Cuando Card envuelve contenido autocontenido (posts, productos,
        perfiles), usar as="article" para semántica HTML correcta.
      </Card.Body>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'La prop `as` permite elegir el elemento semántico correcto ' +
          'según el contexto. `article` para contenido autocontenido, ' +
          '`section` para secciones temáticas, `div` (default) para ' +
          'contenedores visuales sin semántica específica.'
      }
    }
  }
}
