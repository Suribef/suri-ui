# ADR-012 · Estrategia de montaje de `aria-live` regions para anuncios dinámicos

| Campo       | Valor                          |
|-------------|--------------------------------|
| **Estado**  | Aceptado                       |
| **Fecha**   | 2025-06                        |
| **Autores** | Sergio Uribe Frenkel           |
| **Proyecto**| SuriUI — `@suribef/suri-ui`    |
| **Componentes afectados** | `Input`, `Textarea`, `Select`, y cualquier componente con mensajes dinámicos |
| **Revisa**  | ADR-010 (aria-describedby condicional) |

---

## Contexto

El componente `Input` necesita anunciar mensajes de error a lectores de pantalla cuando aparecen dinámicamente — específicamente, cuando el consumidor pasa la prop `error` después de que el usuario intenta enviar un formulario.

La implementación inicial (ADR-010) tomó la decisión de renderizar el span de descripción **condicionalmente**, solo cuando existía contenido:

```tsx
// Implementación inicial — renderizado condicional
{hasDescription && (
  <span id={descriptionId} aria-live={error ? 'polite' : undefined}>
    {description}
  </span>
)}
```

Esta implementación tiene un bug de timing que hace que los anuncios de error fallen silenciosamente en la mayoría de lectores de pantalla.

---

## El bug de timing en live regions

### Cómo funciona una `aria-live` region

Las `aria-live` regions son un mecanismo de observación del DOM. Cuando el navegador parsea o renderiza una región con `aria-live`, registra ese nodo en el **accessibility tree** para monitoreo continuo. A partir de ese momento, cualquier cambio de contenido dentro del nodo dispara un anuncio en el lector de pantalla.

La palabra clave es "a partir de ese momento". El registro ocurre cuando el nodo **entra al DOM**. Los cambios que ocurren en el mismo ciclo de renderizado en que el nodo es creado no son observados.

### El escenario de falla

```
Tiempo 0: Input renderiza sin error
          → DOM: <input /> (sin span de descripción)
          → Lector de pantalla: no hay live region registrada

Tiempo 1: Usuario envía el formulario
          → React actualiza estado: error = "Email inválido"
          → DOM: <span aria-live="polite">Email inválido</span>
               ↑ creado CON contenido en el mismo render

Tiempo 2: Lector de pantalla detecta el nuevo nodo
          → Lo registra como live region
          → Pero el contenido ya estaba ahí al momento del registro
          → No hubo "cambio de contenido" que disparar
          → Resultado: SILENCIO
```

El lector de pantalla nunca anuncia "Email inválido". El usuario de teclado que no puede ver el borde rojo no recibe ninguna retroalimentación del error.

Este bug fue documentado contra Material UI en [#31924](https://github.com/mui/material-ui/issues/31924) y contra Ant Design en [#38635](https://github.com/ant-design/ant-design/issues/38635). En ambos casos, la corrección fue la misma: montar la live region vacía antes de inyectar contenido.

---

## Decisión

**Renderizar el contenedor de descripción siempre en el DOM, vacío cuando no hay mensaje, y ocultarlo visualmente con `:empty` en CSS.**

```tsx
// Input.tsx — span siempre presente
<span
  id={descriptionId}
  className={cn(
    styles.description,
    error ? styles.descriptionError : styles.descriptionHelper
  )}
  aria-live="polite"
  aria-atomic="true"
>{description}</span>
```

```css
/* Input.module.css */
.description:empty {
  display: none;
}
```

### Cómo esto corrige el timing

```
Tiempo 0: Input renderiza sin error
          → DOM: <span aria-live="polite"></span> (vacío)
          → Lector de pantalla: registra la live region vacía ✓

Tiempo 1: Usuario envía el formulario
          → React actualiza: description = "Email inválido"
          → DOM: <span aria-live="polite">Email inválido</span>
               ↑ CAMBIO DE CONTENIDO en nodo ya registrado

Tiempo 2: Lector de pantalla detecta el cambio de contenido
          → Anuncia "Email inválido" en el próximo momento polite ✓
```

### Por qué `aria-describedby` ya no es condicional

Con el span siempre en el DOM, el ID siempre existe. `aria-describedby` puede ser permanente:

```tsx
// Antes — condicional
aria-describedby={hasDescription ? descriptionId : undefined}

// Después — siempre presente
aria-describedby={descriptionId}
```

Esto revisa parcialmente ADR-010: la preocupación original (referencia a ID inexistente produce artefactos en VoiceOver) ya no aplica porque el elemento siempre existe. La preocupación que sí persiste — VoiceOver anunciando el contenido del span vacío — queda resuelta por `:empty { display: none }`, que también elimina el nodo del accessibility tree cuando está vacío.

---

## La trampa del pseudo-selector `:empty`

`:empty` es el mecanismo de ocultamiento visual, pero tiene una restricción crítica que no es intuitiva.

### Qué considera `:empty` la spec CSS

`:empty` selecciona elementos **sin ningún nodo hijo**, incluyendo nodos de texto. Esto incluye espacios en blanco y saltos de línea — cualquier carácter entre la etiqueta de apertura y la de cierre hace que el elemento deje de ser `:empty`.

```html
<!-- ✓ Coincide con :empty -->
<span></span>

<!-- ✗ NO coincide con :empty — contiene un salto de línea -->
<span>
</span>

<!-- ✗ NO coincide con :empty — contiene un espacio -->
<span> </span>
```

### El riesgo con strings vacíos (`''`)

`:empty` falla no solo con espacios en blanco estructurales de JSX — también falla cuando React renderiza un string vacío como nodo de texto.

```tsx
// Si error o helperText llegan como '' (string vacío):
const description = error ?? helperText  // → ''

// React renderiza: <span>{''}​</span>
// El span contiene un text node vacío → :empty NO coincide
// → El span vacío ocupa espacio visual aunque no haya mensaje
```

Los consumidores pueden pasar strings vacíos de forma involuntaria en patrones comunes:

```tsx
// React Hook Form — el campo de error puede ser '' antes de la validación
<Input error={errors.email?.message} />  // → undefined o ''

// Estado controlado con inicialización vacía
const [error, setError] = useState('')
<Input error={error} />  // → '' en el estado inicial
```

La corrección es normalizar strings vacíos a `undefined` antes de renderizar:

```tsx
// ❌ Antes — ?? no convierte strings vacíos
const description = error ?? helperText  // '' queda como ''

// ✅ Después — || convierte falsy values (incluido '') a undefined
const description = error || helperText || undefined
```

`||` colapsa `''`, `null`, `undefined` y `0` a `undefined`. Para el caso de mensajes de texto, todos esos valores son semánticamente "sin mensaje" — el colapso es correcto. `??` solo colapsa `null` y `undefined`, dejando pasar strings vacíos que rompen `:empty`.

### El riesgo con JSX y formateadores

React renderiza `{description}` como un nodo de texto. Cuando `description` es `undefined`, React renderiza el string vacío — o más precisamente, no renderiza ningún nodo de texto — dejando `<span></span>` en el DOM. Esto coincide con `:empty`.

El problema aparece con el formateo del JSX:

```tsx
// ❌ RIESGOSO — con salto de línea interno
<span
  id={descriptionId}
  className={cn(...)}
  aria-live="polite"
  aria-atomic="true"
>
  {description}
</span>
// Prettier puede formatear este JSX dejando un salto de línea
// entre la etiqueta de apertura y {description}.
// React renderiza ese salto como un nodo de texto vacío → ":empty" falla.
// El span vacío OCUPA ESPACIO VISUAL aunque no haya mensaje.

// ✅ SEGURO — sin saltos de línea internos
<span
  id={descriptionId}
  className={cn(...)}
  aria-live="polite"
  aria-atomic="true"
>{description}</span>
// El cierre de > y el comienzo de {description} están en la misma línea.
// React garantiza que <span></span> cuando description es undefined.
// ":empty" funciona correctamente.
```

### Por qué esto es un riesgo real, no teórico

Prettier, el formateador estándar del ecosistema React, puede reformatear el JSX al ejecutar `prettier --write` o al guardar el archivo con "Format on Save" activado en el editor.

El resultado del reformateo depende de la longitud de la línea de atributos. Si los atributos superan el `printWidth` de Prettier (80 caracteres por defecto), Prettier puede insertar un salto de línea entre `>` y `{description}`.

```tsx
// Antes del formateo (controlado)
>{description}</span>

// Después del formateo (si printWidth se supera)
>
  {description}
</span>
// ← React renderiza "\n  " como nodo de texto → :empty falla silenciosamente
```

### La solución

Mantener el `>{description}</span>` en una línea, o más precisamente, garantizar que no haya ningún carácter (incluyendo espacios o saltos) entre `>` y `{description}`:

```tsx
<span
  id={descriptionId}
  className={cn(
    styles.description,
    error ? styles.descriptionError : styles.descriptionHelper
  )}
  aria-live="polite"
  aria-atomic="true"
>{description}</span>
```

Esta forma es resistente a Prettier: los atributos pueden ser reformateados libremente, pero el contenido entre las etiquetas no.

### Alternativa sin `:empty`: renderizado condicional del contenido

Si la dependencia de `:empty` se considera frágil, existe una alternativa que elimina el riesgo:

```tsx
// Alternativa: el contenedor siempre existe, el contenido es condicional
<span
  id={descriptionId}
  className={cn(...)}
  aria-live="polite"
  aria-atomic="true"
>
  {description && <span className={styles.descriptionText}>{description}</span>}
</span>
```

El span exterior (live region) siempre está vacío o tiene contenido en un hijo — `:empty` no es necesario porque el span exterior siempre coincide con `:empty` cuando no hay descripción (tiene un hijo condicional, no nodos de texto directos).

Esta alternativa es más robusta frente a formateadores pero introduce un nivel adicional de anidamiento. Para SuriUI se eligió la solución con `:empty` + `>{description}</span>` y se documenta la restricción aquí para que sea explícita.

---

## `aria-atomic="true"` — por qué es necesario

`aria-atomic="true"` instruye al lector de pantalla a **anunciar el contenido completo de la live region** cuando detecta un cambio, no solo la parte que cambió.

Sin `aria-atomic`:
- Si el mensaje de error cambia de "Campo requerido" a "Email inválido", el lector podría anunciar solo "Email inválido" (el diff)
- Si el mensaje aparece en partes (por animación de caracteres), podría anunciar fragmentos

Con `aria-atomic="true"`:
- Cualquier cambio en el span hace que se anuncie el contenido completo
- El usuario siempre escucha el mensaje de error completo

`role="status"` implica `aria-atomic="true"` implícitamente, pero `aria-live="polite"` no. Como el span usa `aria-live` directamente (no `role`), `aria-atomic` debe ser explícito.

---

## Impacto en ADR-010

ADR-010 documentó la decisión de usar `aria-describedby` condicional para evitar referencias a IDs inexistentes. Este ADR revisa esa decisión:

| ADR-010 (anterior) | ADR-012 (actual) |
|---------------------|-----------------|
| Span renderizado condicionalmente | Span siempre en DOM |
| `aria-describedby` condicional | `aria-describedby` siempre presente |
| Cero artefactos de VoiceOver en campo sin descripción | Cero artefactos porque `:empty` oculta el span del accessibility tree |
| Anuncio de error NO funciona (bug de timing) | Anuncio de error funciona correctamente |

ADR-010 fue correcto en su razonamiento sobre VoiceOver y referencias huecas, pero la solución incorrecta. ADR-012 resuelve el problema de timing sin introducir los problemas de VoiceOver que ADR-010 intentaba evitar.

---

## Consecuencias

### Positivas

- **Anuncios de error funcionales** en NVDA, JAWS, VoiceOver y TalkBack
- **`aria-describedby` simplificado**: siempre presente, sin lógica condicional
- **Sin espacio visual innecesario**: `:empty { display: none }` garantiza que el span vacío no afecta el layout
- **Patrón documentado y conocido**: la misma corrección usada por Material UI, Headless UI y Radix UI

### Negativas y mitigaciones

| Consecuencia | Mitigación |
|--------------|------------|
| Dependencia de `:empty` que puede romperse con formateo | `>{description}</span>` en una línea; documentado aquí; revisión en code review |
| Dependencia de `:empty` que puede romperse con strings vacíos | `\|\|` en lugar de `??` para normalizar `''` a `undefined`; patrón documentado aquí |
| El DOM siempre incluye el span, incluso sin mensaje | El impacto es un span vacío con `display: none`; costo despreciable |
| `const description = error ?? helperText` (sin normalización) | `??` deja pasar strings vacíos `''` que rompen `:empty` silenciosamente |
| `:empty` no funciona en IE11 | IE11 está fuera del scope de soporte de SuriUI (React 18 ya no soporta IE11) |

---

## Tests que especifican este comportamiento

```tsx
it('always renders description container for aria-live registration', () => {
  const { container } = render(<Input label="Email" />)
  const input = screen.getByRole('textbox')
  const descId = input.getAttribute('aria-describedby')
  // El contenedor siempre existe — la live region está registrada desde el inicio
  expect(descId).toBeTruthy()
  expect(document.getElementById(descId!)).toBeInTheDocument()
  expect(document.getElementById(descId!)).toBeEmptyDOMElement()
})

it('links input to helper text via aria-describedby', () => {
  render(<Input label="Email" helperText="Texto de ayuda" />)
  const input = screen.getByRole('textbox')
  const descId = input.getAttribute('aria-describedby')
  expect(document.getElementById(descId!)).toHaveTextContent('Texto de ayuda')
})
```

El primer test verifica que el contenedor está en el DOM vacío — garantizando que la live region esté registrada. Este test es la especificación ejecutable de la estrategia de montaje.

---

## Regla derivada para componentes futuros

> Cualquier región `aria-live` que reciba contenido dinámico **debe existir en el DOM antes** de que ese contenido sea insertado. Montar la región vacía y ocultar con `:empty { display: none }` es el patrón estándar. Para que `:empty` funcione correctamente, el contenido debe normalizarse a `undefined` (no `''`) usando `||` en lugar de `??`, y el JSX no debe tener saltos de línea entre la etiqueta de apertura y el contenido.

Esta regla aplica directamente a `Textarea`, `Select`, y a cualquier componente futuro que anuncie mensajes de error o estado de forma dinámica.

---

## Referencias

- [WAI-ARIA 1.2 — `aria-live`](https://www.w3.org/TR/wai-aria-1.2/#aria-live)
- [WAI-ARIA 1.2 — `aria-atomic`](https://www.w3.org/TR/wai-aria-1.2/#aria-atomic)
- [CSS Selectors Level 4 — `:empty` pseudo-class](https://drafts.csswg.org/selectors/#the-empty-pseudo)
- [Material UI — fix: aria-live region mount timing #31924](https://github.com/mui/material-ui/issues/31924)
- [MDN — ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
- [Inclusive Components — Notifications](https://inclusive-components.design/notifications/)
- [Deque — Dynamic content updates and screen reader announcements](https://dequeuniversity.com/rules/axe/4.7/aria-live-region-error)