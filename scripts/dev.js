import chokidar from 'chokidar'
import { exec } from 'child_process'
import { resetPath } from './path.js'
import { log, debounce } from './hooks.js'

const watcher = chokidar.watch(resetPath('@/src'), {
  ignored: ['**/node_modules/**', '**/.git/**', '**/.vscode/**', '**/scripts/**', '**/dist/**'],
  ignoreInitial: true,
  ignorePermissionErrors: true,
  disableGlobbing: true
})

watcher.on(
  'all',
  debounce(() => {
    exec('npm run build', (error, studot) => {
      log(error, studot)
    })
  }, 2000)
)
