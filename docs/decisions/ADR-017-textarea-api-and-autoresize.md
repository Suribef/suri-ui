# ADR-017 · Decisiones de API y comportamiento específicas de Textarea

| Campo       | Valor                          |
|-------------|--------------------------------|
| **Estado**  | Aceptado                       |
| **Fecha**   | 2025-06                        |
| **Autores** | Sergio Uribe                   |
| **Proyecto**| SuriUI — `@suribef/suri-ui`   |
| **Componentes afectados** | `Textarea` |

---

## Contexto

`Textarea` comparte arquitectura con `Input` — mismos patrones de label, `aria-describedby`, `aria-invalid`, `useId()` — pero representa un elemento HTML distinto con un modelo de tamaño fundamentalmente diferente y atributos HTML propios. Este ADR documenta las divergencias respecto a `Input`.

---

## Decisión 1: `TextareaHTMLAttributes` en lugar de `InputHTMLAttributes`

### El problema

Si `TextareaProps` extendiera `InputHTMLAttributes<HTMLInputElement>`, el consumidor de TypeScript tendría acceso a props inválidas para `<textarea>`:

```tsx
<Textarea type="email" />    // <textarea type="email"> no existe en HTML
<Textarea min={0} />         // no tiene efecto en textarea
<Textarea checked />         // solo aplica a input type="checkbox"
<Textarea accept=".pdf" />   // solo válido en input type="file"
```

Ninguno produce error en el navegador — son ignorados por el parser HTML. Pero permiten que el consumidor escriba código que *parece* funcionar y no hace nada.

### La solución

```tsx
export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  error?: string
  // ...
}
```

`TextareaHTMLAttributes<HTMLTextAreaElement>` incluye exactamente los atributos válidos: `rows`, `cols`, `maxLength`, `minLength`, `wrap`, `placeholder`, `readOnly`, `disabled`, `required`. Excluye `type`, `min`, `max`, `accept`, `checked`, y todos los atributos de `<input>`.

El compilador rechaza props inválidas en tiempo de build:

```tsx
<Textarea type="email" />
// TypeScript Error: Property 'type' does not exist on type 'TextareaProps'
```

La librería usa TypeScript como primera línea de documentación: la definición de tipos es la especificación de la API.

---

## Decisión 2: `resize='vertical'` como default en lugar de `'both'`

El CSS `resize` por defecto del navegador para `<textarea>` es `both` — el usuario puede redimensionar horizontal y verticalmente.

El redimensionamiento horizontal rompe layouts en la mayoría de contextos:

```
┌─────────────────────────┐
│ Formulario              │
├─────────────────────────┤
│ Nombre: [____________]  │
│                         │
│ Mensaje:                │
│ ┌─────────────────────┐ │
│ │ ← usuario arrastra →╔╡ │  → textarea desborda el grid del formulario
│ └─────────────────────╝ │
└─────────────────────────┘
```

El redimensionamiento vertical es útil y no rompe layouts: el usuario puede ver más contenido si su mensaje es largo.

```tsx
({ resize = 'vertical', ... }) => { ... }
```

El default `'vertical'` preserva la utilidad del resize sin el problema de layout. El consumidor puede optar explícitamente por cualquier valor:

```tsx
<Textarea resize="none" />   // sin resize — layouts muy controlados
<Textarea resize="both" />   // comportamiento nativo del navegador
```

Regla de diseño: el default debe ser correcto en el 95% de casos de uso. `'both'` rompe layouts en ese 95%; `'vertical'` no.

---

## Decisión 3: `autoResize` — mecanismo con `scrollHeight` y dependencia en `value`

### El mecanismo

```tsx
useEffect(() => {
  if (!autoResize || !internalRef.current) return
  const el = internalRef.current
  el.style.height = 'auto'           // resetear primero — necesario para shrink
  el.style.height = `${el.scrollHeight}px`
}, [autoResize, value])
```

**Por qué `height = 'auto'` primero:**

Sin el reset, el textarea nunca puede reducir su tamaño cuando el usuario borra texto. `scrollHeight` en un elemento con `height` fija refleja el alto del contenido dentro del alto actual, no el mínimo necesario. Al resetear a `'auto'`, el browser recalcula el layout al tamaño mínimo, y entonces `scrollHeight` refleja el alto real del contenido.

```
Contenido largo → height: 120px
Usuario borra texto, contenido requiere 60px

Sin reset:    scrollHeight = 120px  (no shrinkea)
Con reset:    height = auto → scrollHeight = 60px → height = 60px  ✓
```

**Por qué `value` como dependencia del efecto:**

`autoResize` está diseñado para textareas controlados:

