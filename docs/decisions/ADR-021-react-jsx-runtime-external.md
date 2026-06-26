# ADR-021 · `react/jsx-runtime` como external explícito en Vite library mode

| Campo       | Valor                          |
|-------------|--------------------------------|
| **Estado**  | Aceptado                       |
| **Fecha**   | 2026-06                        |
| **Autores** | Sergio Uribe Frenkel           |
| **Proyecto**| SuriUI — `@suribef/suri-ui`    |
| **Versión que introduce el fix** | `0.1.1`   |
| **Versión afectada** | `0.1.0`               |

---

## Contexto

`@suribef/suri-ui@0.1.0` fue publicada con la siguiente configuración de externals en `vite.config.ts`:

```ts
// v0.1.0 — configuración incompleta
rollupOptions: {
  external: ['react', 'react-dom']
}
```

Al instalar la librería en un proyecto consumidor y ejecutar los tests, se producían dos errores:

```
Error 1:
  require() of ES Module .../react/jsx-runtime.js not supported.
  Did you mean to use dynamic import()?

Error 2:
  TypeError: recentlyCreatedOwnerStacks is not a function
  (React 18 vs React 19 API mismatch)
```

Ambos errores desaparecían al reemplazar los imports de SuriUI con mocks. El diagnóstico apuntaba directamente al bundle de la librería, no al código del consumidor.

---

## Diagnóstico raíz

### Cómo `@vitejs/plugin-react` transforma el JSX

El transform de JSX de React tiene dos modos:

**Modo clásico (React 16 y anteriores):**
```tsx
// Fuente
const el = <Button>Click</Button>

// Transformado — importa desde 'react'
const el = React.createElement(Button, null, 'Click')
```

**Modo automático (React 17+ — el default en `@vitejs/plugin-react`):**
```tsx
// Fuente
const el = <Button>Click</Button>

// Transformado — importa desde 'react/jsx-runtime'
import { jsx as _jsx } from 'react/jsx-runtime'
const el = _jsx(Button, { children: 'Click' })
```

`@vitejs/plugin-react` usa el modo automático por defecto. Esto significa que **el código compilado de SuriUI no importa desde `'react'` para el JSX — importa desde `'react/jsx-runtime'`**.

### Por qué el external incompleto produce el bundle roto

Vite procesa los externos durante el build de la librería:

```
vite build
  → Vite encuentra: import { jsx } from 'react/jsx-runtime'
  → Vite verifica rollupOptions.external: ['react', 'react-dom']
  → 'react/jsx-runtime' NO está en la lista
  → Vite bundlea react/jsx-runtime DENTRO de dist/suri-ui.js
```

El bundle resultante contiene una copia completa de `react/jsx-runtime` incrustada. Cuando el proyecto consumidor instala SuriUI y ejecuta su build:

```
Árbol de React en el proyecto consumidor:
  node_modules/react/jsx-runtime      ← versión del consumidor (ej. React 18.3)
  dist/suri-ui.js (bundleado dentro)  ← versión capturada en el build de la librería
```

Hay **dos instancias de `jsx-runtime`** en el mismo proceso. React no está diseñado para coexistir con múltiples versiones de sí mismo — produce errores de mismatch de APIs internas como `recentlyCreatedOwnerStacks` (que solo existe en React 19, no en React 18).

El error `require() of ES Module` es consecuencia adicional: el `jsx-runtime` bundleado usa sintaxis CJS (`require()`), pero el bundle de SuriUI es ESM — la combinación es inválida.

### Por qué este bug no aparece durante el desarrollo de la librería

Durante el desarrollo de SuriUI (`npm run storybook`, `npm test`):

- El `jsx-runtime` que usa el código de SuriUI proviene de `node_modules/react/jsx-runtime` local
- Solo hay una instancia de React en el proceso
- No hay conflicto

El conflicto solo se manifiesta cuando **otra aplicación instala SuriUI como dependencia** y su propia versión de React coexiste con la copia bundleada. Es un bug que solo existe en el consumidor, invisible en el desarrollo de la librería.

Este es el patrón más difícil de diagnosticar en el desarrollo de librerías npm.

---

## Decisión

**Agregar `'react/jsx-runtime'` a `rollupOptions.external` en `vite.config.ts`.**

```ts
// vite.config.ts — v0.1.1
rollupOptions: {
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  output: {
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM'
    }
  }
}
```

Con este cambio, Vite trata `react/jsx-runtime` como un módulo externo — no lo bundlea, sino que deja la referencia como un import en el bundle de distribución que el consumidor debe resolver desde su propia instalación de React.

```
dist/suri-ui.js después del fix:
  import { jsx as _jsx } from 'react/jsx-runtime'  ← import externo, no bundleado

Al consumidor instalar SuriUI:
  node_modules/react/jsx-runtime  ← una sola instancia, la del consumidor
```

---

## Verificación del fix

```bash
npm run build
grep -c "jsx-runtime" dist/suri-ui.js
# Debe retornar 0 o solo referencias a imports externos
# NO debe aparecer el código fuente de jsx-runtime bundleado
```

