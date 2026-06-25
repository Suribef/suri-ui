# ADR-011 · `aria-invalid` con `undefined` en lugar de `false`

| Campo       | Valor                          |
|-------------|--------------------------------|
| **Estado**  | Aceptado                       |
| **Fecha**   | 2026-06                        |
| **Autores** | Sergio Uribe Frenkel           |
| **Proyecto**| SuriUI — `@suribef/suri-ui`    |
| **Componentes afectados** | `Input`, `Textarea`, `Select`, y cualquier campo de formulario |

---

## Contexto

`aria-invalid` comunica a lectores de pantalla que un campo de formulario contiene un valor inválido. Es el complemento semántico del estilo visual de error (borde rojo, ícono de advertencia).

El atributo tiene cuatro valores válidos según la spec WAI-ARIA:

| Valor | Significado |
|-------|-------------|
| `false` | El valor del campo es válido (default implícito) |
| `true` | El valor del campo es inválido |
| `grammar` | El campo tiene un error gramatical |
| `spelling` | El campo tiene un error ortográfico |

La pregunta de implementación es cómo representar el estado "no hay error" en el DOM:

```tsx
// Opción A — atributo explícito con valor false
<input aria-invalid={error ? 'true' : 'false'} />
// → <input aria-invalid="false" /> cuando no hay error

// Opción B — atributo ausente (undefined)
<input aria-invalid={!!error || undefined} />
// → <input /> cuando no hay error (sin atributo)
```

Ambas opciones son semánticamente equivalentes según la spec — `aria-invalid="false"` y la ausencia del atributo tienen el mismo significado: el campo es válido. En la práctica, no son equivalentes.

---

## Cómo procesan `aria-invalid="false"` los lectores de pantalla

La spec dice que `false` es el valor por defecto implícito y que debería ser equivalente a la ausencia del atributo. La implementación real de los lectores de pantalla no siempre respeta esta equivalencia.

### NVDA (Windows)

NVDA 2022 y anteriores anuncian `aria-invalid="false"` explícitamente:

```
Usuario enfoca campo de email sin error:
→ Con aria-invalid="false":  "Email, campo de texto requerido, inválido: falso"
→ Sin aria-invalid:          "Email, campo de texto requerido"
```

El anuncio "inválido: falso" en un campo que no tiene error confunde al usuario — sugiere que el campo tiene algún problema cuando no lo tiene. Es información redundante que degrada la experiencia.

### VoiceOver (macOS / iOS)

VoiceOver no anuncia `aria-invalid="false"` en la mayoría de versiones modernas. Sin embargo, en versiones anteriores a macOS Monterey, podía anunciar "no inválido" en algunos contextos.

### JAWS (Windows)

JAWS ignora `aria-invalid="false"` correctamente en versiones recientes. En JAWS 18 y anteriores, producía anuncios redundantes similares a NVDA.

### Compatibilidad general

El denominador común entre las implementaciones problemáticas es que tratan `aria-invalid="false"` como información activa (el campo fue explícitamente marcado como válido) en lugar de como el estado por defecto implícito. El resultado es verbalización innecesaria.

---

## Decisión

**Usar `undefined` para representar el estado "sin error", eliminando `aria-invalid` del DOM cuando no hay error.**

```tsx
// Input.tsx
<input
  aria-invalid={!!error || undefined}
  // Con error:    aria-invalid="true"  → en el DOM
  // Sin error:    aria-invalid no existe → fuera del DOM
/>
```

La expresión `!!error || undefined`:
- `!!error` es `true` cuando hay error → el atributo existe con valor `"true"`
- `!!error` es `false` cuando no hay error → `false || undefined` = `undefined` → React no emite el atributo

---

## La distinción semántica entre `false` y ausencia

Desde la perspectiva de la spec, `false` y ausencia son equivalentes. Desde la perspectiva del comportamiento real de lectores de pantalla, no lo son.

La decisión refleja un principio más amplio de diseño de atributos ARIA: **los atributos de estado deben estar presentes solo cuando agregan información**. Un campo que nunca ha sido tocado no tiene estado de validación — simplemente no ha sido validado todavía. El estado "no inválido" es el estado por defecto del DOM; declararlo explícitamente agrega ruido sin información.

Este principio aplica consistentemente en SuriUI:

| Atributo | Estado "activo" | Estado "inactivo" |
|----------|----------------|-------------------|
| `aria-invalid` | `"true"` | `undefined` (ausente) |
| `aria-disabled` | `"true"` | `undefined` (ausente) |
| `aria-busy` | `"true"` | `undefined` (ausente) |
| `data-error` | `""` (presente) | `undefined` (ausente) |
| `data-loading` | `""` (presente) | `undefined` (ausente) |