```tsx
const [text, setText] = useState('')
<Textarea autoResize value={text} onChange={e => setText(e.target.value)} />
```

Cuando el valor cambia — por escritura del usuario o por reset programático del formulario — el efecto debe recalcular la altura. Sin `value` como dependencia, el efecto solo corre al montar.

Para el caso no controlado (sin `value`), el consumidor debe escuchar `onInput` directamente para disparar el recalculo. Documentado como comportamiento conocido.

**CSS complementario de `autoResize`:**

```css
.autoResize {
  resize: none;      /* excluye resize manual — son mutuamente excluyentes */
  overflow: hidden;  /* elimina scrollbar durante el ciclo height=auto → height=scrollHeight */
}
```

`overflow: hidden` durante el ciclo de reset evita un scrollbar momentáneo que aparecería con `overflow: auto` (el default).

### Los tokens de min/max height

```css
--sui-textarea-min-height: 80px;   /* nunca colapsa a una sola línea */
--sui-textarea-max-height: 400px;  /* limita crecimiento de autoResize */
```

Pasado el `max-height`, el textarea muestra scrollbar interno — el usuario puede ver el contenido, pero el textarea no sigue creciendo. Ambos valores son tokens overrideables por el consumidor sin tocar el componente.

---

## Decisión 4: Paridad de accesibilidad con Input

`Textarea` replica exactamente los patrones de accesibilidad de `Input`:

| Patrón | Input | Textarea |
|--------|-------|----------|
| `useId()` para ID estable SSR (ADR-009) | ✓ | ✓ |
| `aria-describedby` siempre presente (ADR-012) | ✓ | ✓ |
| `aria-live` region vacía al montar (ADR-012) | ✓ | ✓ |
| `aria-invalid` con `undefined` no `false` (ADR-011) | ✓ | ✓ |
| `aria-required` explícito | ✓ | ✓ |
| Asterisco `aria-hidden` | ✓ | ✓ |
| `description = error \|\| helperText \|\| undefined` (ADR-012) | ✓ | ✓ |
| `.description:empty { display: none }` (ADR-012) | ✓ | ✓ |

Esta paridad es una regla del sistema: **todos los componentes de formulario de SuriUI comparten el mismo modelo de accesibilidad**. Un desarrollador que conoce Input puede usar Textarea sin leer documentación adicional de accesibilidad.

La paridad también reduce la superficie de bugs: cualquier corrección aplicada a Input se aplica a Textarea de forma consistente.

---

## Consecuencias

### Positivas

- **TypeScript previene errores de API**: `type`, `min`, `max` en Textarea son errores de compilación
- **Layout correcto por defecto**: `resize='vertical'` no rompe grids ni columnas
- **`autoResize` funcional para casos controlados**: cubre shrink y grow; sin artefactos visuales de scrollbar
- **Theming de tamaño**: tokens de min/max height overrideables sin modificar el componente
- **Paridad de accesibilidad con Input**: mismos patrones, sin sorpresas para el consumidor

### Negativas y mitigaciones

| Consecuencia | Mitigación |
|--------------|------------|
| `autoResize` no controlado (sin `value`) tiene comportamiento limitado | Documentado: optimizado para uso controlado; el consumidor no controlado puede escuchar `onInput` |
| `overflow: hidden` en `.autoResize` oculta contenido si se alcanza `max-height` sin scrollbar interno visible | `max-height` tiene token override; `overflow` puede ser sobrescrito vía `className` si el consumidor lo necesita |
| `resize: none` forzado en `.autoResize` elimina la opción de resize manual | Correcto por diseño: resize manual y autoResize son mutuamente excluyentes |

---

## Alternativas consideradas y descartadas

| Alternativa | Razón de descarte |
|-------------|-------------------|
| `InputHTMLAttributes` como base | Permite props inválidas para `<textarea>` sin error de compilación |
| `resize='both'` como default | Rompe layouts horizontales en la mayoría de contextos |
| `autoResize` sin token `max-height` | El textarea crece indefinidamente; UX deficiente |
| Escuchar `onInput` en lugar de depender de `value` en el efecto | `onInput` no se dispara en resets programáticos del valor |
| Separar `TextareaHTMLAttributes` en un tipo propio | Pérdida de todos los atributos HTML nativos válidos; mantenimiento costoso |

---

## Referencias

- [HTML spec — `textarea` element](https://html.spec.whatwg.org/multipage/form-elements.html#the-textarea-element)
- [MDN — CSS `resize`](https://developer.mozilla.org/en-US/docs/Web/CSS/resize)
- [MDN — `Element.scrollHeight`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight)
- [React — Controlled vs uncontrolled components](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components)
- [TypeScript — `TextareaHTMLAttributes`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/index.d.ts)