# ADR-018 · `<select>` nativo vs custom listbox con Floating UI

| Campo       | Valor                          |
|-------------|--------------------------------|
| **Estado**  | Aceptado                       |
| **Fecha**   | 2025-06                        |
| **Autores** | Sergio Uribe                   |
| **Proyecto**| SuriUI — `@suribef/suri-ui`   |
| **Componentes afectados** | `Select` |

---

## Contexto

Un componente Select puede implementarse de dos formas fundamentalmente distintas:

1. **Select nativo** — el elemento `<select>` de HTML, con las `<option>` como hijos
2. **Custom listbox** — un componente completamente custom: un `<div>` con `role="combobox"`, un dropdown con `role="listbox"`, y opciones con `role="option"`, gestionando manualmente el posicionamiento, el teclado, y el foco

Ambas opciones son válidas en diferentes contextos. La elección determina el alcance del componente, el esfuerzo de implementación, y la calidad de la experiencia en dispositivos móviles.

---

## Decisión

**Implementar `Select` con `<select>` nativo en v1.0. Custom listbox documentado para v2.0.**

---

## Razonamiento

### Lo que requiere un custom listbox accesible

Un custom listbox que cumple con WAI-ARIA Authoring Practices requiere implementar:

**Estructura ARIA completa:**
```html
<div role="combobox" aria-expanded="false" aria-haspopup="listbox"
     aria-controls="listbox-id" aria-labelledby="label-id">
  Opción seleccionada
</div>
<ul role="listbox" id="listbox-id" aria-labelledby="label-id">
  <li role="option" aria-selected="true">México</li>
  <li role="option" aria-selected="false">España</li>
</ul>
```

**Keyboard navigation completa (WAI-ARIA spec):**
- `↑` / `↓` — navegar entre opciones
- `Enter` / `Space` — seleccionar opción enfocada
- `Home` / `End` — ir a primera/última opción
- `Escape` — cerrar sin seleccionar
- Búsqueda por caracteres (type-ahead): presionar `m` selecciona la primera opción que empieza con "m"
- `Tab` — cierra el listbox y mueve el foco al siguiente elemento

**Focus management:**
- Foco en el trigger al abrir
- Foco en la opción seleccionada al abrir (o primera opción si ninguna está seleccionada)
- Trampa de foco dentro del listbox cuando está abierto
- Retorno del foco al trigger al cerrar

**Posicionamiento del dropdown:**
- Calcular si abrir hacia arriba o hacia abajo según el espacio disponible en la viewport
- Actualizar posición en scroll y resize
- Renderizar en un portal para evitar el problema de `overflow: hidden` del ancestro

**Integración con formularios:**
- `name` y `value` deben funcionar con el submit nativo del formulario
- Compatibilidad con validación nativa (`required`, `setCustomValidity`)

Implementar todo esto correctamente, con tests que cubran keyboard navigation en múltiples lectores de pantalla, es trabajo de semanas. Las librerías de referencia (Radix UI Select, Headless UI Listbox, Downshift) tienen cientos de líneas de código y años de bugs reportados y corregidos.

### El select nativo tiene accesibilidad garantizada por el browser

El elemento `<select>` nativo tiene soporte de accesibilidad construido en cada browser:

- **Keyboard navigation**: implementada por el browser, sin código adicional
- **Screen reader integration**: anunciado correctamente en NVDA, JAWS, VoiceOver y TalkBack en todas las plataformas
- **Form integration**: funciona con `name`, `required`, validación nativa, y el submit del formulario
- **Mobile**: activa el picker nativo del sistema operativo

El picker nativo en iOS y Android es especialmente valioso — es la experiencia que los usuarios de móvil esperan para seleccionar una opción de una lista.

```
iOS — <select> nativo:     Android — <select> nativo:
┌─────────────────────┐    ┌─────────────────────┐
│ México          ✓   │    │ ○ México             │
│ España              │    │ ● España             │
│ Alemania            │    │ ○ Alemania            │
│ [ Cancelar ] [  OK ]│    │ [ CANCELAR ] [ OK ]  │
└─────────────────────┘    └─────────────────────┘
```

Un custom dropdown reemplaza esta experiencia nativa con un dropdown genérico que puede no seguir las convenciones del sistema operativo del usuario.

### El costo de la limitación de estilado

La crítica principal al select nativo es que su apariencia no puede ser controlada completamente:

