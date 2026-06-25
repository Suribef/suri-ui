# ADR-005 · Design Tokens importados una sola vez en `src/index.ts`

| Campo       | Valor                          |
|-------------|--------------------------------|
| **Estado**  | Aceptado                       |
| **Fecha**   | 2025-06                        |
| **Autores** | Sergio Uribe Frenkel           |
| **Proyecto**| SuriUI — `@suribef/suri-ui`    |

---

## Contexto

SuriUI utiliza **CSS Custom Properties** (variables CSS) como sistema de design tokens:

```css
/* src/tokens/index.css */
:root {
  --sui-color-primary: #6366f1;
  --sui-font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --sui-space-4: 1rem;
  --sui-radius-md: 8px;
  /* ... */
}
```

Estos tokens son referenciados desde los archivos `.module.css` de cada componente:

```css
/* Button.module.css */
.button {
  background-color: var(--sui-color-primary);
  font-family: var(--sui-font-sans);
  padding: 0 var(--sui-space-4);
  border-radius: var(--sui-radius-md);
}
```

La pregunta de arquitectura era: **¿dónde se importa `tokens/index.css`?**

Las opciones son:
1. Importarlo en **cada** `.module.css` que lo necesita
2. Importarlo **una sola vez** en el entrypoint de la librería (`src/index.ts`)
3. No importarlo y requerir que el consumidor lo importe manualmente

---

## Decisión

**Importar `src/tokens/index.css` una única vez en `src/index.ts`:**

```ts
// src/index.ts
import './tokens/index.css'   // ← una sola vez, al inicio del entrypoint

export { Button } from './components/Button'
export type { ButtonProps } from './components/Button'
```

**Los `.module.css` individuales NO importan los tokens:**

```css
/* Button.module.css — CORRECTO */
.button {
  background-color: var(--sui-color-primary); /* referencia, sin @import */
}

/* Button.module.css — INCORRECTO (no hacer esto) */
@import '../../tokens/index.css'; /* ← NO */
.button {
  background-color: var(--sui-color-primary);
}
```

---

## Razonamiento

### El problema de importaciones múltiples en CSS

CSS no tiene deduplicación nativa de `@import` de la misma forma que los sistemas de módulos de JavaScript. Cuando Vite procesa el bundle de la librería, si `tokens/index.css` es importado en 10 archivos `.module.css`, puede terminar siendo **inyectado 10 veces** en el CSS del bundle del consumidor.

**Resultado en el DOM del consumidor:**
```html
<style>
  /* Inyección 1 — desde Button.module.css */
  :root { --sui-color-primary: #6366f1; --sui-font-sans: ...; }

  /* Inyección 2 — desde Badge.module.css */
  :root { --sui-color-primary: #6366f1; --sui-font-sans: ...; }

  /* Inyección N — desde cada componente */
  :root { --sui-color-primary: #6366f1; --sui-font-sans: ...; }
</style>
```

Aunque CSS Custom Properties son idempotentes (misma declaración aplicada múltiples veces no produce errores), el CSS duplicado tiene consecuencias reales:

**1. Tamaño del bundle innecesario**
El archivo de tokens tiene ~40 líneas. Con 10 componentes, eso son 400 líneas de CSS duplicado enviado al navegador en cada carga.

**2. Latencia de parsing**
El motor CSS del navegador debe parsear y aplicar las declaraciones de `:root` N veces, aunque el resultado sea el mismo.

**3. Impredecibilidad con tree-shaking de CSS**
Vite y otros bundlers pueden comportarse de formas impredecibles cuando el mismo archivo CSS es importado desde múltiples módulos JS. El resultado depende de la versión del bundler y de flags de configuración.

**4. Complejidad de override**
Si el consumidor quiere overridear un token:
```css
/* app.css del consumidor */
:root { --sui-color-primary: #my-brand-color; }
```

Con múltiples inyecciones, la especificidad y el orden de las declaraciones puede ser difícil de predecir.

### Por qué el entrypoint es el lugar correcto

`src/index.ts` es el **módulo raíz de la librería** — el archivo desde el que todo lo demás se exporta. Es el único módulo garantizado de ser importado cuando alguien hace:

```ts
import { Button, Badge, Input } from '@suribef/suri-ui'
```

Importar los tokens aquí garantiza:

- **Exactamente una inyección** en el bundle del consumidor, independientemente de cuántos componentes importe
- **Carga garantizada**: los tokens siempre están disponibles cuando cualquier componente se usa
- **Convención explícita**: el entrypoint actúa como el "bootstrap" de la librería, y los tokens son la primera cosa que se inicializa, análogo al `app.css` en una aplicación

Este es el mismo patrón usado por librerías como `react-toastify` (que importa `ReactToastify.css` en su `index.ts`), y por Angular Material (que centraliza el tema en el módulo principal).

### Relación con la configuración de Vite

