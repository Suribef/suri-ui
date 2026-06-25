# ADR-008 · `aria-live` configurable con `"polite"` como default en Spinner

| Campo       | Valor                          |
|-------------|--------------------------------|
| **Estado**  | Aceptado                       |
| **Fecha**   | 2026-06                        |
| **Autores** | Sergio Uribe Frenkel           |
| **Proyecto**| SuriUI — `@suribef/suri-ui`    |
| **Componentes afectados** | `Spinner`        |

---

## Contexto

El componente `Spinner` usa `role="status"` para comunicar a lectores de pantalla que hay una operación en progreso. `role="status"` es una **live region** — una zona del DOM cuyo contenido es anunciado automáticamente por el lector de pantalla cuando cambia, sin que el usuario necesite navegar hasta él.

Las live regions tienen un atributo crítico que controla el comportamiento de interrupción: `aria-live`. Su valor determina **cuándo** el lector de pantalla anuncia el cambio en relación con lo que el usuario está haciendo en ese momento.

La mayoría de librerías de componentes hardcodean un valor. La pregunta es si SuriUI debe hacer lo mismo o exponer el valor como prop.

---

## Los dos valores posibles

### `aria-live="polite"` — no interrumpe

El lector de pantalla **espera** a que el usuario termine su actividad actual antes de anunciar el cambio. Si el usuario está leyendo un párrafo o llenando un campo, el anuncio se encola y se emite cuando hay una pausa natural.

**Contextos correctos:**
- Carga de datos en background mientras el usuario navega
- Resultados de búsqueda actualizándose mientras el usuario escribe
- Paginación o infinite scroll
- Actualización de un feed o lista en tiempo real
- Cualquier operación donde el usuario puede continuar interactuando mientras espera

**Experiencia de usuario:**
```
Usuario tecleando en un buscador...
[spinner aparece]
Usuario termina de teclear y hace pausa...
Lector: "Cargando resultados..."
```

### `aria-live="assertive"` — interrumpe inmediatamente

El lector de pantalla **interrumpe** lo que está leyendo o anunciando para emitir el nuevo contenido de inmediato.

**Contextos correctos:**
- Confirmación de una operación financiera irreversible (pago procesándose)
- Eliminación permanente de datos (borrando cuenta, eliminando archivo)
- Errores de validación críticos
- Timeouts de sesión inminentes
- Cualquier operación donde el usuario necesita saber ahora mismo que algo está ocurriendo

**Experiencia de usuario:**
```
Usuario leyendo descripción de producto...
[usuario hace clic en "Confirmar pago de $2,499"]
[spinner aparece con aria-live="assertive"]
Lector: [interrumpe inmediatamente] "Procesando pago..."
```

Usar `assertive` cuando no es necesario es **disruptivo y molesto** — interrumpe al usuario en cada carga de página, cada búsqueda, cada navegación. Es el equivalente auditivo de un alert() en JavaScript.

Usar `polite` cuando debería ser `assertive` es **inseguro** — el usuario de lector de pantalla podría no enterarse de que una operación crítica está en progreso hasta que ya terminó.

---

## Decisión

**Exponer `aria-live` como prop con `"polite"` como valor por defecto.**

```tsx
export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  'aria-live'?: 'polite' | 'assertive'
}

export function Spinner({
  'aria-live': ariaLive = 'polite',
  label = 'Cargando...',
  ...props
}: SpinnerProps) {
  return (
    <span role="status" aria-live={ariaLive} {...props}>
      {/* ... */}
    </span>
  )
}
```

**Uso en el consumidor:**

```tsx
// Caso estándar (background loading) — polite por defecto
<Spinner />

// Operación crítica — el consumidor elige assertive explícitamente
<Spinner
  aria-live="assertive"
  label="Procesando pago, no cerrar la ventana..."
/>
```

---

## Razonamiento

### Por qué no hardcodear `polite`

`polite` es correcto para la mayoría de casos de uso, pero hay casos de uso legítimos donde `assertive` es la elección correcta desde el punto de vista de accesibilidad. Si SuriUI hardcodea `polite`, el consumidor que implementa un flujo de pago o eliminación irreversible no tiene forma de comunicar la urgencia al usuario de lector de pantalla.

Las dos opciones para el consumidor en ese escenario serían:
1. **No usar `<Spinner />`** y reimplementar uno propio con `assertive` → el componente no sirve para casos de uso reales
2. **Usar `<Spinner />`** y agregar `aria-live="polite"` hardcodeado en el wrapper → workaround frágil que puede ser anulado por el componente

La accesibilidad real no es un checkbox — es diseñar para la diversidad de contextos de uso. Una librería que no puede comunicar urgencia a lectores de pantalla no es accesible, solo parece accesible.

### Por qué `polite` como default y no `assertive`

El principio es **no interrumpir salvo que sea necesario**. La mayoría de usos de un spinner son de background loading donde interrumpir al usuario sería disruptivo.

Además, el costo de olvidar cambiar el default es asimétrico:
- Olvidar cambiar de `polite` a `assertive` en un flujo crítico → el usuario de SR no es informado de inmediato (subóptimo, pero no rompe la experiencia)
- Hardcodear `assertive` como default → todos los spinners en toda la app del consumidor interrumpen al usuario constantemente (experiencia rota)