La consistencia del patrón facilita tanto el entendimiento del código como la escritura de selectores CSS:

```css
/* Selector claro: el atributo existe = hay error */
.input[aria-invalid="true"] { border-color: var(--sui-color-border-error); }

/* No hay necesidad de :not([aria-invalid="false"]) */
```

---

## Sobre `aria-invalid` y la validación nativa del navegador

HTML5 provee validación nativa con la pseudo-clase `:invalid` en CSS y el atributo `validity` en el DOM. Sin embargo, los navegadores aplican `:invalid` en el momento en que el campo es renderizado (si `required` está presente y el campo está vacío, ya está `:invalid`), lo que produce estilos de error visibles antes de que el usuario interactúe.

SuriUI controla el estado de error mediante la prop `error` en lugar de depender de `:invalid`, porque la validación controlada por el consumidor (con React Hook Form o validación manual) permite mostrar errores solo después de que el usuario ha interactuado con el campo.

`aria-invalid` se sincroniza con este modelo: solo está presente cuando `error` está presente, que es cuando el consumidor ha determinado que el campo tiene un error.

---

## Consecuencias

### Positivas

- **Cero verbalización redundante** en NVDA y lectores con comportamiento literal de `aria-invalid="false"`
- **DOM más limpio**: el atributo solo existe cuando aporta información
- **Selectores CSS simples**: `[aria-invalid="true"]` sin necesidad de negaciones
- **Patrón consistente** con otros atributos booleanos en la librería

### Negativas y mitigaciones

| Consecuencia | Mitigación |
|--------------|------------|
| La ausencia de `aria-invalid` podría interpretarse como "campo no evaluado" en herramientas de auditoría | Es la interpretación correcta: los campos sin error no han sido marcados con un estado de validación explícito |
| Algunos desarrolladores esperan `aria-invalid="false"` como afirmación explícita de validez | El comportamiento correcto en WCAG es que la ausencia del atributo implica validez; `aria-invalid="false"` es redundante per spec |

---

## Tests que especifican este comportamiento

```tsx
it('sets aria-invalid when error is present', () => {
  render(<Input label="Email" error="Email inválido" />)
  expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
})

it('does not set aria-invalid when no error', () => {
  render(<Input label="Email" />)
  // La ausencia del atributo es el comportamiento especificado
  expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid')
})
```

El segundo test verifica explícitamente que el atributo está **ausente**, no que tiene valor `"false"`. Cambiarlo para aceptar `aria-invalid="false"` sería una regresión en accesibilidad.

---

## Alternativas consideradas y descartadas

| Alternativa | Razón de descarte |
|-------------|-------------------|
| `aria-invalid={error ? true : false}` | `aria-invalid="false"` produce verbalizaciones redundantes en NVDA |
| `aria-invalid={error ? 'true' : 'false'}` | Mismo problema — el valor string `"false"` tiene el mismo comportamiento |
| Condicional ternario `error ? 'true' : undefined` | Funcional pero menos idiomático; `!!error \|\| undefined` expresa la intención más directamente |
| Omitir `aria-invalid` completamente (nunca agregarlo) | El campo en estado de error no comunicaría semánticamente el error a lectores de pantalla |

---

## La regla heurística para atributos ARIA booleanos

De esta decisión se puede extraer una regla aplicable a cualquier atributo ARIA booleano en SuriUI:

> Un atributo ARIA booleano debe estar **presente con valor `"true"` cuando el estado está activo** y debe estar **ausente del DOM cuando el estado no está activo**.

Los valores `"false"` de atributos ARIA booleanos son redundantes en la mayoría de contextos y pueden producir verbalizaciones inesperadas. La ausencia del atributo es la forma correcta de representar el estado "no activo".

Excepciones conocidas: `aria-expanded` y `aria-pressed` tienen casos de uso donde `"false"` es semánticamente distinto de la ausencia del atributo (un toggle que puede estar activo o inactivo pero siempre existe como tal). Para estos casos, `"false"` es correcto.

---

## Referencias

- [WAI-ARIA 1.2 — `aria-invalid`](https://www.w3.org/TR/wai-aria-1.2/#aria-invalid)
- [WCAG 2.1 — Success Criterion 3.3.1 Error Identification](https://www.w3.org/WAI/WCAG21/Understanding/error-identification.html)
- [WCAG 2.1 — Success Criterion 3.3.3 Error Suggestion](https://www.w3.org/WAI/WCAG21/Understanding/error-suggestion)
- [NVDA changelog — aria-invalid behavior](https://www.nvaccess.org/files/nvda/documentation/userGuide.html)
- [Adrian Roselli — Don't Use aria-invalid="false"](https://adrianroselli.com/2019/02/avoid-default-field-validation.html)
- [MDN — aria-invalid](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-invalid)