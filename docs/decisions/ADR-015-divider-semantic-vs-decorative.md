# ADR-015 · Divider semántico (`<hr>`) vs decorativo (`<div aria-hidden>`) y orientación vertical

| Campo       | Valor                          |
|-------------|--------------------------------|
| **Estado**  | Aceptado                       |
| **Fecha**   | 2025-06                        |
| **Autores** | Sergio Uribe                   |
| **Proyecto**| SuriUI — `@suribef/suri-ui`   |
| **Componentes afectados** | `Divider` |

---

## Contexto

Un separador visual en una interfaz puede tener dos naturalezas completamente distintas desde el punto de vista de accesibilidad:

1. **Semántico** — el separador comunica una división temática entre bloques de contenido. Un lector de pantalla debe anunciarlo para que el usuario sepa que el contenido ha cambiado de tema.

2. **Decorativo** — el separador es puramente visual: un elemento estético que no porta información. Un lector de pantalla debe ignorarlo para no interrumpir innecesariamente al usuario.

Tratar ambos casos con el mismo elemento HTML produce accesibilidad incorrecta en uno de los dos. La decisión de `Divider` es exponer esta distinción como API explícita en lugar de intentar detectar automáticamente el contexto.

Adicionalmente, los separadores pueden ser horizontales o verticales. La orientación introduce complejidades semánticas adicionales en HTML.

---

## Decisión

**Tres modos de renderizado controlados por `decorative` y `orientation`:**

| Caso | Elemento | Atributos ARIA |
|------|----------|----------------|
| Semántico horizontal (default) | `<hr>` | ninguno adicional — semántica implícita |
| Semántico vertical | `<hr>` | `role="separator"` + `aria-orientation="vertical"` |
| Decorativo | `<div>` | `aria-hidden="true"` |

```tsx
export function Divider({ decorative = false, orientation = 'horizontal', label, ...props }) {
  const isVertical = orientation === 'vertical'

  if (decorative) {
    return <div aria-hidden="true" data-decorative="true" {...props} />
  }

  return (
    <hr
      role={isVertical ? 'separator' : undefined}
      aria-orientation={isVertical ? 'vertical' : undefined}
      aria-label={label}
      {...props}
    />
  )
}
```

---

## Razonamiento

### `<hr>` como elemento semántico correcto

El elemento `<hr>` en HTML5 tiene semántica específica: representa una **pausa temática** (thematic break) entre bloques de contenido a nivel de párrafo. No es un separador puramente visual — es una declaración de que el tema o la sección ha cambiado.

Los navegadores modernos asignan a `<hr>` el `role="separator"` implícitamente. Los lectores de pantalla anuncian:
- NVDA: *"separador"*
- VoiceOver: *"separador horizontal"*
- JAWS: silencio en modo lectura, anuncio en modo navegación por elementos

Usar `<hr>` como base del Divider semántico es correcto por la misma razón que usar `<button>` para botones: el elemento nativo porta semántica correcta sin configuración adicional de ARIA.

### Por qué `<div>` para el modo decorativo, no `<hr role="none">`

La forma alternativa de hacer un `<hr>` decorativo es:

```html
<!-- Alternativa descartada -->
<hr role="none" />
```

`role="none"` elimina la semántica del elemento, convirtiéndolo efectivamente en un `<div>` sin rol. El problema es que algunos lectores de pantalla (versiones antiguas de JAWS) ignoran `role="none"` en `<hr>` y siguen anunciando el separador.

La forma más robusta y universalmente soportada de hacer un elemento invisible para tecnologías asistivas es `aria-hidden="true"`. Un `<div aria-hidden="true">` garantiza que el elemento no aparece en el accessibility tree en ningún lector de pantalla conocido.

El uso de `<div>` en lugar de `<hr>` para el modo decorativo tiene además una ventaja semántica: el HTML comunica la intención. Un desarrollador que lee el DOM en producción ve:

```html
<!-- Divisor semántico -->
<hr class="...">

<!-- Divisor decorativo -->
<div aria-hidden="true" class="...">
```

La diferencia es legible sin contexto adicional.

### El problema semántico de `<hr>` vertical

`<hr>` es implícitamente horizontal por spec de HTML. No existe un mecanismo nativo en HTML para un separador semántico vertical.

Para separadores verticales semánticos (toolbars, navbars, grupos de controles), la spec WAI-ARIA define `role="separator"` con `aria-orientation="vertical"`. El elemento base puede ser `<hr>` (que ya tiene `role="separator"` implícito) pero debe explicitar la orientación:

```html
<!-- Separador vertical semántico — orientación explícita -->
<hr role="separator" aria-orientation="vertical" />
```

`role="separator"` se declara explícitamente aquí aunque `<hr>` ya lo implica, porque **cambiar `aria-orientation` de un `<hr>` sin declarar `role` explícitamente** puede producir comportamiento inconsistente: algunos lectores leen la orientación del atributo CSS `writing-mode`, otros ignoran `aria-orientation` en `<hr>` sin `role` explícito.

