# ADR-004 · `forwardRef` con compatibilidad React 19

| Campo       | Valor                          |
|-------------|--------------------------------|
| **Estado**  | Aceptado                       |
| **Fecha**   | 2025-06                        |
| **Autores** | Sergio Uribe Frenkel           |
| **Proyecto**| SuriUI — `@suribef/suri-ui`    |

---

## Contexto

Los componentes de SuriUI son elementos de UI primitivos — building blocks que los consumidores componen para construir interfaces más complejas. En este rol, los componentes frecuentemente necesitan **exponer su nodo DOM subyacente** a los padres o a código de terceros.

Los casos de uso son concretos y comunes en aplicaciones de producción:

**1. Integración con React Hook Form**
```tsx
const { register } = useForm()
// RHF necesita ref al input para registrar el campo y acceder a su valor
<Input {...register('email')} />
```

**2. Focus management programático**
```tsx
const submitRef = useRef<HTMLButtonElement>(null)
// Devolver foco al botón de submit después de cerrar un modal
useEffect(() => {
  if (!isModalOpen) submitRef.current?.focus()
}, [isModalOpen])
<Button ref={submitRef}>Submit</Button>
```

**3. Integración con librerías de animación**
```tsx
// Framer Motion, GSAP, y Anime.js necesitan referencias DOM
const scope = useRef<HTMLDivElement>(null)
useAnimate(scope, { opacity: 1 }, { duration: 0.3 })
<Card ref={scope}>...</Card>
```

**4. Portals y tooltips (Floating UI, Radix UI)**
```tsx
// Floating UI necesita el elemento "trigger" para calcular posición
const { refs } = useFloating()
<Button ref={refs.setReference}>Hover me</Button>
```

Sin `forwardRef`, el ref pasado al componente apunta a la **instancia de función del componente** (que en React moderno es `null` para componentes funcionales), no al nodo DOM. El consumidor obtiene `null` silenciosamente.

---

## El problema de versiones: React 18 vs React 19

La API de `ref` cambió significativamente entre versiones:

### React 18 y anteriores
`ref` **no es una prop normal**. React intercepta la prop `ref` antes de que llegue al componente y la maneja internamente. Si un componente funcional recibe `ref` como prop, es `undefined`.

```tsx
// React 18 — esto NO funciona
function Button({ ref, children }) { // ref es undefined aquí
  return <button ref={ref}>{children}</button>
}
```

Para exponer el ref, se requiere `forwardRef`:
```tsx
// React 18 — esto SÍ funciona
const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <button ref={ref}>{props.children}</button>
})
```

### React 19
`ref` es una **prop normal** — se comporta exactamente como cualquier otra prop. `forwardRef` ya no es necesario y está marcado como **deprecated** (con advertencia en consola en React 19 strict mode).

```tsx
// React 19 — funciona sin forwardRef
function Button({ ref, children }: ButtonProps & { ref?: Ref<HTMLButtonElement> }) {
  return <button ref={ref}>{children}</button>
}
```

El peer dependency de SuriUI es `"react": ">=18"`. Esto significa que la librería **debe funcionar en React 18 Y en React 19**, incluyendo proyectos que ya migraron.

---

## Decisión

**Usar `forwardRef` en todos los componentes que exponen un nodo DOM, con un comentario de compatibilidad que documenta el plan de migración a React 19.**

```tsx
// NOTA DE COMPATIBILIDAD:
// forwardRef es necesario en React 18 para exponer el nodo DOM al consumidor.
// En React 19, ref es una prop nativa y forwardRef puede eliminarse.
// Este componente es compatible con ambas versiones sin cambios en la API pública.
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', ...props }, ref) => {
    return <button ref={ref} {...props} />
  }
)
Button.displayName = 'Button'
```

### Por qué esta decisión y no escribir para React 19 directamente

**El peer dependency es `>=18`**, lo que incluye React 18. Si se usara la API de React 19 (ref como prop), los usuarios de React 18 obtendrían un `ref` `undefined` sin ningún error en compilación, solo un fallo silencioso en runtime.

El principio de Postel aplicado a librerías: *"sé conservador en lo que distribuyes, liberal en lo que aceptas"*. Una librería debe correr en el rango de versiones declarado en `peerDependencies`, sin excusas.