La verificación correcta es buscar código de implementación de `jsx-runtime`, no solo la string. Una referencia `import { jsx } from 'react/jsx-runtime'` en el output es correcta (external reference). El problema sería ver líneas como `function jsxWithValidationDynamic(...)` — código de la implementación bundleado en el output.

---

## Regla generalizada: externals en librerías con JSX

Esta corrección establece la regla para todos los builds de librería con `@vitejs/plugin-react`:

```ts
// Lista mínima de externals para cualquier librería React con Vite
external: [
  'react',
  'react-dom',
  'react/jsx-runtime',      // ← requerido cuando plugin-react usa automatic JSX
  // Añadir según las peerDependencies de la librería:
  // 'react-dom/client',    // si se usa createRoot directamente
]
```

La regla de oro: **todo módulo que aparezca en `peerDependencies` debe estar en `external`, incluyendo sus sub-módulos internos que el transform automático genera**.

`react/jsx-runtime` no aparece como import explícito en el código fuente de SuriUI — ningún componente tiene `import { jsx } from 'react/jsx-runtime'`. El transform de Vite lo inyecta automáticamente al compilar JSX. Esto lo hace especialmente difícil de detectar sin conocer el mecanismo del automatic JSX transform.

---

## Por qué `package.json` no necesita cambio

`react/jsx-runtime` es un módulo interno de React — viene incluido en la instalación de `react`. No es un paquete separado en npm. Por lo tanto:

- **No** necesita aparecer en `peerDependencies` de SuriUI — ya está cubierto por `"react": ">=18"`
- **No** necesita ser instalado separadamente por el consumidor
- **Solo** necesita estar en `external` del build de Vite para que no sea bundleado

Agregar `"react/jsx-runtime": ">=18"` a `peerDependencies` sería incorrecto — ese identificador no es un paquete npm independiente.

---

## Impacto: bump de versión patch `0.1.0` → `0.1.1`

El fix es un cambio de build que no modifica la API pública de SuriUI. Ningún tipo, ninguna prop, ninguna interfaz cambia. El consumidor no necesita modificar su código — solo actualizar la versión instalada.

Según semver:
- **Patch** (`0.1.0` → `0.1.1`): corrección de bug sin cambio de API
- **Minor** (`0.1.0` → `0.2.0`): feature nueva sin romper API existente
- **Major** (`0.1.0` → `1.0.0`): cambio de API que rompe compatibilidad

`0.1.1` es el bump correcto. El bug afectaba a todos los consumidores de `0.1.0` — el patch debe publicarse y los consumidores deben actualizar.

---

## Consecuencias

### Positivas

- **Cero instancias duplicadas de React**: el consumidor usa su propia versión de `react/jsx-runtime` sin conflicto
- **Compatibilidad restaurada**: SuriUI funciona correctamente en proyectos con React 18 y React 19
- **Bundle más pequeño**: el código de `react/jsx-runtime` (~15KB) ya no está incrustado en el output

### Negativas y mitigaciones

| Consecuencia | Mitigación |
|--------------|------------|
| `0.1.0` sigue publicada en npm con el bug | Publicar `0.1.1` inmediatamente; documentar en el CHANGELOG |
| Proyectos que instalaron `0.1.0` antes del fix deben actualizar | La actualización es no-breaking — `npm update @suribef/suri-ui` es suficiente |

---

## Relación con ADR-002

ADR-002 documentó la decisión del dual format ESM+CJS y el problema de `"type": "module"`. Este ADR documenta un problema relacionado pero distinto: no es el formato del output, sino **qué módulos son tratados como externos vs bundleados**.

ADR-002: cómo nombrar los archivos de output para que el formato sea correcto.
ADR-021: qué módulos no deben aparecer dentro de esos archivos de output.

Ambos son problemas de la capa de distribución de la librería — invisibles en desarrollo, críticos en consumo.

---

## Alternativas consideradas y descartadas

| Alternativa | Razón de descarte |
|-------------|-------------------|
| Mantener `react/jsx-runtime` bundleado y forzar `"sideEffects": ["react/jsx-runtime"]` | No resuelve el problema de instancias múltiples — solo cambia cómo se procesa |
| Cambiar a JSX transform clásico (`{ runtime: 'classic' }` en plugin-react) | El modo clásico requiere `import React from 'react'` en cada archivo; más verboso; modo automático es el estándar actual |
| Exportar `react/jsx-runtime` como `peerDependency` separada | `react/jsx-runtime` no es un paquete npm independiente — ya viene con `react` |
| Workaround en el consumidor (mock de SuriUI en tests) | Resuelve los tests del consumidor pero no el bug de runtime en producción |

---

## Referencias

- [React — New JSX Transform (automatic runtime)](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)
- [Vite Library Mode — `rollupOptions.external`](https://vitejs.dev/guide/build.html#library-mode)
- [Rollup — `external` option](https://rollupjs.org/configuration-options/#external)
- [`@vitejs/plugin-react` — JSX runtime options](https://github.com/vitejs/vite-plugin-react)
- [npm semver — patch vs minor vs major](https://semver.org/)
- [ADR-002 — Dual Format ESM+CJS](./ADR-002-dual-format-esm-cjs.md)
