# ADR-016 · `useCombinedRef` — combinar ref interno con forwardRef externo

| Campo       | Valor                          |
|-------------|--------------------------------|
| **Estado**  | Aceptado                       |
| **Fecha**   | 2025-06                        |
| **Autores** | Sergio Uribe                   |
| **Proyecto**| SuriUI — `@suribef/suri-ui`   |
| **Componentes afectados** | `Textarea` (autoResize), y cualquier componente que necesite acceso interno al DOM mientras expone ref al consumidor |

---

## Contexto

`Textarea` necesita acceso directo al nodo DOM para implementar `autoResize`: leer `scrollHeight` y actualizar `style.height` de forma imperativa. La implementación natural es un `useRef` interno:

```tsx
const internalRef = useRef<HTMLTextAreaElement>(null)

useEffect(() => {
  if (!autoResize || !internalRef.current) return
  const el = internalRef.current
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}, [autoResize, value])
```

Al mismo tiempo, `Textarea` usa `forwardRef` para exponer el nodo DOM al consumidor (integración con React Hook Form, focus management). `forwardRef` recibe el ref del consumidor como segundo argumento:

```tsx
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (props, forwardedRef) => {
    // forwardedRef apunta al nodo para el consumidor
    // internalRef apunta al nodo para el efecto de autoResize
    // El <textarea> solo acepta un atributo ref
  }
)
```

Un elemento DOM acepta un solo `ref`. Si el `<textarea>` recibe `ref={internalRef}`, el `forwardedRef` queda desconectado — el consumidor obtiene `null`. Si recibe `ref={forwardedRef}`, `internalRef` queda desconectado — el efecto de autoResize no puede leer `scrollHeight`.

---

## Decisión

**Crear la utilidad `useCombinedRef` que combina múltiples refs en un único `RefCallback`** y exportarla como utilidad pública de la librería.

```ts
// src/utils/useCombinedRef.ts
export function useCombinedRef<T>(
  ...refs: (Ref<T> | null | undefined)[]
): RefCallback<T> {
  return useCallback(
    (node: T) => {
      refs.forEach((ref) => {
        if (!ref) return
        if (typeof ref === 'function') {
          ref(node)         // RefCallback — invocar directamente
        } else {
          (ref as MutableRefObject<T>).current = node  // RefObject — asignar .current
        }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  )
}
```

```tsx
// Textarea.tsx
const internalRef = useRef<HTMLTextAreaElement>(null)
const combinedRef = useCombinedRef(internalRef, forwardedRef)

<textarea ref={combinedRef} />
// → internalRef.current apunta al nodo (para autoResize)
// → forwardedRef apunta al nodo (para el consumidor)
```

---

## Razonamiento

### Cómo funciona un `RefCallback`

React acepta dos tipos de valores en la prop `ref`:

1. **`RefObject`** — creado con `useRef()`: React asigna `ref.current = node` cuando el elemento monta y `ref.current = null` cuando desmonta
2. **`RefCallback`** — una función: React la invoca con el nodo cuando monta (`fn(node)`) y con `null` cuando desmonta (`fn(null)`)

`useCombinedRef` devuelve un `RefCallback` que, cuando es invocado por React, propaga el nodo a todos los refs en la lista. El mismo nodo llega a `internalRef.current` y a `forwardedRef` (sea este un `RefObject` o un `RefCallback` pasado desde el exterior).

### El caso de `forwardedRef` nulo

`forwardedRef` es `null` cuando el consumidor no pasa `ref`:

```tsx
<Textarea label="Mensaje" />  // sin ref → forwardedRef es null
```

`useCombinedRef` maneja este caso explícitamente:

```ts
if (!ref) return  // null/undefined — saltar sin error
```

Pasar un `null` al combinador no produce error — simplemente se omite. Esto hace que `useCombinedRef` sea seguro para usar siempre, independientemente de si el consumidor pasa `ref` o no.

### El caso de `forwardedRef` como `RefCallback`

React Hook Form, cuando integra con componentes mediante `ref`, puede pasar un `RefCallback` en lugar de un `RefObject`:

```tsx
const { register } = useForm()
const { ref, ...rest } = register('mensaje')
<Textarea ref={ref} {...rest} />
// ref aquí puede ser una función (RefCallback) en RHF v7
```

`useCombinedRef` maneja ambos casos:

```ts
if (typeof ref === 'function') {
  ref(node)  // RefCallback — invocar
} else {
  (ref as MutableRefObject<T>).current = node  // RefObject — asignar
}
```

Un `useCombinedRef` que solo manejara `RefObject` rompería la integración con React Hook Form silenciosamente — el campo no se registraría correctamente y los valores del formulario estarían incompletos.

### Por qué `useCallback` con `refs` como dependencias

```ts
return useCallback(
  (node: T) => { ... },
  refs  // ← array de refs como dependencias
)
```

El `RefCallback` resultante se estabiliza entre renders si los refs no cambian. Sin `useCallback`, se generaría un nuevo callback en cada render, lo que haría que React desmontara y remontara el `ref` en cada render — potencialmente invocando el callback con `null` y luego con el nodo repetidamente.

