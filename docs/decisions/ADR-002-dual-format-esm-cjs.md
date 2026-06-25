# ADR-002 · Dual Format ESM + CJS con extensiones `.js` / `.cjs`

| Campo       | Valor                          |
|-------------|--------------------------------|
| **Estado**  | Aceptado                       |
| **Fecha**   | 2026-06                        |
| **Autores** | Sergio Uribe Frenkel           |
| **Proyecto**| SuriUI — `@suribef/suri-ui`    |

---

## Contexto

Una librería publicada en npm debe ser consumible desde el mayor espectro posible de entornos JavaScript. Los ecosistemas actuales de frontend presentan una fragmentación crítica en el sistema de módulos:

| Entorno / Herramienta | Sistema de módulos esperado |
|----------------------|-----------------------------|
| Vite (app de consumidor) | ESM nativo |
| Next.js App Router | ESM nativo (Server Components) |
| Next.js Pages Router / bundlers legacy | CommonJS (`require()`) |
| Jest (sin transformación) | CommonJS |
| Node.js scripts utilitarios | Depende de `"type"` en su `package.json` |
| Webpack 4 (proyectos legacy) | CommonJS |
| Rollup / esbuild | ESM (pero con fallback CJS) |

Si SuriUI publicara solo ESM, fallaría silenciosamente en Next.js Pages Router. Si publicara solo CJS, perdería tree-shaking en bundlers modernos. La solución es el **dual package** — distribuir ambos formatos con un `package.json` que guía al bundler correcto.

El problema no trivial surge del campo `"type": "module"` en `package.json`.

---

## El bug de `"type": "module"` con extensiones `.js`

Cuando un `package.json` contiene `"type": "module"`, Node.js interpreta **todos los archivos `.js`** del paquete como ESM. Esto es correcto para el archivo ESM, pero el archivo CJS también tiene extensión `.js` por defecto en la configuración estándar de Vite.

**Escenario de falla:**
```json
// package.json del paquete (incorrecto)
{
  "type": "module",
  "main": "./dist/suri-ui.js",     // Node espera ESM aquí ✓
  "module": "./dist/suri-ui.js",   // bundler moderno ✓
  "exports": {
    ".": {
      "require": "./dist/suri-ui.js" // ← Node trata esto como ESM también ✗
    }
  }
}
```

Cuando `require('./dist/suri-ui.js')` se ejecuta en un entorno CommonJS, Node.js lanza:
```
Error [ERR_REQUIRE_ESM]: require() of ES Module .../suri-ui.js not supported.
```

Esto es un **error de runtime silencioso** — la librería compila correctamente pero falla al ser consumida. Especialmente problemático porque el desarrollador consumidor no puede diagnosticarlo fácilmente.

---

## Decisión

**Distribuir dos formatos con extensiones explícitas que codifican el sistema de módulos:**

| Archivo | Formato | Extensión | Interpretación por Node.js |
|---------|---------|-----------|---------------------------|
| `dist/suri-ui.js` | ESM | `.js` | ESM (correcto, por `"type":"module"`) |
| `dist/suri-ui.cjs` | CommonJS | `.cjs` | **Siempre CJS**, independientemente de `"type"` |

La extensión `.cjs` fue introducida por Node.js precisamente para resolver la ambigüedad: un archivo `.cjs` es **invariablemente CommonJS** sin importar el campo `"type"` del `package.json`.

### Configuración de Vite

```ts
// vite.config.ts
build: {
  lib: {
    entry: resolve(__dirname, 'src/index.ts'),
    name: 'SuriUI',
    formats: ['es', 'cjs'],
    fileName: (format) => format === 'cjs' ? 'suri-ui.cjs' : 'suri-ui.js'
    //                                        ↑ extensión explícita por formato
  }
}
```

### Configuración de `package.json`

```json
{
  "type": "module",
  "main": "./dist/suri-ui.cjs",
  "module": "./dist/suri-ui.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/suri-ui.js"
      },
      "require": {
        "types": "./dist/index.d.ts",
        "default": "./dist/suri-ui.cjs"
      }
    }
  }
}
```

