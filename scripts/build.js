import { rewritePackage, copyAssets } from './hooks.js'

!(async () => {
  try {
    await Promise.all([rewritePackage(), copyAssets()])
  } catch (e) {
    process.exit(1)
  }
})()
