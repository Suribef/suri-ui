# ADR-009 · `useId()` vs UUID manual para asociación label-input

| Campo       | Valor                          |
|-------------|--------------------------------|
| **Estado**  | Aceptado                       |
| **Fecha**   | 2025-06                        |
| **Autores** | Sergio Uribe Frenkel           |
| **Proyecto**| SuriUI — `@suribef/suri-ui`    |
| **Componentes afectados** | `Input`, `Textarea`, `Select`, y cualquier componente de formulario |

---

## Contexto

La accesibilidad de un campo de formulario depende de que el `<label>` y el `<input>` estén correctamente asociados. La forma semánticamente correcta de hacerlo en HTML es mediante el atributo `htmlFor` del label y el atributo `id` del input, que deben tener el mismo valor:

```html
<label for="email-field">Email</label>
<input id="email-field" type="email" />
```

Cuando el lector de pantalla enfoca el input, anuncia el texto del label asociado. Sin esta asociación, el usuario de lector de pantalla escucha "campo de texto, editable" sin saber para qué sirve el campo.

El problema: si el consumidor no pasa un `id` explícito, `Input` debe **generar uno internamente**. La generación de IDs tiene restricciones no triviales en entornos con SSR.

---

## El problema del UUID en SSR

La solución naive es generar un identificador único por instancia:

```tsx
// Opción naive — UUID manual
import { useState } from 'react'

const Input = ({ id, ...props }) => {
  const [generatedId] = useState(() => `input-${Math.random().toString(36).slice(2)}`)
  const inputId = id ?? generatedId
  // ...
}
```

O con una variable de módulo:

```tsx
// Opción naive — contador global
let counter = 0
const Input = ({ id, ...props }) => {
  const [generatedId] = useState(() => `input-${++counter}`)
  const inputId = id ?? generatedId
  // ...
}
```

**Ambas opciones producen el mismo bug en SSR:**

En un entorno con Server-Side Rendering (Next.js, Remix, Astro), el componente se renderiza dos veces:

1. **En el servidor** → genera `input-3` (el servidor ha procesado 2 componentes antes en esta request)
2. **En el cliente durante hydration** → genera `input-1` (el cliente empieza desde 0, este es el primer componente hidratado)

Los valores difieren. React detecta la discrepancia entre el HTML del servidor y el del cliente y lanza:

```
Warning: Prop `id` did not match. Server: "input-3" Client: "input-1"
```

En producción esto no lanza error, pero el estado del DOM queda inconsistente: el label tiene `for="input-3"` pero el input tiene `id="input-1". La asociación label-input **está rota** en el cliente después de la hydration, silenciosamente.

Este es un bug de accesibilidad que no aparece en desarrollo local (sin SSR) y solo se manifiesta en producción cuando se activa SSR.

---

## Decisión

**Usar `useId()` de React 18 para generar IDs estables entre servidor y cliente.**

```tsx
import { forwardRef, useId } from 'react'

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const descriptionId = `${inputId}-description`

    return (
      <div>
        {label && <label htmlFor={inputId}>{label}</label>}
        <input id={inputId} ref={ref} {...props} />
      </div>
    )
  }
)
```

---

## Cómo funciona `useId()`

`useId()` es un hook de React 18 que genera un ID único **determinista** — el mismo valor en el servidor y en el cliente para la misma posición del componente en el árbol de React.

El algoritmo de React no usa `Math.random()` ni un contador global compartido entre servidor y cliente. En cambio, calcula el ID basándose en la **posición del componente en el árbol de renderizado**, que es idéntica en servidor y cliente para el mismo árbol.

```tsx
// En servidor y cliente, para el mismo árbol:
const id = useId() // → ":r0:", ":r1:", ":r2:", etc.
// El formato es interno a React y puede cambiar entre versiones,
// pero la garantía de estabilidad SSR/cliente es parte de la API pública.
```

La propiedad de estabilidad hace que `useId()` sea seguro para `htmlFor`, `aria-describedby`, `aria-labelledby`, y cualquier atributo que requiera correspondencia entre elementos.

### Derivación de IDs relacionados

Un solo `useId()` puede servir como base para múltiples IDs relacionados dentro del componente:

```tsx
const baseId = useId()
const inputId = id ?? baseId
const descriptionId = `${inputId}-description`  // para aria-describedby
const labelId = `${inputId}-label`              // para aria-labelledby si se necesita
```

Solo se hace una llamada a `useId()` por componente. Derivar IDs relacionados concatenando sufijos es el patrón recomendado — llamar a `useId()` múltiples veces por componente funciona pero es innecesario.

---

## Comportamiento con `id` explícito del consumidor

Cuando el consumidor pasa un `id`, el ID generado se descarta:

```tsx
// Consumidor pasa id explícito — useId() no se usa
<Input id="email-field" label="Email" />
// → <label for="email-field">Email</label>
// → <input id="email-field" />