**Orden de campos `exports` importa:**
La especificación de Node.js evalúa condiciones `exports` en orden de declaración. `import` debe ir antes de `require`. En TypeScript, `types` debe ir antes de `default` en cada condición para que el compiler encuentre las definiciones correctas.

---

## Razonamiento detallado

### Por qué `"type": "module"` es necesario

Sin `"type": "module"`, los archivos `.js` son interpretados como CommonJS. El archivo ESM (`suri-ui.js`) fallaría con:
```
SyntaxError: Cannot use import statement in a module
```
La librería usa `import`/`export` nativos, por lo que `"type": "module"` es requerido para que Node.js procese correctamente el entrypoint ESM.

### Por qué no eliminar `"type": "module"` y usar solo CJS

La ausencia de `"type": "module"` con un archivo ESM distribuido produce el error opuesto. Además, perdemos **tree-shaking**: los bundlers modernos (Vite, Rollup, esbuild) pueden eliminar código no usado solo de módulos ESM. Un bundle CJS-only aumenta el tamaño del bundle del consumidor.

### Por qué no usar la extensión `.mjs` para ESM

`.mjs` es la alternativa válida a `.cjs` para marcar ESM explícitamente. Fue descartada porque:

1. La convención de la industria para librerías publicadas es `suri-ui.js` (sin extensión especial) para el formato principal, que en presencia de `"type":"module"` es correctamente interpretado como ESM.
2. Algunos bundlers legacy (Webpack 4) no reconocen `.mjs` correctamente.
3. La simetría `.js` (ESM) + `.cjs` (CommonJS) es el patrón establecido por el ecosistema: Node.js core, Vite, Rollup, y la mayoría de librerías populares lo usan.

### Validación de la estrategia

```
dist/
├── suri-ui.js        # ESM — import { Button } from '@suribef/suri-ui'
├── suri-ui.cjs       # CJS — const { Button } = require('@suribef/suri-ui')
└── index.d.ts        # Tipos TypeScript compartidos por ambos formatos
```

Librerías de referencia que usan el mismo patrón: `date-fns`, `zod`, `react-hook-form`, `@radix-ui/*`.

---

## Consecuencias

### Positivas

- **Compatibilidad universal**: funciona en Vite, Next.js (App y Pages Router), Remix, Jest legacy, Webpack 4+
- **Tree-shaking habilitado**: bundlers modernos usan el formato ESM y eliminan exports no utilizados
- **Diagnóstico claro**: la extensión `.cjs` hace explícito el formato, eliminando la ambigüedad de `"type": "module"`
- **Tipos unificados**: un solo `index.d.ts` sirve a ambos formatos mediante los campos `types` en `exports`

### Negativas y mitigaciones

| Consecuencia | Mitigación |
|--------------|------------|
| Dos archivos en `dist/` en lugar de uno | El incremento de tamaño en npm es mínimo (~5KB para una librería pequeña); `"files": ["dist"]` limita lo que se publica |
| Configuración de `exports` más compleja | Documentada aquí y en README; es la configuración estándar de la industria |
| Posibles bugs con bundlers muy legacy (Webpack 3) | Fuera del scope de soporte; documentado en README como "requires Webpack 4+" |

---

## Alternativas consideradas y descartadas

| Alternativa | Razón de descarte |
|-------------|-------------------|
| Solo ESM (sin CJS) | Falla en Next.js Pages Router, Jest sin configuración, y proyectos legacy |
| Solo CJS | Pierde tree-shaking; incompatible con React Server Components |
| Extensión `.mjs` para ESM + `.cjs` para CJS | Mayor complejidad sin beneficio real; Webpack 4 tiene soporte parcial de `.mjs` |
| Eliminar `"type": "module"` y renombrar ESM a `.mjs` | Confuso para consumidores; Webpack 4 legacy issues |

---

## Referencias

- [Node.js Packages — Determining module system](https://nodejs.org/api/packages.html#determining-module-system)
- [Node.js — `.cjs` and `.mjs` extensions](https://nodejs.org/api/esm.html#mandatory-file-extensions)
- [Vite Library Mode — `fileName` option](https://vitejs.dev/guide/build.html#library-mode)
- [TypeScript `exports` conditions order](https://www.typescriptlang.org/docs/handbook/esm-node.html)
- [Publint — linter de package.json para publicación npm](https://publint.dev/)