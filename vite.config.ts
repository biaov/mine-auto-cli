import { defineConfig } from 'vite'
import { resolve } from 'path'
import external from './scripts/external'
import rollupPluginCopy from './scripts/rollup-plugin-copy'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
      '~': resolve(import.meta.dirname, './')
    }
  },
  build: {
    target: 'node20',
    outDir: './dist/dist',
    lib: {
      entry: './src/index.ts',
      formats: ['es']
    },
    rollupOptions: {
      external: [...external, 'path', 'child_process', 'fs'],
      output: {
        entryFileNames: '[name].js'
      },
      plugins: [rollupPluginCopy()]
    },
    ssr: false,
    ssrManifest: false,
    emptyOutDir: true
  }
})
