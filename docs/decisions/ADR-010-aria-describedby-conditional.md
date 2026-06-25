# ADR-010 · `aria-describedby` condicional vs siempre presente

| Campo       | Valor                          |
|-------------|--------------------------------|
| **Estado**  | Aceptado                       |
| **Fecha**   | 2026-06                        |
| **Autores** | Sergio Uribe Frenkel           |
| **Proyecto**| SuriUI — `@suribef/suri-ui`    |
| **Componentes afectados** | `Input`, `Textarea`, `Select` |

---

## Contexto

`aria-describedby` asocia un elemento con uno o más elementos que lo describen. En el contexto de un campo de formulario, apunta al texto de ayuda o al mensaje de error:

```html
<input aria-describedby="email-description" />
<span id="email-description">Usaremos tu email para notificaciones.</span>
```

Cuando el lector de pantalla enfoca el input, anuncia primero el label y luego el texto del elemento referenciado por `aria-describedby`.

El componente `Input` puede renderizarse en tres estados respecto al texto descriptivo:

1. **Sin helper ni error** — no hay texto descriptivo
2. **Con helperText** — hay texto descriptivo estático
3. **Con error** — hay texto descriptivo dinámico (reemplaza helperText)

La pregunta es si `aria-describedby` debe estar presente en el DOM **siempre** (aunque el elemento referenciado esté vacío o no exista) o **solo cuando hay contenido** que describir.

---

## El comportamiento de `aria-describedby` con referencia inexistente

