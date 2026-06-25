# ADR-019 · Detalles de implementación del Select nativo: chevron SVG, placeholder y API de opciones

| Campo       | Valor                          |
|-------------|--------------------------------|
| **Estado**  | Aceptado                       |
| **Fecha**   | 2026-06                        |
| **Autores** | Sergio Uribe Frenkel           |
| **Proyecto**| SuriUI — `@suribef/suri-ui`    |
| **Componentes afectados** | `Select`         |

---

## Contexto

Dado que `Select` usa `<select>` nativo (ADR-018), surgen tres decisiones de implementación específicas que no son obvias:

1. Cómo reemplazar el chevron nativo del browser con uno custom
2. Cómo implementar el placeholder sin romper la validación nativa
3. Cómo diseñar la API de opciones para soportar grupos

---

## Decisión 1: `appearance: none` + chevron SVG como data URI

### El problema con el chevron nativo

Sin modificar el estilo, el `<select>` muestra el chevron nativo del browser:
- Chrome: triángulo gris en la derecha
- Firefox: chevron doble (▲▼) en la derecha
- Safari: flecha redondeada con un estilo diferente al de Chrome

Ninguno de estos es consistente con el design system de SuriUI. Para que el trigger del Select sea visualmente idéntico al `Input` y al `Textarea`, el chevron nativo debe ser reemplazado.

### La solución: `appearance: none` + SVG data URI

```css
.select {
  /* Elimina el estilo nativo del browser incluyendo el chevron */
  appearance: none;
  -webkit-appearance: none;  /* Safari */

  /* Chevron custom como SVG inline en base64 */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--sui-space-3) center;
  background-size: var(--sui-select-chevron-size);

  /* Padding derecho para que el texto no solape el chevron */
  padding: 0 var(--sui-space-8) 0 var(--sui-space-3);
}
```

**Por qué data URI y no un elemento SVG separado:**

Las alternativas al data URI son:

| Alternativa | Problema |
|-------------|----------|
| `<svg>` como hijo del `<div>` wrapper con `position: absolute` | El click en el SVG puede no propagarse al `<select>` en algunos browsers |
| Fuente de iconos (FontAwesome, etc.) | Dependencia externa; el icono debe estar disponible en el bundle |
| CSS border trick (triángulo con borders) | No es un chevron real; no escala bien; difícil de mantener |
| Imagen externa (`url('/icons/chevron.svg')`) | Request HTTP adicional; URL puede ser incorrecta en el bundle del consumidor |

El SVG como data URI es la única opción que:
- No requiere dependencias externas
- No genera requests HTTP adicionales
- Es posicionable con `background-position`
- Funciona en todos los browsers modernos
- Puede ser sobreescrito por el consumidor via tokens CSS o `background-image`

**El SVG decodificado:**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
     viewBox="0 0 24 24" fill="none"
     stroke="%236b7280"  <!-- #6b7280 = --sui-color-text-secondary -->
     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m6 9 6 6 6-6"/>  <!-- chevron hacia abajo -->
</svg>
```

El color del stroke (`%236b7280` = `#6b7280`) está hardcodeado porque `background-image` no puede referenciar CSS Custom Properties. Esta es una limitación conocida del enfoque: el chevron no cambia de color automáticamente en modo oscuro o cuando el consumidor cambia `--sui-color-text-secondary`.

Para el caso del consumidor que necesita theming del chevron, la solución es overridear `background-image` con un nuevo SVG data URI que tenga el color correcto.

**El wrapper `div` y su necesidad:**

```tsx
<div className={styles.selectWrapper}>
  <select className={styles.select} />
</div>
```

El wrapper existe para el caso en que se necesite posicionar elementos sobre el select (como un spinner de loading en versiones futuras). En v1.0, el wrapper solo es necesario porque `<select>` no puede tener `::after` pseudo-elementos — de lo contrario, el chevron podría implementarse con `::after` directamente.

---

## Decisión 2: Placeholder como `<option disabled hidden>`

### El problema con los placeholders en `<select>`

Un select en su estado inicial (sin valor seleccionado) puede mostrar:
1. La primera opción de la lista directamente
2. Un placeholder que el usuario debe seleccionar

El placeholder parece simple pero tiene una restricción de validación:

```html
<!-- Opción seleccionable vacía — rompe required -->
<select required>
  <option value="">Selecciona un país</option>
  <option value="mx">México</option>
</select>
```

Si el placeholder tiene `value=""` y es seleccionable, el usuario puede "seleccionar" el placeholder y el formulario lo acepta como válido a pesar de que `required` está presente — el valor vacío pasa la validación nativa del browser.

```html
<!-- Solo disabled — visible en el dropdown, confuso -->
<select required>
  <option value="" disabled>Selecciona un país</option>
  <option value="mx">México</option>
</select>
```

Con solo `disabled`, la opción de placeholder aparece en el dropdown cuando el usuario lo abre — el usuario ve "Selecciona un país" como una opción pero no puede seleccionarla. Confuso.

### La solución: `disabled` + `hidden`

```html
<!-- disabled hidden — estado inicial correcto, no aparece en dropdown -->
<select required>
  <option value="" disabled hidden>Selecciona un país</option>
  <option value="mx">México</option>
</select>
```

La combinación `disabled hidden` produce:
- **Estado inicial**: el placeholder es visible en el trigger (el select muestra "Selecciona un país")
- **Dropdown abierto**: el placeholder NO aparece como opción seleccionable
- **Validación `required`**: el formulario no acepta el select sin una selección real, porque el valor `""` de la opción placeholder no puede ser seleccionado explícitamente

Implementación en el componente:

```tsx
{placeholder && (
  <option value="" disabled hidden>
    {placeholder}
  </option>
)}
```

La opción de placeholder solo se renderiza cuando el consumidor pasa la prop `placeholder`. Si no hay placeholder, el select muestra la primera opción por defecto.

**Nota de compatibilidad:** `hidden` en `<option>` tiene soporte universal en Chrome, Firefox y Safari modernos. En IE11 (fuera de scope), `hidden` es ignorado y la opción aparece en el dropdown.

---

## Decisión 3: API de opciones con `SelectItem` union type y `optgroup`

### El problema de las APIs planas vs agrupadas

Un select puede necesitar opciones planas o agrupadas:

```tsx
// Plano
<Select options={[
  { value: 'mx', label: 'México' },
  { value: 'es', label: 'España' }
]} />

// Agrupado
<Select options={[
  { group: 'América', options: [{ value: 'mx', label: 'México' }] },
  { group: 'Europa', options: [{ value: 'es', label: 'España' }] }
]} />
```

Dos APIs separadas (`options` para plano, `groups` para agrupado) requieren que el consumidor elija la API correcta y no pueden mezclar opciones planas y agrupadas en el mismo select.

### La solución: union type con type guard

```tsx
export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export type SelectOptionGroup = {
  group: string
  options: SelectOption[]
}

export type SelectItem = SelectOption | SelectOptionGroup

function isGroup(item: SelectItem): item is SelectOptionGroup {
  return 'group' in item
}
```

Una sola prop `options: SelectItem[]` acepta opciones planas, grupos, y cualquier combinación:

```tsx
// Mix de planas y agrupadas en el mismo array
<Select options={[
  { value: 'popular', label: 'México (popular)' },
  { group: 'América', options: [{ value: 'us', label: 'Estados Unidos' }] },
  { group: 'Europa', options: [{ value: 'es', label: 'España' }] }
]} />
```

**El type guard `isGroup()`:**

```tsx
function isGroup(item: SelectItem): item is SelectOptionGroup {
  return 'group' in item
}
```

`isGroup` es un type guard — una función que retorna `boolean` con un type predicate (`item is SelectOptionGroup`). Cuando TypeScript ve que `isGroup(item)` es verdadero, infiere que `item` es `SelectOptionGroup` dentro del bloque condicional.

```tsx
{options.map((item) =>
  isGroup(item) ? (
    <optgroup key={item.group} label={item.group}>
      {item.options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </optgroup>
  ) : (
    <option key={item.value} value={item.value}>
      {item.label}
    </option>
  )
)}
```

Sin el type guard, TypeScript no podría distinguir `SelectOption` de `SelectOptionGroup` dentro del ternario y marcaría `item.group`, `item.options`, `item.value` y `item.label` como potencialmente inexistentes.

**Por qué `'group' in item` y no `item.group !== undefined`:**

`'group' in item` es el discriminante correcto porque TypeScript puede usarlo como type narrowing. `item.group !== undefined` también funcionaría como runtime check pero TypeScript no siempre lo usa para narrowing en todos los contextos. El operador `in` es el patrón recomendado para discriminar union types en TypeScript.

### `Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'>`

El Select acepta opciones via la prop `options`, no via `children`. Si `SelectProps` extendiera `SelectHTMLAttributes` sin modificar, el consumidor podría pasar `children` al componente:

```tsx
<Select options={flatOptions}>
  <option value="extra">Extra</option>  // ← comportamiento inesperado
</Select>
```

`Omit<..., 'children'>` elimina `children` de los atributos heredados, haciendo que TypeScript rechace cualquier intento de pasar contenido como hijo:

```tsx
// Error de TypeScript:
<Select options={flatOptions}>...</Select>
// Property 'children' does not exist on type 'SelectProps'
```

La API de Select es exclusivamente declarativa via `options` — no composicional via `children`. `Omit` hace esto explícito en el tipo.

---

## Consecuencias

### Positivas

- **Chevron consistente entre browsers**: `appearance: none` + SVG data URI produce el mismo resultado visual en Chrome, Firefox y Safari
- **Placeholder sin bugs de validación**: `disabled hidden` previene la selección del placeholder manteniendo `required` funcional
- **API única para planas y agrupadas**: el consumidor no necesita elegir entre dos props distintas
- **TypeScript correcto**: type guard + `Omit<children>` hacen la API predecible y segura
- **Cero requests HTTP adicionales**: el SVG chevron está inline en el CSS

### Negativas y mitigaciones

| Consecuencia | Mitigación |
|--------------|------------|
| Color del chevron no responde a CSS Custom Properties | Documentado; el consumidor puede overridear `background-image` con un SVG de color diferente |
| El wrapper `div` adicional aumenta el DOM en un nivel | Mínimo; necesario para extensibilidad futura del componente |
| El placeholder `disabled hidden` no es estándar en todos los browsers (IE11) | IE11 fuera de scope; Chrome/Firefox/Safari tienen soporte completo |

---

## Alternativas consideradas y descartadas

| Alternativa | Razón de descarte |
|-------------|-------------------|
| Chevron como elemento SVG con `position: absolute` | Puede capturar clicks en algunos browsers, bloqueando la apertura del select |
| Chevron como fuente de iconos | Dependencia externa innecesaria |
| Placeholder como `<option value="">` seleccionable | Rompe la validación `required` — el valor vacío es aceptado |
| Placeholder solo con `disabled` (sin `hidden`) | El placeholder aparece como opción en el dropdown, confundiendo al usuario |
| Props separadas para `options` y `groups` | Menos flexible; no permite mezclar planas y agrupadas |
| `children` como API de opciones | Requiere que el consumidor gestione la estructura JSX de `<option>` y `<optgroup>` manualmente |

---

## Referencias

- [HTML spec — `option` element — `disabled` attribute](https://html.spec.whatwg.org/multipage/form-elements.html#attr-option-disabled)
- [CSS `appearance` property — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/appearance)
- [SVG as CSS background-image — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/background-image)
- [TypeScript — Type guards and narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- [TypeScript — Discriminated unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
- [CSS Custom Properties in SVG data URIs — workarounds](https://css-tricks.com/svg-properties-and-css/)