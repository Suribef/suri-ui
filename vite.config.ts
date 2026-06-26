import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import replace from '@rollup/plugin-replace'

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SuriUI',
      fileName: (format) => format === 'cjs' ? 'suri-ui.cjs' : 'suri-ui.js',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      plugins: [
        replace({
          preventAssignment: true,
          values: {
            'process.env.NODE_ENV': 'process.env.NODE_ENV'
          }
        })
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})
