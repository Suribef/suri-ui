# ADR-001 · CSS Modules sobre Tailwind CSS

| Campo       | Valor                          |
|-------------|--------------------------------|
| **Estado**  | Aceptado                       |
| **Fecha**   | 2025-06                        |
| **Autores** | Sergio Uribe Frenkel           |
| **Proyecto**| SuriUI — `@suribef/suri-ui`    |

---

## Contexto

SuriUI es una librería de componentes React publicada en npm. Sus consumidores instalarán el paquete dentro de aplicaciones que pueden usar **cualquier sistema de estilos**: Tailwind CSS, CSS-in-JS (Emotion, styled-components), vanilla CSS, o ninguno.

Durante el diseño inicial se evaluaron tres enfoques para el sistema de estilos:

1. **Tailwind CSS** — clases utilitarias inline en JSX
2. **CSS Modules** — archivos `.module.css` con scope local automático
3. **CSS-in-JS** (Emotion / styled-components) — estilos en JavaScript

La decisión afecta a tres partes interesadas con requerimientos distintos:

- **Consumidores**   → quieren cero colisiones de clase y cero dependencias forzadas
- **Contribuidores** → quieren un DX predecible y fácil de razonar
- **El bundle**      → debe ser minimal; sin runtime overhead

---

## Decisión

**Se adopta CSS Modules** como sistema de estilos para todos los componentes de SuriUI.

Cada componente tendrá su archivo `ComponentName.module.css` co-ubicado. Los tokens globales (colores, tipografía, espaciado) se definen como **CSS Custom Properties** en `src/tokens/index.css` e importados una sola vez desde `src/index.ts`.

---

## Razonamiento

### Por qué no Tailwind

Tailwind en una librería de componentes crea un acoplamiento estructural con el consumidor:

**1. Purge / content scanning conflict**
Tailwind elimina clases no usadas en producción mediante análisis estático de archivos. Si SuriUI distribuye clases de Tailwind en su `dist/`, el consumidor debe configurar su `content` para incluir `node_modules/@suribef/suri-ui/**`, o las clases serán purgadas y los componentes aparecerán sin estilos.

```js
// tailwind.config.js del consumidor — configuración forzada
content: [
  './src/**/*.{ts,tsx}',
  './node_modules/@suribef/suri-ui/dist/**/*.js' // ← dependencia implícita
]
```

Esto convierte una dependencia de runtime en una **dependencia de configuración de build**, que es invisible para el consumidor hasta que falla en producción.

**2. Versión de Tailwind como dependencia implícita**
Si SuriUI usa Tailwind v3 internamente y el consumidor usa v4 (con breaking changes en la API de configuración), se producen conflictos difíciles de diagnosticar. La librería estaría dictando la versión de Tailwind del proyecto host.

**3. Colisiones en proyectos sin Tailwind**
En proyectos que no usan Tailwind, las clases utilitarias (`flex`, `items-center`, `text-sm`) pueden colisionar con clases propias del consumidor o con frameworks CSS como Bootstrap.

**4. Acoplamiento semántico vs visual**
Tailwind entrelaza la responsabilidad visual con el markup:
```tsx
// La intención de diseño está dispersa en el JSX
<button className="inline-flex items-center px-4 py-2 text-sm font-medium 
                   bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg 
                   disabled:opacity-50 transition-colors">
```
En una librería publicada esto expone detalles de implementación que deberían ser opacos.

---

### Por qué no CSS-in-JS

Las soluciones de CSS-in-JS (Emotion, styled-components) tienen costos específicos en el contexto de una librería:

| Problema | Impacto |
|----------|---------|
| Runtime overhead (~15-40 KB) | Se suma al bundle del consumidor aunque no quiera |
| Doble rendering en SSR (SSR stream + hydration) | Problemas en Next.js App Router con Server Components |
| Dependencia que escalar con React version | Emotion y styled-components tienen compatibilidad limitada con React 19 Concurrent Mode |
| Conflictos de instancia | Dos versiones de Emotion en el mismo árbol generan bugs silenciosos |