Las dependencias son `refs` (el array de refs pasados al combinador). En la práctica, `internalRef` es estable (creado una vez con `useRef`) y `forwardedRef` es estable entre renders si el consumidor usa `useRef` o `createRef`. Si el consumidor pasa una función inline como ref (sin `useCallback`), el combinador se recalcula en cada render del consumidor — comportamiento correcto, ya que el ref externo cambió.

### Por qué se exporta como utilidad pública

`useCombinedRef` resuelve un problema recurrente que aparecerá en cualquier componente que necesite acceso interno al DOM mientras mantiene `forwardRef`. Los componentes futuros de SuriUI que pueden necesitarla:

- **Select** — necesita ref interno para gestionar el positioning del dropdown
- **Input con prefix/suffix icons** — puede necesitar ref interno para calcular padding dinámico
- **DatePicker** (futuro) — necesita ref interno para el positioning del calendario

Exportarla como utilidad permite que los consumidores de SuriUI también la usen en sus propios componentes, siguiendo el mismo patrón. Es un building block de composición, no un detalle de implementación interno.

### El comentario de ESLint disable

```ts
// eslint-disable-next-line react-hooks/exhaustive-deps
refs
```

La regla `react-hooks/exhaustive-deps` espera que las dependencias de `useCallback` sean valores individuales, no un array que se pasa como rest parameter. El linter no puede verificar estáticamente que `refs` es el conjunto correcto de dependencias en este contexto.

El disable es intencional y documentado: `refs` es exactamente la dependencia correcta porque el callback debe regenerarse si y solo si el conjunto de refs cambia.

---

## Consecuencias

### Positivas

- **Dos refs, un elemento**: el nodo DOM recibe exactamente un `ref` (el combinado) y ambos destinos quedan conectados
- **Compatible con RefObject y RefCallback**: funciona con `useRef`, `createRef`, y los refs de React Hook Form
- **Seguro con `forwardedRef` nulo**: el consumidor sin `ref` no produce errores
- **Reutilizable**: disponible como utilidad pública para consumidores de SuriUI

### Negativas y mitigaciones

| Consecuencia | Mitigación |
|--------------|------------|
| `MutableRefObject` cast — TypeScript no puede verificar que el `RefObject` recibido es mutable | `useRef` siempre devuelve `MutableRefObject`; `createRef` también; los refs de RHF son callbacks — el cast es seguro en la práctica |
| El ESLint disable puede generar ruido en code reviews | El comentario incluye `react-hooks/exhaustive-deps` específico — no un disable global — y el razonamiento está documentado aquí |
| Si el consumidor pasa una función inline como ref (sin `useCallback`), el combinador se regenera en cada render | Comportamiento correcto; es responsabilidad del consumidor estabilizar su ref si le preocupa el rendimiento |

---

## Patrón alternativo considerado: `useImperativeHandle`

```tsx
// Alternativa con useImperativeHandle
const internalRef = useRef<HTMLTextAreaElement>(null)

useImperativeHandle(forwardedRef, () => internalRef.current!, [])

<textarea ref={internalRef} />
```

`useImperativeHandle` permite que el componente controle qué API expone a través del ref. El problema es que devuelve el resultado de la función factory, no el nodo DOM directamente.

Con `useImperativeHandle`, `forwardedRef.current` apunta al objeto devuelto por la factory, no al `HTMLTextAreaElement`. Si la factory devuelve `internalRef.current!`, el consumidor recibe el nodo — pero con un tipo `HTMLTextAreaElement | null`, no garantizado como no-nulo.

Más importante: `useImperativeHandle` está pensado para **reducir la API expuesta** (exponer solo ciertos métodos), no para **expandirla** (exponer el nodo completo a dos destinos). Para el caso de Textarea, donde el consumidor necesita el `HTMLTextAreaElement` completo (compatibilidad con RHF, Floating UI, etc.), `useCombinedRef` es semánticamente más correcto.

---

## Alternativas consideradas y descartadas

| Alternativa | Razón de descarte |
|-------------|-------------------|
| `ref={internalRef}` solo, ignorar `forwardedRef` | El consumidor pierde acceso al nodo; rompe RHF, focus management, y cualquier uso del ref |
| `ref={forwardedRef}` solo, sin ref interno | `autoResize` no puede leer `scrollHeight`; el efecto falla silenciosamente |
| `useImperativeHandle` para exponer el nodo | Semánticamente incorrecto para exponer el nodo DOM completo; no garantiza acceso completo al `HTMLTextAreaElement` |
| Acceder al nodo via `document.getElementById` en el efecto | Frágil; rompe en SSR; depende de la presencia del ID en el DOM |
| Eliminar `autoResize` para evitar el problema | `autoResize` es una feature de valor real; el problema de los dos refs es solucionable |

---

## Referencias

- [React — `useCallback`](https://react.dev/reference/react/useCallback)
- [React — `useImperativeHandle`](https://react.dev/reference/react/useImperativeHandle)
- [React — Callback refs](https://react.dev/learn/manipulating-the-dom-with-refs#how-to-manage-a-list-of-refs-using-a-ref-callback)
- [Radix UI — useCombinedRef pattern (internal)](https://github.com/radix-ui/primitives/blob/main/packages/react/compose-refs/src/composeRefs.tsx)
- [React Hook Form — ref handling](https://react-hook-form.com/docs/useform/register#options)
- [TypeScript — `MutableRefObject` vs `RefObject`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/index.d.ts)