El default conservador (`polite`) falla de forma suave. El default agresivo (`assertive`) falla de forma ruidosa.

### Por qué usar `'aria-live'` como nombre de prop en lugar de `urgency` o `priority`

**Opción descartada:**
```tsx
// Props con naming semántico propio
<Spinner urgency="high" />
<Spinner priority="critical" />
```

Estos nombres requieren que el consumidor aprenda una abstracción extra. El consumidor que conoce WAI-ARIA ya sabe qué hace `aria-live`. El consumidor que no conoce WAI-ARIA puede buscar `aria-live` y encontrar documentación oficial, no documentación de SuriUI.

**Opción adoptada:**
```tsx
<Spinner aria-live="assertive" />
```

El nombre de la prop es el nombre del atributo HTML subyacente. Esto es un principio de API design: una librería de primitivos debe mapear directamente a los estándares web, no inventar vocabulario propio. Es el mismo principio que sigue `@radix-ui` con sus props de accesibilidad.

Además, `HTMLAttributes<HTMLSpanElement>` ya incluye `aria-live` en su tipo, por lo que la prop está tipada correctamente sin trabajo adicional.

### Sobre `role="status"` e `aria-live` redundantes

La spec WAI-ARIA define `role="status"` como un shorthand que implica `aria-live="polite"` y `aria-atomic="true"`. En teoría, declarar ambos es redundante.

En práctica, la redundancia es necesaria por compatibilidad:

| Browser / Screen reader | `role="status"` solo | `role="status"` + `aria-live="polite"` |
|------------------------|---------------------|----------------------------------------|
| Chrome + NVDA | Funciona | Funciona |
| Firefox + NVDA | Inconsistente | Funciona |
| Safari + VoiceOver | Funciona | Funciona |
| Edge + JAWS | Inconsistente en versiones antiguas | Funciona |

La redundancia explícita es el patrón recomendado por la [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/). No declarar `aria-live` y depender de la implicación semántica de `role="status"` funciona en condiciones ideales, no en el ecosistema real de lectores de pantalla.

---

## Consecuencias

### Positivas

- **Cobertura de casos de uso reales**: operaciones críticas pueden comunicar urgencia correctamente a lectores de pantalla
- **API mínima**: el consumidor solo necesita cambiar un valor, no reimplementar el componente
- **Educativa**: la prop expone el concepto de `aria-live` a consumidores que no conocen la spec, con el nombre correcto del atributo
- **Tipado completo**: `'polite' | 'assertive'` en la interfaz previene valores inválidos en TypeScript

### Negativas y mitigaciones

| Consecuencia | Mitigación |
|--------------|------------|
| El consumidor puede usar `assertive` indiscriminadamente y romper la experiencia de accesibilidad | Documentado en Storybook con el caso de uso correcto para cada valor; el comentario en el código fuente explica la distinción |
| Agrega una prop más a la API pública | El nombre es el del atributo HTML estándar; no introduce vocabulario nuevo |

---

## Sobre `aria-atomic`

`role="status"` implica `aria-atomic="true"`, lo que significa que el lector de pantalla anuncia el contenido completo de la live region cuando cambia (no solo la parte que cambió). Para un spinner con texto fijo (`"Cargando..."`), esto es correcto: el anuncio siempre es el texto completo.

Si en el futuro el label del Spinner cambia dinámicamente (ej: `"Descargando... 45%"`), `aria-atomic="true"` puede producir re-anuncios ruidosos. En ese caso, considerar `aria-atomic="false"` y estructurar el contenido en subelementos, o usar un componente de Progress separado.

---

## Alternativas consideradas y descartadas

| Alternativa | Razón de descarte |
|-------------|-------------------|
| Hardcodear `aria-live="polite"` | Imposibilita comunicar urgencia en flujos críticos sin reimplementar el componente |
| Hardcodear `aria-live="assertive"` | Disruptivo para todos los casos de loading estándar; experiencia de SR rota por defecto |
| Prop `urgency="normal"\|"critical"` mapeada internamente | Vocabulario inventado; el consumidor debe aprender la API de SuriUI en lugar de WAI-ARIA |
| Omitir `aria-live` y depender de la implicación de `role="status"` | Compatibilidad inconsistente en Firefox+NVDA y JAWS en versiones antiguas |

---

## Tests relacionados

```tsx
it('uses aria-live="polite" by default', () => {
  render(<Spinner />)
  expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
})

it('accepts aria-live="assertive" for critical operations', () => {
  render(<Spinner aria-live="assertive" />)
  expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'assertive')
})
```

Estos tests verifican que el default es correcto y que el override funciona, sin testear comportamiento de lectores de pantalla reales (que requiere testing manual con NVDA/VoiceOver).

---

## Referencias

- [WAI-ARIA 1.2 — Live Region Roles (`status`)](https://www.w3.org/TR/wai-aria-1.2/#status)
- [WAI-ARIA 1.2 — `aria-live`](https://www.w3.org/TR/wai-aria-1.2/#aria-live)
- [WAI-ARIA Authoring Practices — Alert and Message Dialogs](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)
- [MDN — ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
- [Deque University — aria-live](https://dequeuniversity.com/rules/axe/4.7/aria-live-region-error)
- [NVDA — live region support matrix](https://www.nvaccess.org/files/nvda/documentation/userGuide.html)