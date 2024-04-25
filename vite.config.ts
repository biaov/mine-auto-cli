import { defineConfig } from 'vite'
import { resolve } from 'path'
import rollupPluginCopy from './scripts/rollup-plugin-copy'

const { dirname } = import.meta

const outDir = resolve(dirname, './dist/dist')

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
      external: ['update-notifier', 'url', 'path', 'child_process', 'fs', 'chalk', 'commander', 'log-symbols', 'ora', 'pacote', 'strip-json-comments'],
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
