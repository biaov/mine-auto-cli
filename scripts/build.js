import { rewritePackage, copyAssets } from './hooks.js'

!(async () => {
  try {
    await rewritePackage()
    await copyAssets()
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
})()
