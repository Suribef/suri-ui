# Architecture Decision Records — SuriUI

Este directorio contiene los registros de decisiones de arquitectura (ADRs) para `@suribef/suri-ui`.

Un ADR documenta una decisión técnica significativa tomada en el proyecto: el contexto en el que se tomó, la decisión en sí, y sus consecuencias. Son documentos vivos que reflejan el pensamiento de ingeniería detrás del código.

## Índice

| ADR | Título | Estado |
|-----|--------|--------|
| [ADR-001](./ADR-001-css-modules-over-tailwind.md) | CSS Modules sobre Tailwind CSS | Aceptado |
| [ADR-002](./ADR-002-dual-format-esm-cjs.md) | Dual Format ESM + CJS con extensiones `.js` / `.cjs` | Aceptado |
| [ADR-003](./ADR-003-aria-disabled-vs-disabled-loading.md) | `aria-disabled` vs `disabled` nativo en estado `loading` | Aceptado |
| [ADR-004](./ADR-004-forwardref-react-19-compat.md) | `forwardRef` con compatibilidad React 19 | Aceptado |
| [ADR-005](./ADR-005-design-tokens-single-import.md) | Design Tokens importados una sola vez en `src/index.ts` | Aceptado |
| [ADR-006](./ADR-006-process-env-node-env-vs-import-meta-env.md) | `process.env.NODE_ENV` vs `import.meta.env.DEV` para dev warnings en librerías distribuidas | Aceptado |
| [ADR-007](./ADR-007-spinner-standalone-vs-button-dependency.md) | Spinner standalone vs dependencia interna de Button | Aceptado |
| [ADR-008](./ADR-008-aria-live-configurable.md) | `aria-live` configurable con `"polite"` como default en Spinner | Aceptado |
| [ADR-009](./ADR-009-useid-vs-uuid-label-association.md) | `useId()` vs UUID manual para asociación label-input | Aceptado |
| [ADR-010](./ADR-010-aria-describedby-conditional.md) | `aria-describedby` condicional vs siempre presente | Aceptado |
| [ADR-011](./ADR-011-aria-invalid-undefined-vs-false.md) | `aria-invalid` con `undefined` en lugar de `false` | Aceptado |
| [ADR-012](./ADR-012-aria-live-region-mounting-strategy.md) | Estrategia de montaje de `aria-live` regions para anuncios dinámicos | Aceptado |
| [ADR-013](./ADR-013-card-polymorphic-as-prop.md) | Prop `as` con unión acotada vs generics polimórficos completos en Card | Aceptado |
| [ADR-014](./ADR-014-stack-gap-css-custom-property.md) | Gap en Stack via CSS custom property inline vs clases CSS por valor | Aceptado |
| [ADR-015](./ADR-015-divider-semantic-vs-decorative.md) | Divider semántico (`<hr>`) vs decorativo (`<div aria-hidden>`) y orientación vertical | Aceptado |
| [ADR-016](./ADR-016-use-combined-ref.md) | `useCombinedRef` — combinar ref interno con forwardRef externo | Aceptado |
| [ADR-017](./ADR-017-textarea-api-and-autoresize.md) | Decisiones de API y comportamiento específicas de Textarea | Aceptado |
| [ADR-018](./ADR-018-select-native-vs-custom-listbox.md) | `<select>` nativo vs custom listbox con Floating UI | Aceptado |
| [ADR-019](./ADR-019-select-implementation-details.md) | Detalles de implementación del Select nativo: chevron SVG, placeholder y API de opciones | Aceptado |
| [ADR-020](./ADR-020-storybook-configuration-and-story-philosophy.md) | Storybook: configuración, filosofía de stories y estrategia de documentación | Aceptado |

## Formato

Cada ADR sigue la estructura de Michael Nygard con extensiones para el contexto de librería:

- **Contexto** — ¿qué problema o tensión existe?
- **Decisión** — ¿qué se decidió exactamente?
- **Razonamiento** — ¿por qué esta opción y no las alternativas?
- **Consecuencias** — ¿qué se gana y qué se pierde?
- **Alternativas consideradas y descartadas** — para que el razonamiento sea auditable

## Estados posibles

| Estado | Significado |
|--------|-------------|
| Propuesto | En discusión, no implementado |
| Aceptado | Implementado y vigente |
| Deprecado | Vigente pero planificado para reemplazo |
| Supersedido | Reemplazado por otro ADR (incluye referencia) |


## Cómo agregar un ADR

1. Crear el archivo: `ADR-NNN-titulo-descriptivo.md`
2. Usar el formato establecido en los ADRs existentes
3. Agregar la entrada en este índice
4. Referenciar el ADR en el código fuente cuando sea relevante (comentarios, PR description)