---

### Por qué sí CSS Modules

**Scope automático sin overhead de runtime**
Vite transforma `.module.css` en clases hasheadas en tiempo de build:
```css
/* Fuente */           /* Output */
.button { ... }   →   .button_a3f2c { ... }
```
El hash es determinista y elimina colisiones globales sin ningún código JavaScript de runtime.

**Cero acoplamiento con el consumidor**
Los estilos se distribuyen como CSS estático en el bundle. El consumidor no necesita configurar nada, no necesita instalar Tailwind, y no hay runtime que pueda conflictuar.

**Compatibilidad universal con SSR y Server Components**
CSS Modules produce hojas de estilo estáticas. No existen problemas de hydration mismatch, no hay problemas con React Server Components, y funciona sin cambios en Next.js 13+, Remix, Astro y Vite.

**Colocación de estilos con componentes**
```
src/components/Button/
├── Button.tsx
├── Button.module.css    ← co-ubicado
├── Button.test.tsx
└── index.ts
```
La colocación hace el componente self-contained: un contribuidor puede entender, modificar y probar el componente sin navegar a un directorio de estilos separado.

**Design tokens como CSS Custom Properties**
Los tokens se definen en `:root` y son consumidos por todos los `.module.css` sin importarlos individualmente:
```css
.button {
  background-color: var(--sui-color-primary); /* referencia, no copia */
  transition: background-color var(--sui-transition-fast);
}
```
El consumidor puede **override tokens** en su propio CSS:
```css
:root {
  --sui-color-primary: #your-brand-color; /* theming sin tocar la librería */
}
```
Este patrón de theming es imposible con clases de Tailwind hasheadas o con CSS-in-JS sin exponer una API de tema explícita.

---

## Consecuencias

### Positivas

- **Cero colisiones** en cualquier proyecto consumidor, sin configuración adicional
- **Bundle mínimo**: solo CSS estático, sin runtime JavaScript de estilos
- **Theming via CSS Custom Properties**: el consumidor puede personalizar tokens sin forkar la librería
- **SSR/RSC compatible** sin consideraciones especiales
- **DX familiar**: CSS Modules está soportado nativamente por Vite, Next.js, Remix y Create React App

### Negativas y mitigaciones

| Consecuencia negativa | Mitigación |
|-----------------------|------------|
| CSS Modules no soporta variants dinámicos tan fluidamente como Tailwind | La utilidad `cn()` compone clases de módulos condicionalmente sin dependencias externas |
| Autocompletado de clases requiere plugin de editor (`css-modules` extension en VS Code) | Documentado en CONTRIBUTING.md como setup recomendado |
| Más verbose que utility-first para layouts inline simples | Los componentes de SuriUI no hacen layout ad-hoc: cada clase tiene semántica específica |

---

## Alternativas consideradas y descartadas

| Alternativa | Razón de descarte |
|-------------|-------------------|
| Tailwind CSS | Impone dependencia de configuración en consumidores; conflictos de versión |
| Emotion | Runtime overhead + incompatibilidades con RSC |
| styled-components | Mismo problema que Emotion + bundle size |
| Vanilla CSS global | Colisiones de nombres garantizadas en proyectos grandes |
| CSS-in-JS zero-runtime (Linaria, Vanilla Extract) | Complejidad de setup, ecosistema más pequeño, riesgo de abandono |

---

## Referencias

- [CSS Modules specification](https://github.com/css-modules/css-modules)
- [Vite CSS Modules docs](https://vitejs.dev/guide/features#css-modules)
- [Why Tailwind in a component library is problematic — Theo (t3.gg)](https://youtu.be/RSaS5X-2PL4)
- [WAI-ARIA and theming with CSS Custom Properties — Google Web Dev](https://web.dev/building-a-color-scheme/)