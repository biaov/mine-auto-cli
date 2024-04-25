import { copyFileSync } from 'fs'

const fileName = 'check.config.jsonc'
const inputPath = `./src/config/${fileName}`
const outputPath = `./dist/dist/${fileName}`

export default () => ({
  name: 'rollup-plugin-copy',
  closeBundle: () => {
    copyFileSync(inputPath, outputPath)
  }
})