```ts
// vite.config.ts
build: {
  lib: {
    entry: resolve(__dirname, 'src/index.ts'), // ← Vite empieza desde aquí
  },
  rollupOptions: {
    external: ['react', 'react-dom']
  }
}
```

Vite usa `src/index.ts` como el entry point del bundle. Todo CSS importado desde este módulo (directamente o transitivamente) es incluido en el CSS del bundle final. Al importar `tokens/index.css` directamente en `index.ts`, el CSS de tokens aparece **una vez** al inicio del bundle, antes que cualquier `.module.css` de componentes.

### Por qué no opción 3 (consumidor importa manualmente)

Requerir que el consumidor importe los tokens manualmente es una **API pública implícita no documentada**:

```ts
// Lo que el consumidor tendría que hacer (opción descartada)
import '@suribef/suri-ui/dist/tokens/index.css' // ← no intuitivo
import { Button } from '@suribef/suri-ui'
```

Si el consumidor olvida esta importación, los componentes renderizan sin estilos — sin error en compilación, solo un bug visual en runtime. Este es el tipo de DX (Developer Experience) que una librería de componentes debe eliminar.

La regla es: **el consumidor no debe hacer nada especial para que los componentes funcionen correctamente**. El único import que debe hacer es el de los componentes mismos.

---

## Theming y override por el consumidor

Aunque los tokens se importan y se aplican automáticamente, el consumidor puede **overridear cualquier token** en su propio CSS, ya que CSS Custom Properties respetan la cascada:

```css
/* app.css del consumidor — después de importar SuriUI */
:root {
  --sui-color-primary: #3b82f6;         /* brand azul en lugar del violeta */
  --sui-color-primary-hover: #2563eb;
  --sui-radius-md: 4px;                  /* border-radius más conservador */
}
```

O con theming contextual:

```css
/* Dark mode */
.dark {
  --sui-color-primary: #818cf8;
  --sui-color-secondary: #27272a;
  --sui-color-secondary-foreground: #fafafa;
}
```

Esto es posible precisamente porque los tokens son CSS Custom Properties en `:root` — son variables de CSS estándar del W3C, no valores compilados en tiempo de build. El consumidor tiene control total sobre el theming sin necesidad de acceder al código fuente de SuriUI.

---

## Estructura de archivos

```
src/
├── tokens/
│   └── index.css        ← definición de variables en :root
├── components/
│   └── Button/
│       ├── Button.tsx
│       ├── Button.module.css   ← usa var(--sui-*), sin @import de tokens
│       └── index.ts
└── index.ts             ← import './tokens/index.css' UNA VEZ aquí
```

---

## Consecuencias

### Positivas

- **Bundle CSS mínimo**: tokens incluidos exactamente una vez, sin duplicación
- **DX transparente**: el consumidor no necesita importar nada adicional
- **Theming via cascade**: el consumidor puede overridear tokens en cualquier nivel del DOM
- **Código de componentes limpio**: los `.module.css` solo contienen sus propias clases; la gestión de tokens es responsabilidad del entrypoint
- **Predecible**: el orden de inyección CSS es determinista — tokens primero, estilos de componentes después

### Negativas y mitigaciones

| Consecuencia | Mitigación |
|--------------|------------|
| Si alguien importa un componente directamente desde su path (no desde el entrypoint), los tokens no se cargan | Documentado en README: siempre importar desde `@suribef/suri-ui`, no desde rutas internas |
| Los componentes individuales no son verdaderamente "standalone" sin el entrypoint | Aceptable para una librería cohesiva; componentes aislados están pensados para ser usados dentro del ecosistema SuriUI |
| La convención puede no ser obvia para contribuidores nuevos | El comentario en `src/index.ts` y este ADR documentan el patrón explícitamente |

---

## Alternativas consideradas y descartadas

| Alternativa | Razón de descarte |
|-------------|-------------------|
| Importar tokens en cada `.module.css` | Duplicación en el bundle; comportamiento impredecible con bundlers |
| Requerir importación manual por el consumidor | DX deficiente; falla silenciosa en runtime si se olvida |
| Inline tokens como valores hardcoded en `.module.css` | Elimina la posibilidad de theming; mantenimiento costoso (actualizar un color requiere modificar N archivos) |
| CSS-in-JS para tokens (ThemeProvider) | Introduce runtime, incompatibilidad con RSC, y aumenta bundle size |
| Variables SCSS compiladas | Requiere SCSS como dependencia de desarrollo; los valores se compilan y ya no son overrideables por el consumidor |

---

## Referencias

- [CSS Custom Properties — W3C Specification](https://www.w3.org/TR/css-variables-1/)
- [Vite — CSS handling en Library Mode](https://vitejs.dev/guide/build.html#library-mode)
- [CSS Cascade — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Cascade)
- [Design Tokens Community Group — W3C](https://www.w3.org/community/design-tokens/)
- [Open Props — ejemplo de librería de tokens via CSS Custom Properties](https://open-props.style/)