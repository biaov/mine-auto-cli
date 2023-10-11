import { createViteBuild, rewritePackage, copyAssets } from './hooks.js'

!(async () => {
  try {
    await createViteBuild()
    await rewritePackage()
    await copyAssets()
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
})()