La redundancia explícita (`role="separator"` + `aria-orientation="vertical"`) sigue el mismo principio que el `role="status"` + `aria-live="polite"` del Spinner (ADR-008): declarar explícitamente cuando la implicación no es universalmente respetada.

### Por qué la prop es `decorative` (booleana) y no `semantic` o `type`

**Opción descartada A:**
```tsx
<Divider type="decorative" />
<Divider type="semantic" />
```

Un string enum requiere que el consumidor conozca la distinción entre ambos valores antes de elegir. La prop es esencialmente booleana (es decorativo o no lo es), y un string enum para un valor binario añade vocabulario sin precisión.

**Opción descartada B:**
```tsx
<Divider semantic />  // activo = semántico
```

`semantic` como booleano activo implica que el default es "no semántico" (decorativo). Pero el default correcto para un separador en la mayoría de contextos es semántico — un separador entre secciones de contenido debe ser anunciado por defecto.

**Opción adoptada:**
```tsx
<Divider />              // semántico por defecto
<Divider decorative />   // decorativo explícitamente
```

`decorative={false}` (default) es el estado semántico. El consumidor opt-in explícitamente al modo decorativo cuando sabe que el separador es puramente visual. Este orden de defaults refleja el principio de "por defecto accesible, opt-out explícito para excepciones".

### `label` como API para separadores con significado contextual

En formularios de autenticación existe el patrón de separador con texto:

```
[ Email ] [ Contraseña ]
[ Iniciar sesión ]
─────────── O continúa con ───────────
[ G  Continuar con Google ]
```

El separador "O continúa con" tiene significado semántico que un `<hr>` sin contexto no comunica. `aria-label` permite al lector de pantalla anunciar ese contexto:

```tsx
<Divider label="O continúa con" />
// → <hr aria-label="O continúa con" />
// → VoiceOver: "O continúa con, separador"
```

Sin `aria-label`, el separador sería anunciado solo como "separador" sin el contexto de que separa la opción de email/contraseña de las opciones OAuth.

---

## Consecuencias

### Positivas

- **Default accesible**: sin configuración, `<Divider />` es semántico y anunciado correctamente
- **Modo decorativo robusto**: `aria-hidden="true"` es universalmente soportado, más confiable que `role="none"`
- **Orientación vertical correcta**: `role="separator"` + `aria-orientation="vertical"` cubre inconsistencias entre lectores
- **API autodocumentada**: `decorative` como booleano opt-in hace explícita la intención del consumidor en el JSX

### Negativas y mitigaciones

| Consecuencia | Mitigación |
|--------------|------------|
| Dos elementos HTML distintos (`<hr>` vs `<div>`) dificultan el targeting CSS consistente | `data-orientation` y `data-decorative` están en ambos elementos para targeting desde el consumidor; las clases CSS de `Divider.module.css` aplican a `.divider` que es la clase común |
| El consumidor debe conocer la distinción semántico/decorativo para usar la prop correctamente | Documentado en Storybook con ejemplos de cuándo usar cada modo; el default semántico es correcto para la mayoría de casos |

---

## Tabla de uso recomendado

| Contexto | Prop | Elemento resultante |
|----------|------|---------------------|
| Entre secciones de contenido de una página | `<Divider />` | `<hr>` |
| Entre items de un menú de navegación | `<Divider decorative />` | `<div aria-hidden>` |
| Dentro de un Card entre header y body | `<Divider decorative />` | `<div aria-hidden>` |
| En una toolbar entre grupos de botones | `<Divider orientation="vertical" />` | `<hr role="separator" aria-orientation="vertical">` |
| En un formulario de auth ("O continúa con") | `<Divider label="O continúa con" />` | `<hr aria-label="O continúa con">` |

---

## Alternativas consideradas y descartadas

| Alternativa | Razón de descarte |
|-------------|-------------------|
| Siempre `<hr>` (sin modo decorativo) | Separadores decorativos en componentes UI producen verbalizaciones innecesarias en lectores |
| Siempre `<div>` (sin semántica) | Pierde los casos de uso donde el separador comunica estructura de contenido |
| `<hr role="none">` para modo decorativo | `role="none"` en `<hr>` no es universalmente respetado por todos los lectores de pantalla |
| Detectar automáticamente si el separador es decorativo | Imposible sin contexto semántico del consumidor; falsos positivos y negativos garantizados |
| Prop `type="semantic" \| "decorative"` | String enum para valor binario; default ambiguo; `decorative` booleano es más claro |

---

## Referencias

- [HTML spec — `<hr>` element (thematic break)](https://html.spec.whatwg.org/multipage/grouping-content.html#the-hr-element)
- [WAI-ARIA 1.2 — `separator` role](https://www.w3.org/TR/wai-aria-1.2/#separator)
- [WAI-ARIA 1.2 — `aria-orientation`](https://www.w3.org/TR/wai-aria-1.2/#aria-orientation)
- [WAI-ARIA 1.2 — `aria-hidden`](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden)
- [MDN — The `<hr>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/hr)
- [Radix UI — Separator primitive](https://www.radix-ui.com/primitives/docs/components/separator)
- [Inclusive Components — Menus and menu buttons](https://inclusive-components.design/menus-menu-buttons/)