### Por qué `forwardRef` es compatible forward con React 19

React 19 mantiene `forwardRef` como **backwards-compatible** — sigue funcionando, solo emite un warning en modo de desarrollo. Esto significa que:

1. Usuarios de React 18: `forwardRef` es requerido → funciona ✓
2. Usuarios de React 19: `forwardRef` es deprecated → funciona con warning en dev ✓
3. Plan de migración: cuando se eleve el peer dependency mínimo a `>=19`, se elimina `forwardRef` de todos los componentes en un solo PR

### Sobre `displayName`

```tsx
Button.displayName = 'Button'
```

`forwardRef` devuelve un objeto con el componente envuelto. Sin `displayName`, las React DevTools y los stack traces muestran:

```
<ForwardRef />       // sin displayName
<Button />           // con displayName
```

`displayName` es obligatorio para cualquier componente que usa `forwardRef`, HOCs, o `memo`. Es el equivalente de nombrar funciones anónimas — esencial para debugging en producción.

---

## Consecuencias

### Positivas

- **Compatibilidad total con React 18 y 19** sin código condicional ni feature detection
- **API pública estable**: el cambio de `forwardRef` a prop nativa en React 19 es transparente para consumidores — su código `<Button ref={myRef}>` funciona en ambas versiones
- **Integración completa** con React Hook Form, Floating UI, Framer Motion, y cualquier librería que use refs
- **DevTools friendly**: `displayName` garantiza nombres legibles en el árbol de componentes

### Negativas y mitigaciones

| Consecuencia | Mitigación |
|--------------|------------|
| Warning en React 19 dev mode (`forwardRef is deprecated`) | Aceptable: el warning no afecta producción; se elimina cuando el peer dep se eleve a `>=19` |
| Sintaxis más verbose que la prop nativa de React 19 | El comentario de compatibilidad documenta explícitamente que esto es temporal |
| Tipo de la función resultante es `ForwardRefExoticComponent` en lugar de `FC` | No afecta al consumidor; los tipos de `ButtonProps` siguen siendo los mismos |

---

## Plan de migración a React 19

Cuando SuriUI eleve su peer dependency mínimo a `react: ">=19"`:

```diff
// Antes (forwardRef)
- export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
-   ({ variant, ...props }, ref) => {
-     return <button ref={ref} {...props} />
-   }
- )
- Button.displayName = 'Button'

// Después (React 19 native ref)
+ export function Button({ ref, variant, ...props }: ButtonProps & { ref?: Ref<HTMLButtonElement> }) {
+   return <button ref={ref} {...props} />
+ }
```

Este cambio es **no-breaking para consumidores**: el uso de `<Button ref={myRef}>` no cambia. Solo cambia la implementación interna.

El PR de migración deberá:
1. Actualizar `peerDependencies` a `"react": ">=19"`
2. Eliminar `forwardRef` de todos los componentes
3. Eliminar `displayName` (ya no necesario, la función tiene nombre)
4. Bump de versión minor (`0.2.0`), no major, ya que la API pública es idéntica

---

## Alternativas consideradas y descartadas

| Alternativa | Razón de descarte |
|-------------|-------------------|
| API de ref nativa de React 19 (sin forwardRef) | Falla silenciosamente en React 18 — peer dep declarado incluye `>=18` |
| Feature detection en runtime (`React.version`) | Complejidad innecesaria; crea código difícil de auditar y testear |
| Elevar peer dep mínimo a `>=19` ahora | El ecosistema aún tiene mayoría de proyectos en React 18 (dato: npm downloads, enero 2025) |
| No soportar `ref` en los componentes | Rompe integración con RHF, Floating UI, y otros — inaceptable para una librería primitiva |

---

## Referencias

- [React 19 — ref as a prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)
- [React 19 — forwardRef deprecation](https://react.dev/reference/react/forwardRef#usage)
- [MDN — Principle of least surprise](https://developer.mozilla.org/en-US/docs/Glossary/Principle_of_least_surprise)
- [React Hook Form — Register with ref](https://react-hook-form.com/docs/useform/register)
- [Floating UI — Reference element](https://floating-ui.com/docs/react#elements)