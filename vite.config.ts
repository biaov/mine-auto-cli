import { defineConfig } from 'vite'
import { resolve } from 'path'
import rollupPluginCopy from './scripts/rollup-plugin-copy'
import pkg from './package.json'

const { dirname } = import.meta

const outDir = resolve(dirname, './dist/dist')

const external = Object.keys(pkg.dependencies)

export default defineConfig({
  root: dirname,
  resolve: {
    alias: {
      '@': resolve(dirname, './src'),
      '~': resolve(dirname, './')
    }
  },
  build: {
    target: 'node20',
    outDir,
    lib: {
      entry: resolve(dirname, './src/index.ts'),
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
