# ADR-006 · `process.env.NODE_ENV` vs `import.meta.env.DEV` para dev warnings en librerías distribuidas

| Campo       | Valor                          |
|-------------|--------------------------------|
| **Estado**  | Aceptado                       |
| **Fecha**   | 2025-06                        |
| **Autores** | Sergio Uribe Frenkel           |
| **Proyecto**| SuriUI — `@suribef/suri-ui`    |
| **Componentes afectados** | Badge (dot mode), y cualquier componente que emita warnings de desarrollo |

---

## Contexto

El componente `Badge` en modo `dot` sin `aria-label` es inaccesible. La respuesta correcta de una librería de UI es emitir un warning en desarrollo que guíe al consumidor:

```tsx
if (/* condición de desarrollo */) {
  if (dot && !props['aria-label']) {
    console.warn('[SuriUI Badge] El modo dot requiere aria-label...')
  }
}
```

La pregunta no trivial es **qué expresión usar como "condición de desarrollo"**. Las dos opciones naturales en el ecosistema Vite son:

```ts
// Opción A — idiomático en apps Vite
if (import.meta.env.DEV) { ... }

// Opción B — idiomático en librerías (React, Radix, Floating UI)
if (process.env.NODE_ENV !== 'production') { ... }
```

Ambas parecen equivalentes. No lo son cuando el contexto es una **librería distribuida en npm**.

---

## El error de diagnóstico frecuente

El análisis superficial concluye:

> *"Vite usa `import.meta.env`, no `process.env`. Usar `process.env.NODE_ENV` es una práctica de Webpack que puede fallar."*

Esta afirmación es **correcta para una aplicación Vite** y **produce un bug distinto en una librería Vite**.

La distinción crucial está en **quién ejecuta el build** y **en qué momento se resuelven las expresiones**:

| Contexto | `process.env.NODE_ENV` | `import.meta.env.DEV` |
|----------|----------------------|----------------------|
| **App Vite** (consumidor) | Vite lo reemplaza por `"development"` o `"production"` | Vite lo reemplaza por `true` o `false` |
| **Librería Vite** (durante `vite build`) | **NO reemplazado** — queda literal en el bundle | **SÍ reemplazado** — se evalúa con el contexto del build de la librería |

La librería no es la app. La librería se compila una vez y se distribuye. El bundle resultante lo ejecuta el build del consumidor.

---

## Análisis de las dos opciones

### Opción A: `import.meta.env.DEV`

Vite, al hacer `vite build` en **modo librería**, reemplaza `import.meta.env.DEV` con `false` (porque el build de la librería corre en modo producción por defecto).

```tsx
// Código fuente de Badge.tsx
if (import.meta.env.DEV) {
  console.warn('[SuriUI Badge] ...')
}

// Lo que Vite escribe en dist/suri-ui.js
if (false) {
  console.warn('[SuriUI Badge] ...')
}
// → Tree-shaken por Rollup → el warning desaparece completamente del bundle
```

**Resultado**: el warning nunca llega a ningún consumidor, en ningún entorno. Un desarrollador que instala SuriUI y usa `<Badge dot />` sin `aria-label` **no recibe ninguna advertencia**, ni en desarrollo, ni en producción. El bug de accesibilidad pasa desapercibido en silencio.

Este es el bug nuevo: el warning que debía avisar al consumidor en su entorno de desarrollo nunca existe en el bundle distribuido.

### Opción B: `process.env.NODE_ENV`

Vite, en library mode, **no reemplaza** `process.env.NODE_ENV` por defecto. El string queda literal en el bundle:

```tsx
// Código fuente de Badge.tsx
if (process.env.NODE_ENV !== 'production') {
  console.warn('[SuriUI Badge] ...')
}

// Lo que Vite escribe en dist/suri-ui.js (sin plugin replace)
if (process.env.NODE_ENV !== 'production') {
  console.warn('[SuriUI Badge] ...')
}
```

El bundle distribuido contiene la expresión sin resolver. Cuando el **bundler del consumidor** (Webpack, Vite de la app, esbuild) procesa `node_modules/@suribef/suri-ui`, encuentra `process.env.NODE_ENV` y lo resuelve en **su propio contexto**:

- En el build de desarrollo del consumidor → `"development" !== "production"` → `true` → warning visible ✓
- En el build de producción del consumidor → `"production" !== "production"` → `false` → tree-shaken ✓

**Resultado**: el warning se comporta exactamente como se espera — visible para los desarrolladores que usan la librería, eliminado en producción.

El riesgo de la Opción B sin configuración adicional: en entornos que no polyfillean `process` (algunos configuraciones de browser sin bundler, CDN), `process` es `undefined` y la expresión lanza `ReferenceError`.

---

## Decisión

**Usar `process.env.NODE_ENV !== 'production'` con `@rollup/plugin-replace` configurado para preservar la expresión en el bundle de distribución.**

### Configuración de `@rollup/plugin-replace`

```bash
npm install -D @rollup/plugin-replace
```

```ts
// vite.config.ts
import replace from '@rollup/plugin-replace'

rollupOptions: {
  external: ['react', 'react-dom'],
  plugins: [
    replace({
      preventAssignment: true,
      values: {
        // La clave es que el valor es la misma expresión como string.
        // Esto NO sustituye el valor — garantiza que la expresión
        // permanezca tal cual en el bundle para que el bundler del
        // consumidor la resuelva en su contexto.
        'process.env.NODE_ENV': 'process.env.NODE_ENV'
      }
    })
  ],
  output: {
    globals: { react: 'React', 'react-dom': 'ReactDOM' }
  }
}
```

