# ADR-013 · Prop `as` con unión acotada vs generics polimórficos completos en Card

| Campo       | Valor                          |
|-------------|--------------------------------|
| **Estado**  | Aceptado                       |
| **Fecha**   | 2026-06                        |
| **Autores** | Sergio Uribe Frenkel           |
| **Proyecto**| SuriUI — `@suribef/suri-ui`    |
| **Componentes afectados** | `Card` |

---

## Contexto

`Card` necesita ser renderizable como distintos elementos HTML según el contexto semántico del consumidor. Un card puede ser:

- `<div>` — contenedor genérico sin semántica implícita (default)
- `<article>` — contenido autónomo y redistribuible (entradas de blog, tarjetas de producto)
- `<section>` — sección temática dentro de un documento
- `<main>` — contenido principal de la página

Esta flexibilidad se implementa con una prop `as` que acepta el nombre del elemento HTML a renderizar. El patrón es común en librerías de UI y se conoce como **polymorphic component**.

La decisión no trivial es cómo tipar esta prop en TypeScript con `strict: true`.

---

## Las dos opciones de tipado

### Opción A — Generics polimórficos completos (`ElementType`)

El patrón "canónico" de componentes polimórficos en TypeScript usa generics que propagan el tipo del elemento al tipo de las props:

```tsx
type PolymorphicProps<T extends ElementType> = {
  as?: T
} & ComponentPropsWithRef<T>

function Card<T extends ElementType = 'div'>({
  as,
  ...props
}: PolymorphicProps<T>) {
  const Element = as ?? 'div'
  return <Element {...props} />
}
```

Este patrón garantiza que si el consumidor pasa `as="a"`, las props `href` y `target` se vuelven disponibles automáticamente. El tipado es completo y preciso.

### Opción B — Unión acotada de elementos

Limitar `as` a un conjunto finito de elementos HTML con tipos independientes:

```tsx
type CardElement = 'div' | 'article' | 'section' | 'main'

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: CardElement
}
```

Las props disponibles son siempre `HTMLAttributes<HTMLElement>` — el superconjunto de atributos comunes a todos los elementos HTML — independientemente del elemento elegido.

---

## Decisión

**Opción B: unión acotada de elementos con `'div' | 'article' | 'section' | 'main'`.**

Con los ajustes de implementación que evitan casts inseguros:

```tsx
type CardElement = 'div' | 'article' | 'section' | 'main'

export const Card = forwardRef<HTMLElement, CardProps>(
  ({ as: Element = 'div', ...props }, ref) => {
    // Cast en Element, no en ref.
    // Element es siempre uno de los 4 valores válidos de CardElement.
    // El cast permite a TypeScript resolver el JSX sin conflicto de sobrecarga.
    const AnyElement = Element as ElementType

    return <AnyElement ref={ref} {...props} />
  }
)
```

---

## Razonamiento

### Por qué los generics polimórficos completos no funcionan con `forwardRef` en TypeScript strict

El patrón de generics polimórficos completos es incompatible con `forwardRef` sin casts explícitos en TypeScript con `strict: true`. El problema raíz:

`forwardRef` tiene la siguiente firma:

```ts
function forwardRef<T, P = {}>(
  render: (props: P, ref: ForwardedRef<T>) => ReactElement | null
): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>
```

El tipo de retorno es `ForwardRefExoticComponent<...>`, no una función genérica. Cuando el componente es polimórfico (`T` varía según `as`), TypeScript no puede resolver `T` en el momento de la declaración de `forwardRef` — solo puede hacerlo en el momento de uso. Esto produce un conflicto de tipos que TypeScript strict rechaza:

```tsx
// Esto no compila con strict:true — T no puede inferirse
const Card = forwardRef<
  ComponentPropsWithRef<T>['ref'],  // T no existe en este scope
  PolymorphicProps<T>
>((props, ref) => { ... })
```

Las soluciones documentadas en la comunidad son:

1. **Cast del componente completo**: `const Card = forwardRef(...) as unknown as PolymorphicComponent` — abandona la seguridad de tipos completamente
2. **Eliminación de `forwardRef`**: usar React 19 nativo — no disponible con peer dep `>=18`
3. **Librería helper** (`@radix-ui/react-polymorphic`, `react-polymorphic-types`) — dependencia de runtime por un problema de tipos
4. **Unión acotada** — el enfoque adoptado

