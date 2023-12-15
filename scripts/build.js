import { rewritePackage, copyAssets } from './hooks.js'

!(async () => {
  try {
    await Promise.all([rewritePackage(), copyAssets()])
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
})()