Este uso de `plugin-replace` puede parecer un no-op, pero tiene un efecto concreto: previene que **otros plugins de Rollup o transformaciones de Vite** modifiquen o eliminen la referencia a `process.env.NODE_ENV` durante el build de la librería. Actúa como un pin que preserva la expresión intacta.

### Uso en componentes

```tsx
// Badge.tsx — y cualquier componente futuro con dev warnings
if (process.env.NODE_ENV !== 'production') {
  if (dot && !props['aria-label']) {
    console.warn(
      '[SuriUI Badge] El modo dot requiere aria-label para accesibilidad. ' +
      'Ejemplo: <Badge dot aria-label="3 notificaciones" />'
    )
  }
}
```

El comentario en el código es parte del estándar:

```tsx
// Correcto para librería distribuida:
// process.env.NODE_ENV lo resuelve el bundler del CONSUMIDOR, no el nuestro.
// @rollup/plugin-replace lo preserva en el bundle de distribución.
// Ver ADR-006.
```

---

## Por qué React, Radix UI y Floating UI usan este patrón

Las librerías de referencia del ecosistema React usan invariablemente `process.env.NODE_ENV`:

**React core (`packages/react/src/`):**
```js
if (__DEV__) { /* ... */ }
// __DEV__ se define como: process.env.NODE_ENV !== 'production'
```

**Radix UI (`@radix-ui/react-primitive`):**
```ts
if (process.env.NODE_ENV !== 'production') {
  /* warnings de uso incorrecto */
}
```

**Floating UI (`@floating-ui/react`):**
```ts
if (process.env.NODE_ENV !== 'production') {
  /* warnings de configuración */
}
```

Estas librerías no usan `process.env.NODE_ENV` por tradición de Webpack — lo usan porque **es la única forma de deferir la resolución al contexto del consumidor**. `import.meta` es ESM y Vite-specific; `process.env` es el contrato de facto entre librerías npm y bundlers, soportado por Webpack, Vite (para apps), esbuild, Parcel y Rollup.

---

## La distinción conceptual central

Esta decisión ilustra una distinción de arquitectura que aplica más allá de este caso específico:

```
BUILD DE LA LIBRERÍA          BUILD DEL CONSUMIDOR
─────────────────────         ───────────────────────────────
vite build (librería)    →    dist/suri-ui.js + suri-ui.cjs
                         →    npm publish
                         →    npm install @suribef/suri-ui
                         →    vite build / webpack / esbuild (app del consumidor)
                                  ↑
                             aquí se resuelve process.env.NODE_ENV
```

Una librería distribuida atraviesa **dos builds**: el propio y el del consumidor. Las decisiones sobre qué resolver en el propio build vs qué delegar al build del consumidor son fundamentales para el comportamiento correcto del paquete.

`import.meta.env.DEV` se resuelve en el build de la librería → incorrecto para dev warnings.
`process.env.NODE_ENV` se resuelve en el build del consumidor → correcto para dev warnings.

Esta misma lógica aplica a decisiones futuras como:
- Código de solo-servidor vs solo-cliente
- Feature flags basados en entorno
- Cualquier comportamiento que deba diferir entre desarrollo y producción **del consumidor**

---

## Consecuencias

### Positivas

- **Dev warnings funcionales**: los consumidores reciben advertencias en su entorno de desarrollo y el código es eliminado en sus builds de producción
- **Comportamiento idéntico a React y Radix UI**: facilita la comprensión para contribuidores familiarizados con el ecosistema
- **Tree-shaking correcto en producción**: el bundler del consumidor elimina los bloques de warning en producción
- **Cero overhead en producción**: el bundle de producción del consumidor no contiene el código de warnings

### Negativas y mitigaciones

| Consecuencia | Mitigación |
|--------------|------------|
| Dependencia adicional de desarrollo (`@rollup/plugin-replace`) | Solo afecta al build de la librería; no se suma al bundle del consumidor |
| `process` puede ser `undefined` en algunos entornos de browser sin bundler | El uso de SuriUI a través de bundler (Vite, Webpack, etc.) está documentado como requerimiento; CDN usage sin bundler no es un caso de uso soportado |
| La configuración de `plugin-replace` como "no-op" puede parecer confusa | Documentado aquí y con comentario en `vite.config.ts` |

---

## Alternativas consideradas y descartadas

| Alternativa | Razón de descarte |
|-------------|-------------------|
| `import.meta.env.DEV` | Resuelto a `false` durante el build de la librería; los warnings nunca llegan al consumidor |
| `typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'` | Guard defensivo innecesario; agrega verbosidad sin beneficio real en el contexto de uso declarado (proyectos con bundler) |
| `__DEV__` global (como React) | Requiere configuración adicional de Rollup para definir la variable global; `process.env.NODE_ENV` es igualmente efectivo y sin configuración de variable global |
| Eliminar dev warnings completamente | Los warnings de accesibilidad son valor real para el consumidor; el costo de implementación es mínimo |
| Emitir warnings siempre (sin guard de entorno) | Los warnings en producción llenan la consola del usuario final de la app del consumidor; inaceptable |

---

## Referencias

- [Rollup — `@rollup/plugin-replace`](https://github.com/rollup/plugins/tree/master/packages/replace)
- [Vite Library Mode — variables de entorno](https://vitejs.dev/guide/build.html#library-mode)
- [React source — `__DEV__` pattern](https://github.com/facebook/react/blob/main/packages/shared/ReactSharedInternals.js)
- [Radix UI source — dev warnings](https://github.com/radix-ui/primitives)
- [Node.js — `process.env.NODE_ENV` convention](https://nodejs.org/en/docs/guides/nodejs-docker-webapp)
- [esbuild — `process.env.NODE_ENV` substitution](https://esbuild.github.io/api/#define)