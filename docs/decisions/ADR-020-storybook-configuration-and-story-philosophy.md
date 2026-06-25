# ADR-020 · Storybook: configuración, filosofía de stories y estrategia de documentación

| Campo       | Valor                          |
|-------------|--------------------------------|
| **Estado**  | Aceptado                       |
| **Fecha**   | 2026-06                        |
| **Autores** | Sergio Uribe Frenkel           |
| **Proyecto**| SuriUI — `@suribef/suri-ui`    |
| **Componentes afectados** | Todos (documentación) |
| **Referencia previa** | README — "Decisiones pendientes de documentar (Storybook)" |

---

## Contexto

SuriUI necesita una herramienta de documentación visual que permita a los consumidores explorar los componentes, sus variantes, y su comportamiento accesible sin necesidad de leer el código fuente. Storybook es el estándar de facto del ecosistema React para este propósito.

Las decisiones de configuración de Storybook no son triviales: determinan la calidad de la documentación generada, el overhead de mantenimiento, y la señal que proyecta el portafolio.

---

## Decisión 1: stories representativas vs exhaustivas

### Enfoque exhaustivo

```
Button.Primary.Sm
Button.Primary.Md
Button.Primary.Lg
Button.Secondary.Sm
Button.Secondary.Md
Button.Secondary.Lg
Button.Ghost.Sm
...
→ 36+ stories solo para Button
```

Genera cobertura completa de combinaciones de props. Útil principalmente como insumo para **QA visual automatizado con Chromatic** — donde cada story es una screenshot que puede compararse contra una baseline.

### Enfoque representativo

```
Button.Default        → caso más común sin configuración
Button.Variants       → todas las variantes en contexto visual
Button.Loading        → estado con implicaciones de a11y documentadas
Button.Sizes          → los tres tamaños en comparación
Button.Disabled       → distinción semántica disabled vs loading
→ 5 stories por componente
```

Muestra **intención de uso** — cómo el consumidor debería usar el componente, no todas las formas matemáticamente posibles de usarlo.

### Decisión

**Enfoque representativo: 4–6 stories por componente.**

**Razonamiento:** SuriUI v1.0 no usa Chromatic. Sin QA visual automatizado, el enfoque exhaustivo genera ruido sin beneficio — el consumidor que navega Storybook ve 40 stories de Button y no puede discernir qué es importante. El enfoque representativo **demuestra criterio editorial**: el autor de la librería sabe cuáles son los casos de uso relevantes y los muestra explícitamente.

Un portafolio con 5 stories bien elegidas por componente comunica más sobre el entendimiento del dominio que 40 stories generadas mecánicamente.

**Criterios para elegir qué stories incluir:**

1. **Default** — el caso más común; sin props opcionales o con valores por defecto
2. **Estado significativo** — loading, error, disabled: estados con implicaciones de a11y documentadas en la story
3. **Comparación de variantes** — todas las variantes juntas en un solo render para comparación visual
4. **Composición** — si el componente se usa típicamente con otros componentes de SuriUI
5. **Decisión no obvia** — cuando hay una prop cuya semántica no es intuitiva y merece documentación inline

---

## Decisión 2: `autodocs: 'tag'` para documentación de props

### Opciones de documentación

| Opción | Descripción |
|--------|-------------|
| `autodocs: false` | Sin página de docs automática; solo stories manuales |
| `autodocs: true` | Página de docs generada automáticamente para todo |
| `autodocs: 'tag'` | Página de docs solo para archivos con `tags: ['autodocs']` |

### Decisión

**`autodocs: 'tag'` con `tags: ['autodocs']` en cada story file.**

```ts
// .storybook/main.ts
docs: {
  autodocs: 'tag'
}

// Button.stories.tsx
const meta: Meta<typeof Button> = {
  tags: ['autodocs'],  // ← opt-in por componente
}
```

**Razonamiento:**

`autodocs` genera automáticamente una tabla de props directamente desde los tipos de TypeScript:

```
Prop        Tipo                    Default    Descripción
variant     'primary'|'secondary'   'primary'  Variante visual del botón
size        'sm'|'md'|'lg'          'md'       Tamaño del botón
loading     boolean                 false      Estado de carga...
```

Esto implementa el principio de **fuente de verdad única**: los tipos de TypeScript son la documentación. Cuando se agrega una prop o se cambia un tipo, la documentación se actualiza automáticamente sin ningún paso manual adicional.

La opción `'tag'` en lugar de `true` permite excluir stories que no necesitan documentación automática (utilidades internas, stories de testing). En v1.0 todos los componentes usan autodocs, pero el opt-in por componente es más flexible para el futuro.

---

## Decisión 3: `@storybook/addon-a11y` y configuración del panel

### Por qué incluir el addon de accesibilidad

SuriUI tiene 19 ADRs documentando decisiones de accesibilidad. Sin validación visual de esas decisiones, los ADRs son solo documentación — no verificación.

`@storybook/addon-a11y` ejecuta **axe-core** en cada story renderizada y reporta violaciones de accesibilidad en el panel "Accessibility" de Storybook. Esto convierte cada story en un test de accesibilidad visual:

- ¿El label del `Input` está correctamente asociado con el `input`?
- ¿El botón `loading` tiene los atributos ARIA correctos?
- ¿El `Divider` semántico tiene el role correcto?

El addon no reemplaza los tests unitarios de RTL ni el testing manual con NVDA/VoiceOver — complementa ambos con feedback inmediato durante el desarrollo.

### La regla `color-contrast` deshabilitada

```ts
// .storybook/preview.ts
a11y: {
  config: {
    rules: [
      {
        id: 'color-contrast',
        enabled: false
      }
    ]
  }
}
```