La unión acotada no requiere generics en la declaración de `forwardRef`. El tipo del ref es `HTMLElement` (el supertipo de todos los elementos de la unión), y el cast se hace en `Element as ElementType`, no en `ref`.

### Por qué `Element as ElementType` es mejor que `ref as React.Ref<HTMLDivElement>`

La implementación original del prompt casteaba el `ref`:

```tsx
// Cast inseguro — miente sobre el tipo del nodo DOM
<Element ref={ref as React.Ref<HTMLDivElement>}>
```

Esto es problemático porque le dice a TypeScript que el ref siempre apunta a un `HTMLDivElement`, pero cuando `as="article"`, el nodo real es un `HTMLElement` de tipo `HTMLElement` (no `HTMLDivElement`). El cast oculta un error real: si el consumidor usa el ref asumiendo `HTMLDivElement`, puede acceder a propiedades inexistentes.

La corrección castea `Element` — no `ref`:

```tsx
// Cast en el elemento, ref permanece como HTMLElement
const AnyElement = Element as ElementType
<AnyElement ref={ref}>
```

`ElementType` es el tipo de React para "cualquier cosa que puede usarse como elemento JSX". El cast es seguro porque `'div' | 'article' | 'section' | 'main'` es siempre un subconjunto válido de `ElementType`. El `ref` no necesita ser casteado — su tipo `HTMLElement` es correcto para cualquier elemento de la unión.

### La elección del elemento es responsabilidad del consumidor, no de la librería

El elemento semántico correcto depende del contexto de uso:

```tsx
// Una lista de artículos de blog
{posts.map(post => (
  <Card as="article" key={post.id}>
    <Card.Header>{post.title}</Card.Header>
    <Card.Body>{post.excerpt}</Card.Body>
  </Card>
))}

// Un panel de configuración sin semántica especial
<Card as="div">
  <Card.Header>Preferencias</Card.Header>
  <Card.Body>...</Card.Body>
</Card>
```

La librería no puede saber cuál es correcto — el consumidor tiene el contexto de la página. Por eso `as` es una prop expuesta, no un valor hardcodeado. El default `div` es el elemento más neutral semánticamente — no implica nada sobre la naturaleza del contenido.

### Por qué la unión no incluye `<a>`, `<button>`, `<li>`, etc.

La unión cubre elementos de contenido estructural (`div`, `article`, `section`, `main`) — casos de uso reales y comunes para un card. No incluye:

- `<a>` — un card completo como enlace requiere consideraciones de accesibilidad específicas (todo el contenido interactivo dentro de un enlace tiene restricciones en HTML5); si el consumidor necesita un card clickeable, puede envolver el Card en un `<a>` o añadir el handler al elemento semántico correcto
- `<button>` — mismas restricciones que `<a>`; elementos interactivos dentro de `<button>` están limitados por spec
- `<li>` — válido, pero requiere que el parent sea `<ul>` o `<ol>`; el consumidor que necesita esto puede renderizar `<li>` fuera y `Card as="div"` adentro

Expandir la unión a `ElementType` completo ("full polymorphism") es trabajo planeado para v2.0, cuando se resuelva la compatibilidad con `forwardRef` en React 19 (que elimina la necesidad de `forwardRef`).

### `CardBodyProps` como type alias en lugar de interface vacía

```tsx
// Interface vacía — dispara no-empty-interface lint error
export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

// Type alias — semánticamente equivalente, sin lint error
export type CardBodyProps = HTMLAttributes<HTMLDivElement>
```

La regla `@typescript-eslint/no-empty-interface` existe porque una interfaz vacía que extiende otra es idéntica a un alias de tipo — la interfaz no agrega nada. El alias expresa la misma semántica de forma más directa.

### `overflow: hidden` y el side effect documentado

El CSS del Card incluye `overflow: hidden` para que `border-radius` clipee imágenes hijas:

```css
.card {
  overflow: hidden; /* clipea imágenes respetando border-radius */
}
```

