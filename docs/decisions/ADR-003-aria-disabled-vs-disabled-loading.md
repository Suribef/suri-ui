# ADR-003 · `aria-disabled` vs `disabled` nativo en estado `loading`

| Campo       | Valor                          |
|-------------|--------------------------------|
| **Estado**  | Aceptado                       |
| **Fecha**   | 2025-06                        |
| **Autores** | Sergio Uribe                   |
| **Proyecto**| SuriUI — `@suribef/suri-ui`   |

---

## Contexto

El componente `Button` soporta dos estados que visualmente "bloquean" la acción:

1. **`disabled`** — la acción no está disponible en este contexto (ej: un campo requerido no fue completado)
2. **`loading`** — la acción fue iniciada y está en progreso (ej: se está enviando un formulario)

Ambos estados comparten apariencia visual similar (opacidad reducida, cursor alternativo, interacción bloqueada), pero tienen **semántica completamente distinta** desde la perspectiva de accesibilidad y de la experiencia de usuario.

La decisión de implementación afecta directamente a:
- Usuarios de teclado (navegación por Tab)
- Usuarios de lectores de pantalla (NVDA, VoiceOver, JAWS)
- Integración con formularios (`react-hook-form`, formularios nativos)
- Comportamiento de focus management en aplicaciones complejas

---

## Decisión

**Usar implementaciones distintas según el estado:**

| Estado | Implementación | Nodo DOM resultante |
|--------|---------------|---------------------|
| `disabled` | `disabled` nativo de HTML | `<button disabled>` |
| `loading` | `aria-disabled="true"` + `aria-busy="true"` + `tabIndex={-1}` en el handler | `<button aria-disabled="true" aria-busy="true">` |

```tsx
// Button.tsx — implementación
<button
  disabled={disabled}                      // solo para prop disabled real
  aria-disabled={loading || undefined}     // para estado loading
  aria-busy={loading || undefined}         // señal semántica de actividad
  tabIndex={loading ? -1 : tabIndex}       // control fino de tab order
  onClick={handleClick}                    // handler que bloquea si loading
>
```

---

## Razonamiento

### La semántica importa más que la apariencia

**`disabled` nativo:**
- Comunica: *"esta acción no existe o no está disponible en este contexto"*
- El elemento es eliminado del tab order por el navegador
- Los lectores de pantalla anuncian: *"botón desactivado"* (button, dimmed)
- **El usuario no puede interactuar ni con teclado ni con ratón**
- Uso correcto: botón "Guardar" cuando un campo requerido está vacío

**`aria-disabled` en loading:**
- Comunica: *"esta acción está en progreso, espera"*
- El elemento **permanece en el tab order** si no se modifica `tabIndex`
- Los lectores de pantalla anuncian: *"botón, cargando"* (por `aria-busy`)
- El usuario de teclado puede hacer Tab al botón, escuchar el estado, y entender por qué no puede actuar ahora mismo
- Uso correcto: botón "Enviar" mientras la petición HTTP está en vuelo

### Por qué el botón en loading debe permanecer "enfocable" semánticamente

Considera un formulario de checkout con múltiples botones:

```
[ Campo de tarjeta ] [ Código CVC ]
[ Cancelar ] [ Pagar $299 → cargando... ]
```

Si el botón "Pagar" usa `disabled` nativo durante loading:
- El usuario de teclado pierde el foco y es redirigido al inicio del formulario
- El usuario no recibe retroalimentación auditiva del estado de la operación
- La experiencia es: *"hice click y algo pasó, pero no sé qué"*

Si el botón "Pagar" usa `aria-disabled` + `aria-busy`:
- El botón permanece localizable en el DOM
- El lector de pantalla anuncia: *"Pagar $299, botón, ocupado"*
- El usuario sabe que su acción fue registrada y está siendo procesada

Este patrón está documentado en las [WAI-ARIA Authoring Practices 1.2](https://www.w3.org/WAI/ARIA/apg/) y es el implementado por Radix UI, shadcn/ui, y Headless UI.

### Por qué `tabIndex={-1}` en loading

Aunque `aria-disabled` mantiene el elemento en el DOM enfocable, el valor `tabIndex={-1}` hace que el usuario **no llegue al botón mediante Tab secuencial** durante loading.

La distinción es sutil pero correcta:
- `tabIndex={-1}`: el botón puede recibir foco programático (`ref.current.focus()`) y ser anunciado por screen readers si el usuario navega con flechas, pero no aparece en el flujo Tab natural
- `tabIndex` sin cambio: el botón aparece en el flujo Tab y el usuario puede llegar a él, pero no puede activarlo

Para `loading`, queremos que el usuario **pueda** encontrar el botón si lo busca, pero que no llegue a él accidentalmente en la navegación secuencial.

Sin embargo, el `onClick` también bloquea la acción:
```tsx
const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
  if (loading) {
    e.preventDefault()
    return
  }
  onClick?.(e)
}
```

Esto garantiza que incluso si el botón recibe un click durante loading (por un race condition en la UI), la acción original no se dispara dos veces.

### Por qué `aria-busy` complementa `aria-disabled`

`aria-disabled` indica que el elemento no puede ser activado ahora. `aria-busy` indica que el elemento o la región están procesando algo.

Usados juntos:
```html
<button aria-disabled="true" aria-busy="true">Enviando...</button>
```

Los lectores de pantalla modernos (NVDA + JAWS) combinan ambos atributos en su anuncio:
- NVDA: *"Enviando, botón, ocupado"*
- VoiceOver: *"Enviando, dim, in progress"*

Esto proporciona contexto completo: el botón está bloqueado Y hay actividad en progreso.

---

## Consecuencias

### Positivas

- **Conformidad WAI-ARIA Level AA**: cumple con WCAG 2.1 criterios 1.3.1 (Info and Relationships), 4.1.2 (Name, Role, Value)
- **Mejor experiencia para usuarios de teclado**: el estado loading no rompe el flujo de navegación
- **Semántica correcta para screen readers**: los usuarios de asistivos reciben información accionable, no solo "botón desactivado"
- **Prevención de doble submit**: el handler garantiza que la acción no se dispara múltiples veces independientemente del estado del DOM
- **Testeable**: los tests verifican la distinción explícitamente, documentando el comportamiento esperado como especificación viva

### Negativas y mitigaciones

| Consecuencia | Mitigación |
|--------------|------------|
| API más compleja (dos props que parecen similares) | Documentado con ejemplos claros en Storybook; el naming explícito (`loading` vs `disabled`) guía al consumidor |
| Algunos estilos CSS requieren selectores distintos para los dos estados | Los `.module.css` usan `:disabled` para el estado nativo y `[aria-disabled='true']` para loading, explícitamente separados |
| `tabIndex={-1}` puede sorprender a consumidores que sobreescriben `tabIndex` | El override de tabIndex respeta el valor pasado por el consumidor cuando no está en loading: `tabIndex={loading ? -1 : tabIndex}` |

---

## Implementación en CSS

```css
/* Estado disabled nativo */
.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Estado loading (aria-disabled) */
.button[aria-disabled='true'] {
  opacity: 0.5;
  cursor: wait;        /* distinción visual: not-allowed vs wait */
}

/* Hover solo en estado interactivo */
.primary:hover:not(:disabled):not([aria-disabled='true']) {
  background-color: var(--sui-color-primary-hover);
}
```

El cursor distinto (`not-allowed` vs `wait`) es una señal visual adicional que refuerza la distinción semántica.

---

## Alternativas consideradas y descartadas

| Alternativa | Razón de descarte |
|-------------|-------------------|
| `disabled` nativo para ambos estados | Pierde el focus, el screen reader no anuncia estado de actividad |
| `aria-disabled` para ambos estados | `disabled` nativo es semánticamente correcto para el estado de formulario inactivo; perder la semántica nativa sin ganancia |
| Solo `pointer-events: none` en CSS | No afecta accesibilidad; keyboard navigation ignora pointer-events |
| `onClick` guard sin `aria-disabled` | El DOM no comunica el estado; los screen readers no saben que el botón está bloqueado |

---

## Tests relacionados

Esta decisión está especificada como pruebas vivas en `Button.test.tsx`:

```tsx
it('uses native disabled (not aria-disabled) for disabled state', () => {
  render(<Button disabled>Click</Button>)
  const btn = screen.getByRole('button')
  expect(btn).toBeDisabled()
  expect(btn).not.toHaveAttribute('aria-disabled')
})

it('uses aria-disabled (not native disabled) for loading state', () => {
  render(<Button loading>Submit</Button>)
  const btn = screen.getByRole('button')
  expect(btn).not.toBeDisabled()
  expect(btn).toHaveAttribute('aria-disabled', 'true')
  expect(btn).toHaveAttribute('aria-busy', 'true')
})
```

Estos tests sirven como especificación ejecutable: si alguien modifica la implementación para unificar los estados, los tests fallarán y la PR incluirá la discusión de por qué la distinción existe.

---

## Referencias

- [WAI-ARIA 1.2 — `aria-disabled`](https://www.w3.org/TR/wai-aria-1.2/#aria-disabled)
- [WAI-ARIA 1.2 — `aria-busy`](https://www.w3.org/TR/wai-aria-1.2/#aria-busy)
- [WCAG 2.1 — Success Criterion 4.1.2](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html)
- [Radix UI — Disabled vs Loading pattern](https://www.radix-ui.com/primitives/docs/components/form)
- [Inclusive Components — Buttons](https://inclusive-components.design/buttons-and-button-like-elements/)
- [MDN — The `disabled` content attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled)