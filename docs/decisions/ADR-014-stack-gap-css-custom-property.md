# ADR-014 · Gap en Stack via CSS custom property inline vs clases CSS por valor

| Campo       | Valor                          |
|-------------|--------------------------------|
| **Estado**  | Aceptado                       |
| **Fecha**   | 2026-06                        |
| **Autores** | Sergio Uribe Frenkel           |
| **Proyecto**| SuriUI — `@suribef/suri-ui`    |
| **Componentes afectados** | `Stack` |

---

## Contexto

`Stack` es un componente de layout que aplica `gap` entre sus hijos usando flexbox. La prop `gap` acepta una escala numérica discreta (`1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12`) que mapea a los tokens de espaciado de SuriUI (`--sui-space-1` a `--sui-space-12`).

La pregunta de implementación es cómo aplicar el valor de `gap` al elemento DOM. Las dos opciones son:

1. **Clases CSS por valor** — una clase por cada valor posible de la escala
2. **CSS custom property inline** — una variable CSS inyectada directamente en el atributo `style` del elemento

---

## Las dos opciones

### Opción A — Clases CSS por valor

```css
/* Stack.module.css */
.gap-1  { gap: var(--sui-space-1); }
.gap-2  { gap: var(--sui-space-2); }
.gap-3  { gap: var(--sui-space-3); }
.gap-4  { gap: var(--sui-space-4); }
.gap-5  { gap: var(--sui-space-5); }
.gap-6  { gap: var(--sui-space-6); }
.gap-8  { gap: var(--sui-space-8); }
.gap-10 { gap: var(--sui-space-10); }
.gap-12 { gap: var(--sui-space-12); }
```

```tsx
// Stack.tsx
<AnyElement className={cn(styles.stack, styles[`gap-${gap}`])} />
```

### Opción B — CSS custom property inline

```css
/* Stack.module.css */
.stack {
  gap: var(--sui-stack-gap, var(--sui-space-4)); /* fallback al default */
}
/* Sin clases de gap */
```

```tsx
// Stack.tsx
const gapValue = `var(--sui-space-${gap})`

<AnyElement
  style={{ '--sui-stack-gap': gapValue, ...style } as React.CSSProperties}
/>
```

---

## Decisión

**Opción B: CSS custom property inline.**

---

## Razonamiento

### El problema de escala de las clases CSS

La Opción A funciona correctamente para una escala fija de 9 valores. El problema aparece cuando se considera la evolución del sistema:

Si la escala crece de 9 a 20 valores, se añaden 11 reglas CSS al bundle de todos los consumidores, independientemente de cuáles usen. Con CSS Modules y Vite, **todas las clases de un `.module.css` se incluyen en el bundle** — no existe tree-shaking de reglas CSS individuales dentro de un módulo.

Con la Opción B, el bundle CSS de Stack es siempre el mismo tamaño independientemente del tamaño de la escala. Los valores de la escala viven en los tokens (`:root` en `tokens/index.css`) y son referenciados por nombre, no codificados como clases.

### El valor `var(--sui-space-${gap})` como referencia, no como valor

La custom property inline no inyecta el valor numérico directamente:

```tsx
// Inyecta el valor — rompe theming si el consumidor cambia el token
style={{ gap: '1rem' }}

// Inyecta una referencia al token — respeta overrides del consumidor
style={{ '--sui-stack-gap': 'var(--sui-space-4)' }}
```

Con la primera forma, si el consumidor overridea `--sui-space-4: 1.25rem` para su sistema de diseño, el Stack no lo respeta — tiene `1rem` hardcodeado en el atributo `style`.

Con la segunda forma, `--sui-stack-gap` apunta a `--sui-space-4`, que a su vez es resuelto por el valor actual del token en el contexto del consumidor. El override funciona correctamente.

### El fallback como documentación del default

```css
.stack {
  gap: var(--sui-stack-gap, var(--sui-space-4));
}
```

El fallback `var(--sui-space-4)` en el CSS cumple dos propósitos:

1. **Funcional**: si por alguna razón `--sui-stack-gap` no está definido en el elemento (edge case de renderizado SSR con CSS desincronizado), el gap tiene un valor sensato
2. **Documental**: cualquier persona que lea el CSS ve inmediatamente cuál es el gap por defecto sin necesidad de leer el TypeScript

### Merging con el `style` del consumidor

```tsx
style={{ '--sui-stack-gap': gapValue, ...style } as React.CSSProperties}
```

La custom property se define primero y el `style` del consumidor se aplica después (`...style`). Esto significa que si el consumidor pasa `style={{ '--sui-stack-gap': 'var(--sui-space-8)' }}`, **su valor tiene precedencia** sobre el valor calculado desde la prop `gap`. La prop `gap` es la API de alto nivel; la custom property es la API de bajo nivel que el consumidor puede overridear si necesita escape hatch.

Este orden de merging es intencional y consistente con el principio de que el código del consumidor siempre tiene la última palabra.

### Por qué `GapScale` como literal union en lugar de `number`

```tsx
// Demasiado permisivo — el consumidor puede pasar gap={7}
// que no tiene token correspondiente
type GapScale = number

// Solo valores con tokens definidos son válidos en TypeScript
type GapScale = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12
```

La unión de literales hace que TypeScript rechace en tiempo de compilación valores que no tienen token correspondiente. El consumidor obtiene autocompletado con los valores válidos y un error descriptivo si pasa un valor fuera de la escala.

El salto en la escala (`7` y `9` y `11` no existen) está justificado por el diseño: la escala de espaciado de SuriUI sigue el patrón de Tailwind CSS de 4px base con incrementos que evitan valores arbitrarios poco usados.

---

## Consecuencias

### Positivas

- **Bundle CSS constante**: el tamaño del módulo CSS de Stack no crece con la escala de tokens
- **Theming correcto**: los valores referencian tokens, no valores numéricos hardcodeados
- **Escala extensible**: añadir `--sui-space-14` a tokens no requiere ningún cambio en Stack
- **Escape hatch**: el consumidor puede overridear `--sui-stack-gap` directamente en `style` cuando necesita un valor fuera de la escala
- **Default documentado en CSS**: el fallback del `var()` hace el default legible sin inspeccionar TypeScript

### Negativas y mitigaciones

| Consecuencia | Mitigación |
|--------------|------------|
| CSS custom properties inline tienen una prioridad de especificidad muy alta — pueden ser difíciles de overridear desde una hoja de estilos externa | Documentado: para overridear, usar la prop `gap` o `style={{ '--sui-stack-gap': '...' }}` directamente |
| `as React.CSSProperties` es un cast necesario porque TypeScript no incluye CSS custom properties en `CSSProperties` por defecto | El cast es seguro y limitado a la declaración del `style`; no oculta errores en otras partes del componente |
| La resolución de `var(--sui-stack-gap)` depende del soporte de CSS custom properties — IE11 no las soporta | IE11 está fuera del scope de soporte (React 18 lo descartó) |

---

## Alternativas consideradas y descartadas

| Alternativa | Razón de descarte |
|-------------|-------------------|
| Clases CSS por valor de gap (Opción A) | Bundle CSS crece con la escala; clases no usadas se incluyen de todos modos |
| Inyectar el valor numérico directamente (`style={{ gap: '1rem' }}`) | Rompe theming: los overrides de tokens del consumidor no se propagan al componente |
| Calcular gap en el componente con `getComputedStyle` | Requiere acceso al DOM; rompe SSR; innecesariamente complejo |
| `gap` como string libre (`gap?: string`) | Permite valores arbitrarios que rompen la consistencia del design system; sin autocompletado de TypeScript |

---

## Referencias

- [CSS — Custom Properties (variables)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [CSS — `var()` fallback values](https://developer.mozilla.org/en-US/docs/Web/CSS/var#fallback_values)
- [CSS — `gap` (flexbox)](https://developer.mozilla.org/en-US/docs/Web/CSS/gap)
- [TypeScript — Template literal types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [Vite — CSS Modules and tree-shaking limitations](https://vitejs.dev/guide/features#css-modules)