- Las `<option>` dentro del dropdown no son estilizables con CSS en la mayoría de browsers
- El dropdown abierto no puede tener estilos custom (border-radius, sombras, colores personalizados)

Esta limitación es real. La solución de SuriUI es:

1. `appearance: none` para eliminar el estilo nativo del trigger
2. Chevron custom como SVG data URI en background-image
3. Todos los estilos del trigger (borde, fondo, tipografía, focus ring) son completamente controlados

El resultado es un trigger que es visualmente idéntico al `Input` y el `Textarea`, con los mismos tokens y estados. Solo el dropdown en sí (cuando está abierto) mantiene el estilo del browser.

Para el 90% de casos de uso en aplicaciones de negocio, esto es suficiente. Para casos que requieren opciones con iconos, colores custom, o layouts complejos dentro del dropdown, el custom listbox de v2.0 es la solución correcta.

### Criterio de la deuda técnica gestionada

La decisión no es "el select nativo es siempre mejor". Es "el select nativo es correcto para v1.0 dado el alcance y el tiempo disponible, y el custom listbox es el camino correcto para v2.0".

Las condiciones que deben cumplirse para implementar el custom listbox en v2.0:
1. React 19 como peer dep mínimo (simplifica el polymorphism y el forwardRef)
2. Floating UI como dependencia opcional (o incluida) para el posicionamiento
3. Tests de accesibilidad con NVDA y VoiceOver ejecutados antes del merge

---

## Consecuencias

### Positivas

- **Accesibilidad garantizada**: keyboard navigation, screen reader support, y mobile picker son responsabilidad del browser
- **Cero dependencias adicionales**: no requiere Floating UI, Popper, ni ninguna librería de posicionamiento
- **Implementación comprobable**: los tests de RTL son deterministas y no requieren simular interacciones de teclado complejas
- **Mobile experience superior**: picker nativo en iOS y Android

### Negativas y mitigaciones

| Consecuencia | Mitigación |
|--------------|------------|
| Las `<option>` no son estilizables (colores, iconos, layouts custom) | Documentado como limitación de v1.0; custom listbox planeado para v2.0 |
| El dropdown abierto mantiene el estilo del browser | El trigger es completamente controlado; el dropdown nativo es consistente con la plataforma del usuario |
| No se puede controlar la posición del dropdown (puede abrir hacia arriba o abajo) | El browser gestiona esto correctamente según el espacio disponible — mejor que la mayoría de implementaciones custom |

---

## Roadmap v2.0: custom listbox con Floating UI

La implementación planificada de v2.0 usará el patrón `asChild` de Radix UI (o similar) con Floating UI para el posicionamiento:

```tsx
// API planeada para v2.0 — no implementada en v1.0
<Select.Root value={value} onValueChange={setValue}>
  <Select.Trigger>
    <Select.Value placeholder="Selecciona..." />
  </Select.Trigger>
  <Select.Content>
    <Select.Item value="mx">México</Select.Item>
    <Select.Item value="es">España</Select.Item>
  </Select.Content>
</Select.Root>
```

Esta API es composable, permite contenido custom dentro de las opciones, y mantiene accesibilidad completa. La API de v1.0 (`options` como array prop) puede coexistir como wrapper de conveniencia sobre la API composable.

---

## Alternativas consideradas y descartadas

| Alternativa | Razón de descarte |
|-------------|-------------------|
| Custom listbox con Floating UI en v1.0 | Semanas de implementación + testing de a11y; fuera del scope de v1.0 |
| Headless UI Listbox como dependencia | Agrega dependencia de runtime; el select nativo cubre los casos de uso comunes |
| Radix UI Select como wrapper | Dependencia de runtime de terceros contradice el objetivo de zero-runtime-deps de SuriUI |
| Select nativo sin `appearance: none` | Estilo del browser no es consistente con el design system; el trigger no coincide con Input y Textarea |

---

## Referencias

- [WAI-ARIA Authoring Practices — Listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)
- [WAI-ARIA Authoring Practices — Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [HTML spec — `select` element](https://html.spec.whatwg.org/multipage/form-elements.html#the-select-element)
- [Floating UI — positioning engine](https://floating-ui.com/)
- [Radix UI Select — custom listbox implementation](https://www.radix-ui.com/primitives/docs/components/select)
- [Adrian Roselli — Under-Engineered Custom Selects](https://adrianroselli.com/2019/07/under-engineered-custom-radio-buttons-and-checkboxen.html)