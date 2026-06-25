# ADR-007 · Spinner standalone vs dependencia interna de Button

| Campo       | Valor                          |
|-------------|--------------------------------|
| **Estado**  | Aceptado                       |
| **Fecha**   | 2025-06                        |
| **Autores** | Sergio Uribe Frenkel           |
| **Proyecto**| SuriUI — `@suribef/suri-ui`    |
| **Componentes afectados** | `Button`, `Spinner` |

---

## Contexto

Button ya incluía un spinner visual en su estado `loading`, implementado directamente en `Button.module.css`:

```css
/* Button.module.css */
.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

Al añadir el componente `Spinner` independiente, surgió la decisión: ¿debe Button reutilizar `Spinner` internamente, o mantener su propio spinner autocontenido?

Las dos opciones son estructuralmente distintas y tienen consecuencias que van más allá de las 10 líneas de CSS en cuestión.

---

## Las dos opciones

### Opción A — DRY: Button depende de Spinner

```tsx
// Button.tsx — Opción A
import { Spinner } from '../Spinner'

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ loading, children, ...props }, ref) => {
    return (
      <button ref={ref} {...props}>
        {loading && <Spinner size="sm" label="" aria-hidden />}
        <span>{children}</span>
      </button>
    )
  }
)
```

Button deja de duplicar los ~10 líneas de CSS del spinner. Un único origen de verdad para el spinner visual.

### Opción B — Standalone: Button mantiene su propio spinner

```tsx
// Button.tsx — Opción B
// Sin import de Spinner
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ loading, children, ...props }, ref) => {
    return (
      <button ref={ref} {...props}>
        {loading && <span className={styles.spinner} aria-hidden="true" />}
        <span>{children}</span>
      </button>
    )
  }
)
```

Button tiene ~10 líneas de CSS duplicadas respecto a Spinner. Pero no tiene ninguna dependencia en tiempo de ejecución de otro componente de la librería.

---

## Decisión

**Opción B: Button mantiene su propio spinner. Spinner es completamente standalone.**

---

## Razonamiento

### El problema con la Opción A: tree-shaking quebrado

El tree-shaking funciona eliminando exports que no son importados por el consumidor. En ESM, un bundler como Rollup o esbuild puede eliminar `Spinner` del bundle final si el consumidor nunca escribe:

```ts
import { Spinner } from '@suribef/suri-ui'
```

Con la Opción A, Button importa Spinner internamente:

```ts
// Button.tsx
import { Spinner } from '../Spinner'
```

Este import crea una **dependencia de módulo en tiempo de ejecución**. El bundler del consumidor, al incluir `Button` en su bundle, debe incluir también `Spinner` porque Button lo referencia. El consumidor que importa `Button` pero no `Spinner` termina con el código de `Spinner` en su bundle de todas formas.

```
Consumidor escribe:        import { Button } from '@suribef/suri-ui'
Bundle del consumidor:     Button + Spinner (arrastrado como dependencia)
Bundle esperado:           Button solamente
```

Para una librería pequeña como SuriUI este costo es trivial. El principio, sin embargo, no lo es: una dependencia oculta entre componentes siempre aumenta el tamaño del bundle del consumidor más de lo que el consumidor puede anticipar al leer la API pública.

### El problema con la Opción A: acoplamiento de diseño

El spinner de Button y el spinner de Spinner tienen **propósitos distintos** que pueden divergir:

| | Button spinner | Spinner componente |
|---|---|---|
| **Propósito** | Indicador inline de estado loading en un botón | Live region accesible para loading de secciones |
| **Tamaño** | Fijo: 14px (proporcional al botón) | Configurable: sm/md/lg |
| **Accesibilidad** | `aria-hidden` (el Button ya comunica el estado) | `role="status"` + texto sr-only |
| **Color** | `currentColor` (hereda del botón) | `var(--sui-color-primary)` |
| **Animación** | `0.6s linear` | `0.75s linear` |

Si Button usa Spinner internamente, cualquier cambio en la API de Spinner (nueva prop, cambio de timing, cambio de tamaño base) puede afectar inadvertidamente el comportamiento visual de Button. Los componentes primitivos deben poder evolucionar de forma independiente.

### El costo real de la duplicación

Las ~10 líneas duplicadas son:

```css
/* En Button.module.css */
.spinner {
  display: inline-block;
  width: 14px; height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

```css
/* En Spinner.module.css */
.svg { animation: spin 0.75s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
```

No son exactamente las mismas líneas — la animación de Button usa un border trick CSS, la de Spinner usa un SVG con stroke. Son implementaciones distintas del mismo concepto visual, no duplicación literal de código.

La única línea verdaderamente duplicada es `@keyframes spin`. El "costo" de la duplicación es ~2 líneas de CSS, no 10. El trade-off es claro: 2 líneas de CSS duplicadas a cambio de aislamiento total de componentes.

### La regla de oro de librerías de componentes

En una aplicación, DRY es prioritario porque el desarrollador controla todos los imports y puede garantizar que las dependencias internas estén disponibles. En una librería publicada, la prioridad es la **predictibilidad del bundle**: el consumidor debe poder importar cualquier subconjunto de la librería y obtener exactamente lo que importó, sin dependencias implícitas.

Esta es la misma razón por la que `@radix-ui/react-button` no depende de `@radix-ui/react-spinner` — cada primitivo de Radix es publicado como paquete npm independiente, con cero dependencias cruzadas en runtime.

---

## Consecuencias

### Positivas

- **Tree-shaking honesto**: importar `Button` incluye exactamente `Button`, sin `Spinner`
- **Evolución independiente**: los estilos de cada componente pueden cambiar sin riesgo de regresión cruzada
- **Aislamiento testeable**: los tests de Button no dependen de la implementación de Spinner
- **Bundle predecible**: el consumidor puede calcular el tamaño de su bundle sumando los componentes que importa, sin sorpresas

### Negativas y mitigaciones

| Consecuencia | Mitigación |
|--------------|------------|
| ~2 líneas de CSS duplicadas (`@keyframes spin`) | Aceptable: el aislamiento vale el costo; son implementaciones visualmente similares pero técnicamente distintas |
| Si el equipo decide cambiar la duración de la animación globalmente, hay dos lugares para actualizar | Documentado como comportamiento intencional; un design token de animación (`--sui-transition-spin`) puede resolver esto en el futuro sin romper el aislamiento |

---

## Alternativas consideradas y descartadas

| Alternativa | Razón de descarte |
|-------------|-------------------|
| Button importa Spinner (Opción A) | Rompe tree-shaking; crea acoplamiento de evolución entre componentes |
| CSS compartido en archivo común (`shared/spinner.css`) | Importarlo desde dos `.module.css` distintos duplica el CSS en el bundle igualmente; agrega complejidad sin ventaja |
| Design token de animación `--sui-transition-spin` para unificar duración | No resuelve el problema de dependencia de runtime; la animación sería consistente pero el acoplamiento seguiría existiendo |

---

## Nota sobre el futuro

Si SuriUI adopta un sistema de animaciones basado en tokens, el `@keyframes spin` puede centralizarse en `tokens/index.css` (donde ya están las Custom Properties), convirtiéndolo en una utilidad global sin crear dependencias entre componentes:

```css
/* tokens/index.css — eventual mejora */
@keyframes sui-spin {
  to { transform: rotate(360deg); }
}
```

Los componentes referenciarían `animation: sui-spin 0.75s linear infinite` sin importar nada entre sí. Este es un patrón usado por Chakra UI. Se documenta aquí como dirección futura, no como deuda técnica urgente.

---

## Referencias

- [Rollup — Tree Shaking](https://rollupjs.org/introduction/#tree-shaking)
- [Radix UI — monorepo structure (un paquete por primitivo)](https://github.com/radix-ui/primitives/tree/main/packages/react)
- [Chakra UI — design tokens para animaciones](https://v2.chakra-ui.com/docs/styled-system/theme#animation)
- [esbuild — tree shaking en ESM vs CJS](https://esbuild.github.io/api/#tree-shaking)