// Consumidor no pasa id — useId() genera el ID
<Input label="Email" />
// → <label for=":r0:">Email</label>
// → <input id=":r0:" />
```

El ID generado es interno y no está pensado para ser seleccionado desde CSS o desde JavaScript del consumidor. Si el consumidor necesita referenciar el input desde código externo, debe pasar un `id` explícito.

---

## Consecuencias

### Positivas

- **SSR safe**: mismo ID en servidor y cliente — hydration mismatch imposible
- **Cero configuración para el consumidor**: `<Input label="Email" />` funciona correctamente sin pasar `id`
- **Compatibilidad con formularios complejos**: el consumidor puede pasar `id` explícito cuando necesita referenciar el campo desde código externo
- **IDs derivados estables**: `${inputId}-description` es igualmente estable para `aria-describedby`
- **Depende solo de React 18** — que ya es el peer dep mínimo declarado

### Negativas y mitigaciones

| Consecuencia | Mitigación |
|--------------|------------|
| El formato del ID generado (`:r0:`) no es legible para debugging | El consumidor puede pasar `id` explícito cuando necesite IDs legibles; el formato interno no es parte de la API pública |
| `useId()` requiere React 18 | Ya es el mínimo del peer dep declarado en `package.json`; no agrega restricción nueva |
| Los IDs generados contienen `:` que son caracteres válidos en `id` HTML pero requieren escape en selectores CSS (`#\:r0\:`) | Los IDs generados no deben usarse en selectores CSS; si el consumidor necesita seleccionar el input desde CSS, debe pasar un `id` explícito |

---

## Alternativas consideradas y descartadas

| Alternativa | Razón de descarte |
|-------------|-------------------|
| UUID con `crypto.randomUUID()` | No determinista entre servidor y cliente → hydration mismatch en SSR |
| Contador global (`let counter = 0`) | El contador del servidor y el del cliente son independientes → mismo bug |
| `useState(() => Math.random())` | El estado inicial se calcula en el servidor y se recalcula en el cliente → misma discrepancia |
| Requerir `id` como prop obligatoria | DX deficiente; la asociación label-input debería funcionar sin configuración adicional |
| No usar `id` y envolver label+input directamente | `<label><input /></label>` funciona sin `id`, pero rompe la posibilidad de separar label e input en el DOM, limita layouts y es incompatible con `aria-describedby` que sí requiere `id` |

---

## Referencias

- [React 18 — `useId` hook](https://react.dev/reference/react/useId)
- [React RFC — useId](https://github.com/reactjs/rfcs/pull/32)
- [HTML spec — `label` element and `for` attribute](https://html.spec.whatwg.org/multipage/forms.html#attr-label-for)
- [WAI-ARIA — `aria-describedby`](https://www.w3.org/TR/wai-aria-1.2/#aria-describedby)
- [Next.js — Hydration mismatches](https://nextjs.org/docs/messages/react-hydration-error)