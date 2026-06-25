import type { Preview } from '@storybook/react'
import '../src/tokens/index.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    a11y: {
      config: {
        rules: [
          {
            // color-contrast se evalúa manualmente — los tokens
            // light-mode pasan, pero no tenemos dark mode en v0.1.0
            id: 'color-contrast',
            enabled: false
          }
        ]
      }
    }
  }
}

export default preview