La [WAI-ARIA spec (§6.2.4)](https://www.w3.org/TR/wai-aria-1.2/#aria-describedby) define el comportamiento cuando el ID referenciado no existe en el DOM:

> *"If the referenced element does not exist, the ARIA attribute has no effect."*

La spec dice "sin efecto". La realidad de los lectores de pantalla difiere:

| Lector de pantalla | `aria-describedby` apuntando a ID inexistente |
|-------------------|----------------------------------------------|
| NVDA 2023+ | Ignora el atributo — comportamiento correcto |
| JAWS 2022+ | Ignora el atributo — comportamiento correcto |
| VoiceOver (macOS Ventura+) | Pausa brevemente antes de continuar — artefacto audible |
| VoiceOver (iOS 16) | En algunos casos anuncia "vacío" o hace una pausa notable |
| TalkBack (Android) | Comportamiento variable según versión del navegador |

El comportamiento no es "sin efecto" universalmente — introduce artefactos audibles en VoiceOver que degradan la experiencia sin aportar información.

---

## El patrón problemático: elemento siempre en DOM, `aria-describedby` siempre presente

Un patrón común en implementaciones de formularios:

```tsx
// Patrón problemático
<input aria-describedby={`${id}-description`} />
<span id={`${id}-description`}>
  {error ?? helperText ?? ''}  {/* vacío cuando no hay mensaje */}
</span>
```

El elemento `<span>` siempre existe con un ID fijo. Cuando no hay mensaje, el span está vacío pero el input sigue apuntando a él.

**Problemas:**

1. **Pausa audible en VoiceOver**: el lector anuncia el label, intenta leer la descripción, encuentra un elemento vacío, y produce una pausa o silencio antes de continuar. El usuario experimenta una hesitación inexplicable en cada campo sin descripción.

2. **Anuncio de "vacío"**: en algunas versiones de VoiceOver iOS, un `aria-describedby` apuntando a un span vacío produce el anuncio literal "vacío" — el usuario escucha "Email, campo de texto, vacío" sin entender a qué se refiere ese "vacío".

3. **Complejidad innecesaria en el árbol de accesibilidad**: el accessibility tree incluye una relación de descripción que no aporta información. Las herramientas de auditoría de accesibilidad pueden reportar esto como advertencia.

---

## Decisión

**Emitir `aria-describedby` únicamente cuando existe contenido que describir. Usar `undefined` para eliminarlo del DOM cuando no hay descripción.**

```tsx
const description = error ?? helperText
const hasDescription = !!description

return (
  <>
    <input
      // aria-describedby solo existe cuando hay contenido
      aria-describedby={hasDescription ? descriptionId : undefined}
    />

    {/* El span de descripción solo existe cuando hay contenido */}
    {hasDescription && (
      <span id={descriptionId}>
        {description}
      </span>
    )}
  </>
)
```

Cuando `aria-describedby` es `undefined`, React no emite el atributo en el HTML. El lector de pantalla no ve ninguna referencia, no intenta resolver ningún ID, y no produce artefactos audibles.

---

## La transición entre estados

El componente pasa de "sin descripción" a "con descripción" cuando aparece un error de validación. Este es el caso más común: el usuario envía el formulario, la validación detecta un error, y el mensaje de error aparece dinámicamente.

```
Estado inicial:           → <input />  (sin aria-describedby)
Usuario envía formulario  → <input aria-describedby="id-description" />
                             <span id="id-description" aria-live="polite">
                               Email inválido
                             </span>
```

La aparición del span con `aria-live="polite"` hace que el lector de pantalla anuncie el mensaje de error cuando aparece, sin que el usuario tenga que navegar hasta él. La asociación `aria-describedby` complementa esto: cuando el usuario vuelve a enfocar el input, el lector de pantalla relee el error.

Este patrón — `aria-live` para el anuncio inicial + `aria-describedby` para la relecture posterior — es el recomendado por la [WCAG 2.1 Technique ARIA19](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA19).

---

## Variante: descripción siempre en DOM, referencia condicional

Una alternativa intermedia es mantener el span siempre en el DOM pero solo añadir `aria-describedby` cuando tiene contenido:

```tsx
// Alternativa — span siempre en DOM, referencia condicional
<input aria-describedby={hasDescription ? descriptionId : undefined} />
<span id={descriptionId}>
  {description}  {/* vacío cuando no hay descripción */}
</span>
```

Esta variante tiene la ventaja de evitar el re-montaje del span cuando cambia entre estados (mejor rendimiento de animaciones CSS si se anima la entrada del mensaje). La desventaja es que un span vacío con un ID en el DOM es un elemento sin propósito semántico que puede confundir herramientas de auditoría.

Para SuriUI se eligió la variante de renderizado condicional completo porque es más predecible y el impacto de rendimiento del re-montaje es despreciable para un elemento de texto.

---

## Consecuencias

### Positivas

- **Cero artefactos audibles** en VoiceOver y otros lectores cuando el campo no tiene descripción
- **Árbol de accesibilidad limpio**: solo existen relaciones semánticas con contenido real
- **Comportamiento predecible**: el atributo está presente si y solo si el elemento referenciado existe
- **Conformidad con la intención de la spec**: la spec dice "sin efecto" cuando la referencia no existe, pero la implementación correcta es no crear referencias huecas

### Negativas y mitigaciones

| Consecuencia | Mitigación |
|--------------|------------|
| El span se monta/desmonta al aparecer/desaparecer el error | El re-montaje es un cambio de DOM mínimo; no afecta el rendimiento perceptible |
| Animaciones CSS de entrada del mensaje de error requieren el elemento pre-montado | Si se necesita animar la entrada, usar `opacity` + `height` con el elemento siempre en DOM pero `aria-describedby` condicional — variante documentada arriba |
| Tests que buscan `aria-describedby` deben verificar su ausencia explícitamente | Los tests de SuriUI verifican tanto la presencia (con descripción) como la ausencia (sin descripción), documentando el contrato |

---

## Tests que especifican este comportamiento

```tsx
it('links input to helper text via aria-describedby', () => {
  render(<Input label="Email" helperText="Texto de ayuda" />)
  const input = screen.getByRole('textbox')
  const descId = input.getAttribute('aria-describedby')
  expect(descId).toBeTruthy()
  expect(document.getElementById(descId!)).toHaveTextContent('Texto de ayuda')
})

it('does not set aria-describedby when no helper or error', () => {
  render(<Input label="Email" />)
  expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby')
})
```

El segundo test es tan importante como el primero — especifica que la ausencia del atributo es comportamiento intencional, no un olvido.

---

## Alternativas consideradas y descartadas

| Alternativa | Razón de descarte |
|-------------|-------------------|
| `aria-describedby` siempre presente, span siempre en DOM | Pausa audible en VoiceOver; anuncio "vacío" en iOS |
| `aria-describedby` siempre presente, sin span cuando está vacío | Referencia a ID inexistente — comportamiento indefinido en spec, artefactos en VoiceOver |
| `aria-describedby=""` (string vacío) cuando no hay descripción | Referencia a ID vacío — comportamiento aún más indefinido que referencia a ID inexistente |

---

## Referencias

- [WAI-ARIA 1.2 — `aria-describedby`](https://www.w3.org/TR/wai-aria-1.2/#aria-describedby)
- [WCAG 2.1 Technique ARIA19 — Using aria-live for error messages](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA19)
- [Scott O'Hara — Describing with aria-describedby](https://scottaohara.github.io/a11y_styled_form_controls/)
- [WebAIM — Creating Accessible Forms](https://webaim.org/techniques/forms/controls)
- [Deque — aria-describedby best practices](https://dequeuniversity.com/rules/axe/4.7/aria-describedby)