La regla `color-contrast` de axe-core verifica que el contraste entre el texto y el fondo cumpla con WCAG 2.1 AA (ratio mínimo 4.5:1 para texto normal).

Esta regla está deshabilitada por una razón específica y documentada: **los tokens de SuriUI v1.0 están diseñados para light mode solamente**. No existe dark mode en v1.0. El addon evaluaría el contraste contra el fondo blanco del canvas de Storybook, que puede no ser el fondo real donde el consumidor usa los componentes.

Esto no es una renuncia a la accesibilidad de contraste — es una decisión de no generar falsos positivos o falsos negativos. El contraste de los tokens light-mode ha sido verificado manualmente contra WCAG 2.1 AA. Cuando SuriUI implemente dark mode (v2.0), esta regla debe rehabilitarse y los tokens de dark mode deben pasar la verificación automática.

**Todas las demás reglas de axe-core permanecen activas.**

---

## Decisión 4: tokens en `preview.ts` — mismo principio que `src/index.ts`

```ts
// .storybook/preview.ts
import '../src/tokens/index.css'
```

El mismo principio de ADR-005 aplica aquí: los tokens CSS deben importarse una sola vez en el punto de entrada. Para Storybook, ese punto de entrada es `preview.ts` — el módulo que se ejecuta antes de renderizar cualquier story.

Sin esta importación, las CSS Custom Properties de SuriUI no estarían definidas en el canvas de Storybook y los componentes se renderizarían sin colores, sin espaciados correctos, y sin tipografía.

No se importa `src/index.ts` directamente porque ese archivo exporta los componentes y los tipos — importarlo en el preview causaría problemas de módulos duplicados cuando las stories también importan desde `src/index.ts`. Importar solo los tokens (el CSS puro) es la forma correcta.

---

## Estructura de una story representativa

El patrón estándar aplicado en SuriUI:

```tsx
// Metadata del componente
const meta: Meta<typeof Button> = {
  title: 'Components/Button',   // ← jerarquía en el sidebar
  component: Button,
  tags: ['autodocs'],            // ← habilita la página de docs
  parameters: { layout: 'centered' }
}
export default meta
type Story = StoryObj<typeof Button>

// Story Default — siempre presente, siempre primera
export const Default: Story = {
  args: { children: 'Botón', variant: 'primary', size: 'md' }
}

// Story de estado con documentación inline cuando la semántica no es obvia
export const Loading: Story = {
  args: { children: 'Guardando...', loading: true },
  parameters: {
    docs: {
      description: {
        story: 'Usa `aria-disabled` en lugar de `disabled` nativo...'
      }
    }
  }
}

// Story de render custom para comparaciones visuales
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
    </div>
  ),
  parameters: { controls: { disable: true } }  // ← sin controles en stories de comparación
}
```

**`controls: { disable: true }` en stories de render custom:**

Las stories con `render()` personalizado no son controlables desde el panel de Controls — los controles modificarían `args` pero el render ignora `args`. Deshabilitar los controles en estas stories evita que el usuario los vea y los intente usar sin efecto.

---

## Consecuencias

### Positivas

- **Documentación automática desde tipos**: la tabla de props se actualiza sola cuando cambia el TypeScript
- **Validación de a11y visual**: axe-core en cada story detecta regresiones de accesibilidad antes de que lleguen a producción
- **Criterio editorial visible**: 5 stories por componente comunican qué importa, no qué es posible
- **Onboarding efectivo**: un consumidor nuevo puede entender la API de cada componente en 2 minutos navegando Storybook

### Negativas y mitigaciones

| Consecuencia | Mitigación |
|--------------|------------|
| Sin Chromatic, los cambios visuales no se detectan automáticamente entre PRs | Testing manual en Storybook antes de cada release; Chromatic planificado para v2.0 |
| `color-contrast` deshabilitado puede enmascarar problemas de contraste en temas custom del consumidor | Documentado aquí; el consumidor que override tokens debe verificar contraste manualmente |
| Stories de `render()` no son testeables con `play()` functions sin configuración adicional | Las stories interactivas con `play()` se añadirán al implementar el addon-interactions en profundidad |

---

## Alternativas consideradas y descartadas

| Alternativa | Razón de descarte |
|-------------|-------------------|
| Stories exhaustivas (una por combinación de props) | Sin Chromatic, genera ruido; no demuestra criterio editorial |
| `autodocs: false` — documentación 100% manual | Duplica la fuente de verdad (tipos + docs); mantenimiento costoso |
| `autodocs: true` — todas las stories generan docs | Menos control; algunos archivos de stories pueden no necesitar documentación |
| Omitir `@storybook/addon-a11y` | Pierde la validación automática de los 19 ADRs de accesibilidad |
| Deshabilitar todas las reglas de a11y | Vacía el valor del addon; solo se deshabilita `color-contrast` por la razón documentada |
| Importar `src/index.ts` en preview.ts en lugar de solo los tokens | Módulos duplicados cuando las stories también importan desde el index |

---

## Referencias

- [Storybook 8 — Getting started with Vite](https://storybook.js.org/docs/get-started/frameworks/react-vite)
- [Storybook — autodocs](https://storybook.js.org/docs/writing-docs/autodocs)
- [Storybook — `@storybook/addon-a11y`](https://storybook.js.org/docs/writing-tests/accessibility-testing)
- [axe-core — color-contrast rule](https://dequeuniversity.com/rules/axe/4.7/color-contrast)
- [WCAG 2.1 — Success Criterion 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [ADR-005 — Design Tokens importados una sola vez](./ADR-005-design-tokens-single-import.md)