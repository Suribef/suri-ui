# SuriUI

React component library built with TypeScript, CSS Modules, and
zero runtime dependencies.

[![npm version](https://img.shields.io/npm/v/@suribef/suri-ui)](https://www.npmjs.com/package/@suribef/suri-ui)
[![CI](https://github.com/Suribef/suri-ui/actions/workflows/test.yml/badge.svg)](https://github.com/Suribef/suri-ui/actions)

---

## Installation

```bash
npm install @suribef/suri-ui
```

**Peer dependencies** — install if not already present:

```bash
npm install react react-dom
```

---

## Setup

Import the design tokens once at your app's entry point:

```ts
// main.tsx or App.tsx
import '@suribef/suri-ui/dist/suri-ui.css'
```

This registers the CSS custom properties (colors, spacing, radius,
typography) that all components depend on. Without this import,
components render without styles.

---

## Components

### Button

```tsx
import { Button } from '@suribef/suri-ui'

<Button variant="primary" size="md" onClick={handleClick}>
  Save changes
</Button>

<Button loading>Saving...</Button>

<Button variant="danger" disabled>Delete</Button>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `primary \| secondary \| ghost \| danger` | `primary` | Visual style |
| size | `sm \| md \| lg` | `md` | Height and padding scale |
| loading | `boolean` | `false` | Shows spinner, blocks clicks, keeps focus |
| disabled | `boolean` | `false` | Native disabled, removes from tab order |
| fullWidth | `boolean` | `false` | 100% container width |
| leftIcon | `ReactNode` | — | Icon before label |
| rightIcon | `ReactNode` | — | Icon after label |

> **Accessibility note:** `loading` uses `aria-disabled` (not native
> `disabled`) so the button stays focusable while the operation runs.
> Screen readers announce "busy" to communicate the active state.

---

### Badge

```tsx
import { Badge } from '@suribef/suri-ui'

<Badge variant="success">Active</Badge>

{/* Dot mode — aria-label required */}
<Badge dot variant="danger" aria-label="3 unread notifications" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `default \| success \| warning \| danger \| info` | `default` | Semantic color |
| size | `sm \| md` | `md` | Height scale |
| dot | `boolean` | `false` | Visual indicator mode, no text rendered |

> **Accessibility note:** Dot mode without `aria-label` logs a
> development warning. The label is required for screen reader users.

---

### Spinner

```tsx
import { Spinner } from '@suribef/suri-ui'

<Spinner />
<Spinner size="lg" label="Loading dashboard..." />

{/* For critical operations that need immediate announcement */}
<Spinner aria-live="assertive" label="Processing payment..." />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `sm \| md \| lg` | `md` | Visual size |
| label | `string` | `Cargando...` | Screen reader text |
| aria-live | `polite \| assertive` | `polite` | Announcement urgency |

---

### Input

```tsx
import { Input } from '@suribef/suri-ui'

<Input
  label="Email"
  placeholder="you@example.com"
  helperText="We'll never share your email"
/>

<Input
  label="Email"
  value={email}
  error={errors.email}
  onChange={e => setEmail(e.target.value)}
  required
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | — | Visible label, auto-associated via `useId()` |
| helperText | `string` | — | Hint text below the input |
| error | `string` | — | Error message, replaces helperText |
| fullWidth | `boolean` | `false` | 100% container width |

Extends all native `<input>` props. Compatible with React Hook Form
and other form libraries via `forwardRef`.

---

### Textarea

```tsx
import { Textarea } from '@suribef/suri-ui'

<Textarea label="Message" rows={4} />

<Textarea
  label="Notes"
  autoResize
  placeholder="Grows as you type..."
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | — | Visible label |
| helperText | `string` | — | Hint text |
| error | `string` | — | Error message |
| rows | `number` | `3` | Initial visible lines |
| resize | `none \| vertical \| horizontal \| both` | `vertical` | Resize handle |
| autoResize | `boolean` | `false` | Grows with content via scrollHeight |

---

### Select

```tsx
import { Select } from '@suribef/suri-ui'
import type { SelectItem } from '@suribef/suri-ui'

const options: SelectItem[] = [
  { value: 'mx', label: 'Mexico' },
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada', disabled: true }
]

<Select
  label="Country"
  options={options}
  placeholder="Select a country"
/>
```

Grouped options:

```tsx
const grouped: SelectItem[] = [
  {
    group: 'North America',
    options: [
      { value: 'mx', label: 'Mexico' },
      { value: 'us', label: 'United States' }
    ]
  },
  {
    group: 'Europe',
    options: [{ value: 'es', label: 'Spain' }]
  }
]
```

> **Implementation note:** Select uses the native `<select>` element
> with a CSS reset and custom chevron. This gives mobile users the
> native picker (optimal UX on iOS/Android) and guaranteed keyboard
> accessibility. A fully custom listbox is planned for v2.0.

---

### Card

```tsx
import { Card } from '@suribef/suri-ui'

<Card>
  <Card.Header divided>
    <strong>Card title</strong>
  </Card.Header>
  <Card.Body>Content goes here.</Card.Body>
  <Card.Footer divided>
    <Button size="sm">Action</Button>
  </Card.Footer>
</Card>

{/* Semantic element */}
<Card as="article" shadow="md">
  <Card.Body>Blog post content</Card.Body>
</Card>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| as | `div \| article \| section \| main` | `div` | Semantic element |
| shadow | `none \| sm \| md \| lg` | `sm` | Elevation level |
| bordered | `boolean` | `true` | Border visibility |
| fullWidth | `boolean` | `false` | 100% container width |

> **Layout note:** Card has no padding — subcomponents (Header, Body,
> Footer) own their padding. This allows full-bleed images and colored
> headers without consumer overrides.

---

### Stack

```tsx
import { Stack } from '@suribef/suri-ui'

{/* Vertical stack */}
<Stack gap={4}>
  <Input label="First name" />
  <Input label="Last name" />
  <Button>Submit</Button>
</Stack>

{/* Horizontal with alignment */}
<Stack direction="row" align="center" justify="between">
  <span>Label</span>
  <Button size="sm">Action</Button>
</Stack>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| as | `div \| ul \| ol \| nav \| section \| main` | `div` | Semantic element |
| direction | `row \| column \| row-reverse \| column-reverse` | `column` | Flex direction |
| gap | `1–12` | `4` | Spacing scale token |
| align | `start \| center \| end \| stretch \| baseline` | — | align-items |
| justify | `start \| center \| end \| between \| around \| evenly` | — | justify-content |

---

### Divider

```tsx
import { Divider } from '@suribef/suri-ui'

{/* Semantic — screen readers announce "separator" */}
<Divider />

{/* Decorative — invisible to assistive technology */}
<Divider decorative />

{/* Vertical — for toolbars and navbars */}
<Divider orientation="vertical" />
```

---

## Theming

Override any token in your CSS to customize globally:

```css
:root {
  --sui-color-primary: #0070f3;
  --sui-color-primary-hover: #0060df;
  --sui-radius-md: 4px;
}
```

Full token list in
[src/tokens/index.css](./src/tokens/index.css).

---

## Contributing

```bash
git clone https://github.com/Suribef/suri-ui
npm install
npm test          # 118 tests
npm run storybook # Component explorer on localhost:6006
npm run build     # Verify dist output
```

Architecture decisions are documented in
[docs/decisions/](./docs/decisions/).

---

## License

MIT © [Sergio Uribe](https://github.com/Suribef)