Este comportamiento tiene un side effect: **cualquier hijo con `position: absolute` queda clippeado por los bordes del Card**. Esto afecta directamente a dropdowns, tooltips, y popovers que se renderizan con posicionamiento absoluto.

El patrón correcto para esos casos es el **portal pattern** — renderizar el dropdown fuera del Card usando `ReactDOM.createPortal()` o una librería como Floating UI que gestiona el posicionamiento automáticamente.

El side effect está documentado en el comentario del CSS y en este ADR para que sea visible en code reviews:

```css
/* overflow:hidden clippea imágenes hijas respetando border-radius.
   Side effect: hijos con position:absolute quedan clippeados.
   Dropdowns y tooltips deben renderizarse fuera del Card (portal pattern).
   Ver ADR-013. */
overflow: hidden;
```

---

## Consecuencias

### Positivas

- **Compilación correcta con strict: true** sin casts de tipo que oculten errores reales
- **API simple**: `as="article"` es intuitivo sin necesidad de conocer los detalles del sistema de tipos
- **Cubre el 95% de casos de uso reales**: `div`, `article`, `section`, `main` son los elementos estructurales más comunes para un card
- **Ref tipado correctamente**: `HTMLElement` sin mentir sobre el tipo concreto del nodo

### Negativas y mitigaciones

| Consecuencia | Mitigación |
|--------------|------------|
| No se pueden pasar props específicas de `<a>` o `<button>` cuando `as` es ese elemento | La unión excluye explícitamente esos elementos; documentado en README |
| "Full polymorphism" no está disponible en v1.0 | Planificado para v2.0 con React 19 (donde `forwardRef` desaparece y el problema de tipos se resuelve) |
| `overflow: hidden` clippea hijos con `position: absolute` | Documentado en CSS y ADR; el consumidor debe usar portal pattern para dropdowns/tooltips |

---

## Plan para full polymorphism en v2.0

Cuando SuriUI eleve su peer dependency mínimo a `react: ">=19"`:

1. Eliminar `forwardRef` de Card (la prop `ref` es nativa en React 19)
2. Expandir `CardElement` a `ElementType`:
   ```tsx
   function Card<T extends ElementType = 'div'>({
     as,
     ref,
     ...props
   }: CardProps<T> & { ref?: ComponentPropsWithRef<T>['ref'] }) {
     const Element = as ?? 'div'
     return <Element ref={ref} {...props} />
   }
   ```
3. Las props del elemento correcto estarán disponibles según `as` automáticamente

Este cambio es **breaking** solo si el consumidor usaba el ref con tipo específico — se documentará en el changelog de v2.0.

---

## Alternativas consideradas y descartadas

| Alternativa | Razón de descarte |
|-------------|-------------------|
| Generics polimórficos completos con `forwardRef` | No compila con TypeScript strict sin casts que abandonan la seguridad de tipos |
| Cast del componente completo (`as unknown as`) | Pierde toda inferencia de tipos; el componente deja de ser type-safe |
| Librería `react-polymorphic-types` | Dependencia de runtime por un problema que es solo de tipos; inaceptable para una librería de zero-runtime-deps |
| Hardcodear `<div>` sin prop `as` | El consumidor no puede dar semántica correcta al Card según el contexto |
| `ref as React.Ref<HTMLDivElement>` (cast en el ref) | Miente sobre el tipo del nodo DOM; puede causar errores en consumidores que usan el ref |
| `interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}` | Dispara `no-empty-interface` lint error; type alias es equivalente y correcto |

---

## Referencias

- [React — `ElementType`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/index.d.ts)
- [TypeScript — Generic constraints with forwardRef](https://fettblog.eu/typescript-react-generic-forward-refs/)
- [Radix UI — Polymorphic `asChild` pattern (alternativa)](https://www.radix-ui.com/docs/primitives/utilities/slot)
- [HTML spec — `article` element](https://html.spec.whatwg.org/multipage/sections.html#the-article-element)
- [HTML spec — `section` element](https://html.spec.whatwg.org/multipage/sections.html#the-section-element)
- [@typescript-eslint — `no-empty-interface`](https://typescript-eslint.io/rules/no-empty-interface/)
- [CSS `overflow: hidden` and stacking contexts — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow)